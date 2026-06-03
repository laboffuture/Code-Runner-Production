import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdir, readdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { getLogger } from '@code-runner/shared';
import { ContainerPool } from './container-pool';

const execAsync = promisify(exec);
const logger = getLogger('docker-executor');

// Platform detection
const isWindows = process.platform === 'win32';

// Container pool instance (singleton)
let containerPool: ContainerPool | null = null;

// =============================================================================
// Types
// =============================================================================

export interface ExecutionFile {
  name: string;
  type: 'image' | 'text' | 'data';
  data: string; // base64 for binary, plain text for text files
  mimeType: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: 'Success' | 'Error' | 'Timeout';
  executionTime: number;
  files?: ExecutionFile[];
  exitCode?: number;
}

export interface TestCaseResult {
  input: string;
  expected_output: string;
  actual_output: string;
  status: 'passed' | 'failed';
  error?: string;
}

/**
 * A pygame GRADE-mode directive parsed off the first test-input line.
 *  - 'state': inspect the real window after the run (args = probe names like
 *    WINDOW_SIZE, CAPTION, BG_COLOR, PIXEL@x,y).
 *  - 'events': feed a scripted key-event sequence (args = event tokens like LEFT, UP).
 */
interface PygameGradeDirective {
  kind: 'state' | 'events';
  args: string[];
}

// =============================================================================
// Docker Executor Class
// =============================================================================

export class DockerExecutor {
  private static readonly EXECUTION_TIMEOUT = 5000; // 5 seconds for student code
  private static readonly CONTAINER_CREATION_TIMEOUT = 30000; // 30 seconds for container creation
  private static readonly MAX_OUTPUT_BUFFER = 10 * 1024 * 1024; // 10MB max output
  private static readonly IMAGE_NAME = 'python-code-runner';
  private static initialized = false;
  private static dockerAvailable = false;

  // ==========================================================================
  // Initialization
  // ==========================================================================

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('Initializing Docker executor');

    // Check Docker daemon availability (Issue #25)
    await this.checkDockerAvailability();

    // Ensure Docker image exists
    await this.ensureImageExists();

    // Initialize container pool if enabled
    if (ContainerPool.isEnabled()) {
      logger.info('Container pooling enabled - initializing pool');
      containerPool = new ContainerPool({
        imageName: this.IMAGE_NAME,
      });
      await containerPool.initialize();
      logger.info('Container pool initialized successfully');
    } else {
      logger.info('Container pooling disabled - using per-execution containers');
    }

    // Cleanup any stale temp files from previous runs (Issue #22)
    await this.cleanupStaleTempFiles();

    this.initialized = true;
    logger.info('Docker executor initialized successfully');
  }

  /**
   * Check if Docker daemon is available (Issue #25)
   */
  private static async checkDockerAvailability(): Promise<void> {
    try {
      await execAsync('docker info', { timeout: 10000 });
      this.dockerAvailable = true;
      logger.info('Docker daemon is available');
    } catch (error) {
      this.dockerAvailable = false;
      const message = 'Docker daemon is not available. Please ensure Docker is running.';
      logger.error(message, { error: String(error) });
      throw new Error(message);
    }
  }

  /**
   * Cleanup stale temp files from previous runs (Issue #22)
   */
  private static async cleanupStaleTempFiles(): Promise<void> {
    try {
      const tempDir = tmpdir();
      const files = await readdir(tempDir);
      const staleFiles = files.filter(f => f.startsWith('exec_') && (f.endsWith('.py') || f.endsWith('.txt')));

      for (const file of staleFiles) {
        try {
          await unlink(join(tempDir, file));
        } catch {
          // Ignore errors for individual files
        }
      }

      if (staleFiles.length > 0) {
        logger.info(`Cleaned up ${staleFiles.length} stale temp files`);
      }
    } catch (error) {
      logger.warn('Failed to cleanup stale temp files', { error: String(error) });
    }
  }

  // ==========================================================================
  // Code Preprocessing
  // ==========================================================================

  /**
   * Preprocess Python code for matplotlib and pygame compatibility
   * Issues #5, #11: Auto-transform plt.show() and configure backends
   */
  private static preprocessCode(
    code: string,
    mode: 'run' | 'grade' = 'run',
    gradeDirective: PygameGradeDirective | null = null
  ): string {
    let processedCode = code;

    // Handle matplotlib
    if (this.usesMatplotlib(code)) {
      processedCode = this.preprocessMatplotlib(processedCode);
    }

    // Handle pygame
    if (this.usesPygame(code)) {
      processedCode = this.preprocessPygame(processedCode, mode, gradeDirective);
    }

    return processedCode;
  }

  /**
   * Parse a pygame grading directive off the FIRST line of the test input.
   *   "__PYGAME_STATE__ WINDOW_SIZE CAPTION BG_COLOR PIXEL@400,250"
   *   "__PYGAME_EVENTS__ LEFT LEFT UP"
   * Returns the parsed directive (or null) and the remaining input (the directive
   * line stripped) to feed the container as the student's real stdin.
   */
  private static parsePygameDirective(input: string): {
    directive: PygameGradeDirective | null;
    remainingInput: string;
  } {
    const nl = input.indexOf('\n');
    const firstLine = (nl === -1 ? input : input.slice(0, nl)).trim();
    const rest = nl === -1 ? '' : input.slice(nl + 1);

    if (firstLine.startsWith('__PYGAME_STATE__')) {
      const args = firstLine.replace('__PYGAME_STATE__', '').trim().split(/\s+/).filter(Boolean);
      return { directive: { kind: 'state', args }, remainingInput: rest };
    }
    if (firstLine.startsWith('__PYGAME_EVENTS__')) {
      const args = firstLine.replace('__PYGAME_EVENTS__', '').trim().split(/\s+/).filter(Boolean);
      return { directive: { kind: 'events', args }, remainingInput: rest };
    }
    return { directive: null, remainingInput: input };
  }

  private static usesMatplotlib(code: string): boolean {
    return /(?:import\s+matplotlib|from\s+matplotlib|import\s+pyplot|plt\.)/.test(code);
  }

  private static usesPygame(code: string): boolean {
    return /(?:import\s+pygame|from\s+pygame)/.test(code);
  }

  /**
   * Preprocess matplotlib code (Issue #11)
   */
  private static preprocessMatplotlib(code: string): string {
    // Ensure matplotlib backend is set at the very beginning
    const matplotlibSetup = `import matplotlib
matplotlib.use('Agg')
`;

    // Check if matplotlib is already imported
    const hasMatplotlibImport = /^(?:import\s+matplotlib|from\s+matplotlib)/m.test(code);

    if (hasMatplotlibImport) {
      // Insert backend setup before the first matplotlib import
      code = code.replace(
        /^((?:import\s+matplotlib|from\s+matplotlib)[^\n]*)/m,
        `${matplotlibSetup}$1`
      );
    } else {
      // Add at the beginning
      code = matplotlibSetup + code;
    }

    // Transform plt.show() to plt.savefig() (Issue #4, #13)
    let figureCounter = 0;
    code = code.replace(/plt\.show\s*\(\s*\)/g, () => {
      figureCounter++;
      const filename = figureCounter === 1 ? 'plot.png' : `plot_${figureCounter}.png`;
      return `plt.savefig('${filename}', dpi=100, bbox_inches='tight', facecolor='white'); plt.close(); print('[OUTPUT_FILE:${filename}]')`;
    });

    return code;
  }

  /**
   * Preprocess pygame code for headless operation
   * Issues #28-31: Make pygame work in headless container
   *
   * Strategy:
   *   1. Set SDL_VIDEODRIVER=dummy so pygame.display works without a real screen
   *   2. Defer pygame.quit() so the surface stays alive for capture
   *   3. Limit infinite game loops (while True / while running / etc.) to 5 iterations
   *   4. Append frame-capture code that saves the surface after the user code finishes
   */
  private static preprocessPygame(
    code: string,
    mode: 'run' | 'grade' = 'run',
    gradeDirective: PygameGradeDirective | null = null
  ): string {
    const isEvents = mode === 'grade' && gradeDirective?.kind === 'events';

    // Shared headless setup (one source of truth so the run/grade paths can't drift).
    const sdlHeadless = `import os
os.environ['SDL_VIDEODRIVER'] = 'dummy'
os.environ['SDL_AUDIODRIVER'] = 'dummy'
`;

    // Student-body transforms (identical to before): defer pygame.quit() so the
    // surface survives for inspection, and cap infinite game loops so the program
    // terminates. Events mode needs a higher cap so every scripted event is processed.
    const loopCap = isEvents ? gradeDirective!.args.length + 5 : 5;
    let body = code.replace(
      /pygame\.quit\s*\(\s*\)/g,
      '_pygame_runner_quit_deferred = True  # pygame.quit() deferred by runner'
    );
    body = body.replace(
      /while\s+(True|running|not\s+done|game_running|is_running)\s*:/g,
      `_frame_count = 0\nwhile $1 and _frame_count < ${loopCap}:\n    _frame_count += 1`
    );

    // GRADE mode with a directive: replace the visual image-capture with a text probe
    // (state inspection) or feed scripted events. Banner suppressed for clean matching.
    // CONTRACT: in state mode the graded stdout is the student's output PLUS the PROBE
    // lines appended at the end, compared exactly — so a converted "state" problem's
    // expected_output must be exactly the PROBE lines and its reference solution must
    // print nothing else (verify real-pass/cheat-fail per problem at conversion time).
    if (mode === 'grade' && gradeDirective) {
      const gradeHeadless = sdlHeadless + "os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = 'hide'\n";
      if (gradeDirective.kind === 'events') {
        return gradeHeadless + this.buildPygameEventShim(gradeDirective.args) + '\n' + body;
      }
      return gradeHeadless + body + this.buildPygameStateProbe(gradeDirective.args);
    }

    // RUN mode (or grade with no directive): byte-for-byte today's behavior — inject
    // headless before the pygame import, then append the visual image-capture block.
    const headlessSetup = sdlHeadless;
    const hasPygameImport = /^(?:import\s+pygame|from\s+pygame)/m.test(body);
    if (hasPygameImport) {
      body = body.replace(
        /^((?:import\s+pygame|from\s+pygame)[^\n]*)/m,
        `${headlessSetup}$1`
      );
    } else {
      body = headlessSetup + body;
    }

    // Append frame-capture code that runs after the user code finishes
    const captureCode = `

# --- Auto frame capture injected by runner ---
try:
    import pygame as _pg
    _surface = _pg.display.get_surface()
    if _surface is not None:
        _pg.image.save(_surface, 'pygame_output.png')
        print('[OUTPUT_FILE:pygame_output.png]')
        print('Pygame window captured successfully')
        import time as _time
        for _i in range(1, 4):
            _pg.display.flip()
            _time.sleep(0.1)
            _pg.image.save(_surface, f'frame_{_i}.png')
            print(f'[OUTPUT_FILE:frame_{_i}.png]')
    else:
        print('No pygame surface found to capture')
except Exception as _capture_err:
    print(f'Frame capture error: {_capture_err}')
finally:
    try:
        import pygame as _pg
        _pg.quit()
    except Exception:
        pass
`;

    return body + captureCode;
  }

  /**
   * Build the GRADE-mode state probe: after the student code runs, read the REAL
   * window state from the live surface and print deterministic "PROBE ..." lines.
   * A solution that never created a window prints "PROBE: NO_WINDOW" and fails.
   */
  private static buildPygameStateProbe(probes: string[]): string {
    const lines: string[] = [];
    for (const p of probes) {
      if (p === 'WINDOW_SIZE') {
        lines.push('        _w,_h=_s.get_size(); print(f"PROBE WINDOW_SIZE={_w}x{_h}")');
      } else if (p === 'CAPTION') {
        lines.push('        print(f"PROBE CAPTION={_pg.display.get_caption()[0]}")');
      } else if (p === 'BG_COLOR') {
        lines.push('        _r,_g,_b=_s.get_at((1,1))[:3]; print(f"PROBE BG_COLOR={_r},{_g},{_b}")');
      } else if (p.startsWith('PIXEL@')) {
        const [xs, ys] = p.slice('PIXEL@'.length).split(',');
        const x = parseInt(xs, 10) || 0;
        const y = parseInt(ys, 10) || 0;
        lines.push(`        _r,_g,_b=_s.get_at((${x},${y}))[:3]; print(f"PROBE PIXEL@${x},${y}={_r},{_g},{_b}")`);
      }
    }
    if (lines.length === 0) lines.push('        pass');
    return `

# --- grade-mode state probe (injected by runner) ---
try:
    import pygame as _pg
    _s = _pg.display.get_surface()
    if _s is None:
        print("PROBE: NO_WINDOW")
    else:
${lines.join('\n')}
    _pg.quit()
except Exception:
    print("PROBE: NO_WINDOW")
`;
  }

  /**
   * Build the GRADE-mode event shim: monkeypatch pygame.event.get() to yield a
   * deterministic scripted key sequence (then QUIT), so an interactive program's
   * responses become observable on stdout. Runs before the student code.
   */
  private static buildPygameEventShim(tokens: string[]): string {
    const safe = tokens.filter((t) => /^[A-Za-z0-9_]+$/.test(t));
    const pyList = JSON.stringify(safe); // e.g. ["LEFT","LEFT","UP"] — valid Python list
    return `import os
os.environ.setdefault('SDL_VIDEODRIVER', 'dummy')
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = 'hide'
import pygame as _pg
_pg.init()
_KEYMAP = {"LEFT": _pg.K_LEFT, "RIGHT": _pg.K_RIGHT, "UP": _pg.K_UP, "DOWN": _pg.K_DOWN, "SPACE": _pg.K_SPACE, "RETURN": _pg.K_RETURN, "ESCAPE": _pg.K_ESCAPE}
_script = ${pyList}
_q = []
for _n in _script:
    if _n in _KEYMAP:
        _q.append(_pg.event.Event(_pg.KEYDOWN, key=_KEYMAP[_n]))
_q.append(_pg.event.Event(_pg.QUIT))
def _scripted_get(*_a, **_k):
    return [_q.pop(0)] if _q else [_pg.event.Event(_pg.QUIT)]
_pg.event.get = _scripted_get
`;
  }

  // ==========================================================================
  // Main Execution Methods
  // ==========================================================================

  /**
   * Execute Python code in a sandboxed Docker container
   */
  static async executeCode(
    code: string,
    input: string = '',
    mode: 'run' | 'grade' = 'run'
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // In GRADE mode, a pygame problem may carry a grading directive on the FIRST
      // input line — "__PYGAME_STATE__ WINDOW_SIZE CAPTION BG_COLOR" (inspect the real
      // window state) or "__PYGAME_EVENTS__ LEFT LEFT UP" (feed scripted key events).
      // We parse it, strip it from the container stdin, and use it to build a grade
      // harness instead of the visual image-capture. No directive (or RUN mode, or
      // non-pygame) => byte-for-byte today's behavior.
      let containerInput = input;
      let gradeDirective: PygameGradeDirective | null = null;
      if (mode === 'grade' && this.usesPygame(code)) {
        const parsed = this.parsePygameDirective(input);
        gradeDirective = parsed.directive;
        containerInput = parsed.remainingInput;
      }

      // Preprocess code for matplotlib/pygame (Issue #11)
      const processedCode = this.preprocessCode(code, mode, gradeDirective);

      // Use container pool if enabled
      if (containerPool) {
        return await this.executeWithPool(processedCode, containerInput, startTime);
      } else {
        return await this.executeWithFreshContainer(processedCode, containerInput, startTime);
      }

    } catch (error) {
      logger.error('Docker execution error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        stdout: '',
        stderr: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'Error',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute using container pool (faster, reuses containers)
   */
  private static async executeWithPool(
    code: string,
    input: string,
    startTime: number
  ): Promise<ExecutionResult> {
    let containerId: string | null = null;

    try {
      // Acquire container from pool
      containerId = await containerPool!.acquire();

      // Execute code in pooled container
      const result = await this.runCodeInContainer(containerId, code, input);

      // Release container back to pool (with cleanup)
      await containerPool!.release(containerId, true);

      return {
        ...result,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      // If execution failed, release container without cleanup (will be destroyed)
      if (containerId) {
        await containerPool!.release(containerId, false).catch(() => {});
      }
      throw error;
    }
  }

  /**
   * Execute using fresh container (Issue #16 - FIXED)
   * Previous bug: Container had no command and died immediately
   */
  private static async executeWithFreshContainer(
    code: string,
    input: string,
    startTime: number
  ): Promise<ExecutionResult> {
    const containerName = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const containerId = await this.createFreshContainer(containerName);

    try {
      // Execute code in container
      const result = await this.runCodeInContainer(containerId, code, input);

      return {
        ...result,
        executionTime: Date.now() - startTime
      };
    } finally {
      // Cleanup container
      await this.destroyContainer(containerId);
    }
  }

  /**
   * Execute code against multiple test cases (Issue #20 - Optimized)
   * Now batches test cases when possible
   */
  // ──────────────────────────────────────────────────────────────────────────
  // Output comparison helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Normalize a program output string for comparison:
   * - Strip leading/trailing whitespace from the whole string
   * - Normalize line endings to \n
   * - Strip trailing whitespace from each line
   */
  private static normalizeOutput(s: string): string {
    return s
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  }

  /**
   * Compare two single-line tokens: exact match first, then float approximate.
   * Uses a relative tolerance of 1e-4 so 1.0 === 1, 3.14159 ≈ 3.1416, etc.
   */
  private static tokensMatch(actual: string, expected: string): boolean {
    if (actual === expected) return true;
    // Only fall back to float-tolerant comparison when BOTH tokens are a whole
    // number — applied symmetrically so a non-numeric token can't slip through
    // parseFloat's partial parse (parseFloat('50x') === 50 would otherwise let
    // '50' match '50x'). One regex defines "is a clean numeric token"; checking
    // it on both sides before parseFloat also avoids any &&/|| precedence trap.
    const numRe = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;
    const a = actual.trim();
    const e = expected.trim();
    if (numRe.test(a) && numRe.test(e)) {
      const fa = parseFloat(a);
      const fe = parseFloat(e);
      if (isFinite(fa) && isFinite(fe)) {
        const tol = Math.max(1e-4, Math.abs(fe) * 1e-4);
        return Math.abs(fa - fe) <= tol;
      }
    }
    return false;
  }

  /**
   * Returns true when actual and expected outputs are equivalent.
   * Comparison order:
   *  1. Exact match after normalization
   *  2. Line-by-line float-tolerant match
   */
  private static outputsMatch(actual: string, expected: string): boolean {
    const na = this.normalizeOutput(actual);
    const ne = this.normalizeOutput(expected);
    if (na === ne) return true;

    const aLines = na.split('\n');
    const eLines = ne.split('\n');
    if (aLines.length !== eLines.length) return false;

    return aLines.every((al, i) => this.tokensMatch(al, eLines[i]));
  }

  // ──────────────────────────────────────────────────────────────────────────

  static async executeWithTestCases(
    code: string,
    testCases: Array<{ input: string; expected_output: string; is_hidden?: boolean }>
  ): Promise<{
    results: TestCaseResult[];
    passed: number;
    failed: number;
    totalExecutionTime: number;
  }> {
    const startTime = Date.now();
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        // executeCode() owns preprocessing (matplotlib/pygame). Pass the RAW
        // code so it is preprocessed exactly once per run — preprocessing the
        // already-processed code here doubled the pygame capture block.
        // GRADE mode: a pygame problem's test input may carry a __PYGAME_STATE__ /
        // __PYGAME_EVENTS__ directive that swaps the visual capture for a text probe.
        const execution = await this.executeCode(code, testCase.input, 'grade');

        const actualOutput   = this.normalizeOutput(execution.stdout);
        const expectedOutput = this.normalizeOutput(testCase.expected_output);

        // Issue #17 FIX: Check status based on exit code, not stderr presence
        // Also use float-tolerant comparison for numeric outputs
        const passed =
          execution.status === 'Success' &&
          this.outputsMatch(actualOutput, expectedOutput);

        results.push({
          input: testCase.input,
          expected_output: expectedOutput,
          actual_output: actualOutput,
          status: passed ? 'passed' : 'failed',
          error: execution.status === 'Error' ? execution.stderr : undefined
        });
      } catch (error) {
        results.push({
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      results,
      passed,
      failed,
      totalExecutionTime: Date.now() - startTime
    };
  }

  // ==========================================================================
  // Container Management
  // ==========================================================================

  /**
   * Create a fresh container for one-time execution (Issue #16 - FIXED)
   * Key fix: Add keep-alive command so container doesn't die immediately
   */
  private static async createFreshContainer(name: string): Promise<string> {
    try {
      // Issue #21: Add timeout to container creation
      const dockerCmd = [
        'docker run -d',
        `--name ${name}`,
        '--network none',
        '--memory 128m',
        '--memory-swap 128m',        // disable swap so it can't bypass the memory cap
        '--cpus=0.5',
        '--pids-limit 64',           // block fork/thread bombs from exhausting host PIDs
        '--cap-drop ALL',            // drop all Linux capabilities (none needed to run Python)
        '--security-opt no-new-privileges',  // prevent privilege escalation inside the container
        '--read-only',
        '--tmpfs /tmp:size=50m,mode=1777',
        '--user 1000:1000',
        this.IMAGE_NAME,
        // CRITICAL FIX: Keep container alive with sleep command
        'sh', '-c', '"while true; do sleep 3600; done"'
      ].join(' ');

      const { stdout } = await execAsync(dockerCmd, {
        timeout: this.CONTAINER_CREATION_TIMEOUT,
        maxBuffer: this.MAX_OUTPUT_BUFFER
      });

      const containerId = stdout.trim();

      // Issue #10: Verify container is actually running
      await this.waitForContainerReady(containerId);

      logger.debug('Created fresh container', { name, containerId: containerId.substring(0, 12) });
      return containerId;

    } catch (error) {
      logger.error('Failed to create container', {
        name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Container creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wait for container to be ready (Issue #10, #15)
   */
  private static async waitForContainerReady(containerId: string, maxAttempts = 10): Promise<void> {
    const delayMs = 200;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const { stdout } = await execAsync(
          `docker inspect -f "{{.State.Running}}" ${containerId}`,
          { timeout: 3000 }
        );

        // Issue #19: Handle Windows quote differences
        const isRunning = stdout.trim().replace(/['"]/g, '') === 'true';

        if (isRunning) {
          // Additional delay for Python interpreter to be ready
          await new Promise(resolve => setTimeout(resolve, 100));
          return;
        }
      } catch {
        // Container might not exist yet
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Container failed to start within timeout');
  }

  /**
   * Destroy a container
   */
  private static async destroyContainer(containerId: string): Promise<void> {
    try {
      // Force remove (no need to stop first with -f)
      await execAsync(`docker rm -f ${containerId}`, { timeout: 10000 });
    } catch (error) {
      logger.warn('Failed to destroy container', {
        containerId: containerId.substring(0, 12),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ==========================================================================
  // Code Execution in Container
  // ==========================================================================

  /**
   * Run code inside a container
   * Issues fixed: #5, #6, #9, #13, #14, #17, #27
   */
  private static async runCodeInContainer(
    containerId: string,
    code: string,
    input: string
  ): Promise<Omit<ExecutionResult, 'executionTime'>> {
    const sessionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const workDir = `/tmp/${sessionId}_work`;
    const hostCodePath = join(tmpdir(), `${sessionId}.py`);
    const hostInputPath = join(tmpdir(), `${sessionId}.txt`);

    // Track files we create for cleanup
    const hostFilesToCleanup: string[] = [hostCodePath];
    if (input) hostFilesToCleanup.push(hostInputPath);

    try {
      // Create working directory in container
      await this.execInContainer(containerId, `mkdir -p ${workDir}`);

      // Write code to host temp file
      await writeFile(hostCodePath, code, 'utf8');

      // Copy code file to container using stdin piping (Windows compatible)
      const catCommand = isWindows ? 'type' : 'cat';
      await execAsync(
        `${catCommand} "${hostCodePath}" | docker exec -i ${containerId} sh -c "cat > ${workDir}/${sessionId}.py"`,
        { timeout: 5000, maxBuffer: this.MAX_OUTPUT_BUFFER }
      );

      // Write input file if provided
      if (input) {
        await writeFile(hostInputPath, String(input), 'utf8');
        await execAsync(
          `${catCommand} "${hostInputPath}" | docker exec -i ${containerId} sh -c "cat > ${workDir}/${sessionId}.txt"`,
          { timeout: 5000, maxBuffer: this.MAX_OUTPUT_BUFFER }
        );
      }

      // Execute Python code with timeout (pygame gets more time for setup + frame capture)
      const isPygame = this.usesPygame(code);
      const timeoutMs = isPygame ? 15000 : this.EXECUTION_TIMEOUT;
      const timeoutSec = timeoutMs / 1000;
      const pythonCmd = input
        ? `cd ${workDir} && cat ${sessionId}.txt | timeout ${timeoutSec} python ${sessionId}.py`
        : `cd ${workDir} && timeout ${timeoutSec} python ${sessionId}.py`;

      let stdout = '';
      let stderr = '';
      let exitCode = 0;
      let timedOut = false;

      try {
        // Issue #27: Add maxBuffer to prevent overflow
        // Execute and capture exit code separately to avoid shell quoting issues
        const result = await Promise.race([
          execAsync(`docker exec ${containerId} sh -c "${pythonCmd}"`, {
            maxBuffer: this.MAX_OUTPUT_BUFFER,
            timeout: timeoutMs + 2000 // Extra buffer for Docker overhead
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              timedOut = true;
              reject(new Error('Execution timeout'));
            }, timeoutMs + 1000);
          })
        ]);

        stdout = result.stdout || '';
        stderr = result.stderr || '';
      } catch (error: any) {
        stdout = error.stdout || '';
        stderr = error.stderr || '';

        if (timedOut || error.message === 'Execution timeout') {
          stderr = `Code execution timed out (${timeoutSec} seconds limit)`;
          exitCode = 124; // Standard timeout exit code
        } else if (error.code !== undefined) {
          // exec returns error with code property for non-zero exit codes
          exitCode = error.code;
        } else {
          exitCode = 1; // Default to error
        }
      }

      // Issue #4, #13, #14: Extract files BEFORE cleanup
      const files = await this.extractFilesFromContainer(containerId, workDir, stdout);

      // Filter out [OUTPUT_FILE:...] markers from stdout
      stdout = stdout.replace(/\[OUTPUT_FILE:[^\]]+\]/g, '').trim();

      // Cleanup working directory in container
      await this.execInContainer(containerId, `rm -rf ${workDir}`).catch(() => {});

      // Issue #17 FIX: Determine status based on exit code, not stderr presence
      // Exit code 0 = success (even if there are warnings in stderr)
      // Exit code 124 = timeout
      // Other exit codes = error
      let status: 'Success' | 'Error' | 'Timeout';
      if (timedOut || exitCode === 124) {
        status = 'Timeout';
      } else if (exitCode === 0) {
        status = 'Success';
      } else {
        status = 'Error';
      }

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        status,
        files: files.length > 0 ? files : undefined,
        exitCode
      };

    } catch (error) {
      logger.error('Code execution error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        stdout: '',
        stderr: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'Error'
      };

    } finally {
      // Issue #22: Always cleanup host temp files
      for (const file of hostFilesToCleanup) {
        await unlink(file).catch(() => {});
      }
    }
  }

  /**
   * Execute a command in container with timeout
   */
  private static async execInContainer(containerId: string, command: string, timeout = 5000): Promise<string> {
    const { stdout } = await execAsync(
      `docker exec ${containerId} sh -c "${command}"`,
      { timeout, maxBuffer: this.MAX_OUTPUT_BUFFER }
    );
    return stdout;
  }

  // ==========================================================================
  // File Extraction (Issues #4, #6, #9, #13, #14)
  // ==========================================================================

  /**
   * Extract generated files from container before cleanup
   */
  private static async extractFilesFromContainer(
    containerId: string,
    workDir: string,
    stdout: string
  ): Promise<ExecutionFile[]> {
    const files: ExecutionFile[] = [];

    try {
      // Find files mentioned in stdout via [OUTPUT_FILE:...] markers
      const outputFileMatches = stdout.matchAll(/\[OUTPUT_FILE:([^\]]+)\]/g);
      const expectedFiles = new Set<string>();
      for (const match of outputFileMatches) {
        expectedFiles.add(match[1]);
      }

      // Also scan for common output files
      const commonPatterns = ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.csv', '*.json', '*.txt'];

      // List files in work directory
      let fileList = '';
      try {
        const { stdout: listOutput } = await execAsync(
          `docker exec ${containerId} sh -c "find ${workDir} -type f -name '*.png' -o -name '*.jpg' -o -name '*.csv' -o -name '*.json' 2>/dev/null || true"`,
          { timeout: 3000, maxBuffer: this.MAX_OUTPUT_BUFFER }
        );
        fileList = listOutput.trim();
      } catch {
        // No files found or error
      }

      if (!fileList && expectedFiles.size === 0) {
        return files;
      }

      // Combine found files with expected files
      const allFiles = new Set([
        ...fileList.split('\n').filter(Boolean),
        ...Array.from(expectedFiles).map(f => `${workDir}/${f}`)
      ]);

      for (const filePath of allFiles) {
        const fileName = filePath.split('/').pop() || 'output';

        try {
          // Determine file type
          const ext = fileName.split('.').pop()?.toLowerCase() || '';
          const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext);
          const isText = ['txt', 'csv', 'json', 'md'].includes(ext);

          if (isImage) {
            // Read binary file and convert to base64
            const { stdout: base64Data } = await execAsync(
              `docker exec ${containerId} sh -c "cat '${filePath}' | base64"`,
              { timeout: 5000, maxBuffer: this.MAX_OUTPUT_BUFFER }
            );

            files.push({
              name: fileName,
              type: 'image',
              data: base64Data.replace(/\s/g, ''), // Remove whitespace from base64
              mimeType: this.getMimeType(fileName)
            });
          } else if (isText) {
            // Read text file
            const { stdout: textData } = await execAsync(
              `docker exec ${containerId} sh -c "cat '${filePath}'"`,
              { timeout: 5000, maxBuffer: 1024 * 1024 } // 1MB max for text
            );

            files.push({
              name: fileName,
              type: 'text',
              data: textData,
              mimeType: this.getMimeType(fileName)
            });
          }
        } catch (error) {
          logger.warn(`Failed to extract file ${fileName}`, { error: String(error) });
        }
      }
    } catch (error) {
      logger.warn('Failed to extract files from container', { error: String(error) });
    }

    return files;
  }

  /**
   * Get MIME type for file extension
   */
  private static getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      md: 'text/markdown'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // ==========================================================================
  // Image Management
  // ==========================================================================

  /**
   * Ensure Docker image exists, build if necessary
   */
  private static async ensureImageExists(): Promise<void> {
    try {
      const { stdout } = await execAsync(`docker images -q ${this.IMAGE_NAME}`, { timeout: 10000 });
      if (stdout.trim()) {
        logger.info('Docker image exists', { image: this.IMAGE_NAME });
        return;
      }
    } catch (error) {
      logger.warn('Failed to check Docker image', { error: String(error) });
    }

    // Image doesn't exist, try to build it
    logger.info('Building Docker image', { image: this.IMAGE_NAME });

    const sandboxPath = join(process.cwd(), 'sandbox');

    if (!existsSync(sandboxPath)) {
      throw new Error(`Sandbox directory not found: ${sandboxPath}`);
    }

    try {
      await execAsync(`docker build -t ${this.IMAGE_NAME} .`, {
        cwd: sandboxPath,
        timeout: 300000, // 5 minutes for build
        maxBuffer: this.MAX_OUTPUT_BUFFER
      });
      logger.info('Docker image built successfully', { image: this.IMAGE_NAME });
    } catch (buildError) {
      // Check if image was built by another process
      try {
        const { stdout } = await execAsync(`docker images -q ${this.IMAGE_NAME}`);
        if (stdout.trim()) {
          logger.info('Docker image found (built externally)', { image: this.IMAGE_NAME });
          return;
        }
      } catch {}

      throw new Error(`Failed to build Docker image: ${buildError instanceof Error ? buildError.message : String(buildError)}`);
    }
  }

  // ==========================================================================
  // Monitoring & Shutdown
  // ==========================================================================

  /**
   * Get container pool statistics (for monitoring)
   */
  static getPoolStats() {
    if (!containerPool) {
      return {
        enabled: false,
        reason: 'Container pooling is disabled'
      };
    }

    return {
      enabled: true,
      ...containerPool.getStats()
    };
  }

  /**
   * Check if Docker is available
   */
  static isDockerAvailable(): boolean {
    return this.dockerAvailable;
  }

  /**
   * Shutdown container pool gracefully
   */
  static async shutdown(): Promise<void> {
    logger.info('Shutting down Docker executor');

    if (containerPool) {
      await containerPool.shutdown();
      containerPool = null;
    }

    this.initialized = false;
    logger.info('Docker executor shutdown complete');
  }
}
