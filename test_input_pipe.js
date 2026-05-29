const { exec } = require('child_process');
const { promisify } = require('util');
const { writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const execAsync = promisify(exec);

async function test() {
  // Write test input file with actual newline
  const input = 'Anya\n7th';
  const inputPath = join(tmpdir(), 'test_multiline_input.txt');
  writeFileSync(inputPath, input, 'utf8');
  console.log('Input string:', JSON.stringify(input));
  console.log('File path:', inputPath);

  // Get a running pool container
  const { stdout: poolOut } = await execAsync('docker ps --filter name=pool --format "{{.ID}}"');
  const containerId = poolOut.trim().split('\n')[0].trim();
  if (!containerId) { console.log('No pool container found'); return; }
  console.log('Container:', containerId.substring(0, 12));

  // Test: pipe file into container and check what gets written
  const cmd = `type "${inputPath}" | docker exec -i ${containerId} sh -c "cat > /tmp/debug_in.txt; echo '---'; xxd /tmp/debug_in.txt; echo '---'; wc -l /tmp/debug_in.txt"`;
  console.log('\nRunning via cmd.exe:', cmd);

  try {
    const { stdout, stderr } = await execAsync(cmd, { shell: 'cmd.exe' });
    console.log('stdout:', stdout);
    if (stderr) console.log('stderr:', stderr);
  } catch (e) {
    console.log('Error:', e.message);
    console.log('stdout:', e.stdout);
    console.log('stderr:', e.stderr);
  }

  // Also test: echo what python gets
  const pyScript = 'import sys\nfor i, line in enumerate(sys.stdin):\n    print(f"line {i}: {repr(line)}")';
  const scriptPath = join(tmpdir(), 'test_stdin.py');
  writeFileSync(scriptPath, pyScript, 'utf8');

  const cmd2 = `type "${inputPath}" | docker exec -i ${containerId} sh -c "python /tmp/test_stdin_container.py"`;
  // First copy the script
  await execAsync(`type "${scriptPath}" | docker exec -i ${containerId} sh -c "cat > /tmp/test_stdin_container.py"`, { shell: 'cmd.exe' });

  console.log('\nTesting Python stdin reading:');
  try {
    const { stdout: pyOut, stderr: pyErr } = await execAsync(cmd2, { shell: 'cmd.exe' });
    console.log('Python output:', pyOut);
    if (pyErr) console.log('Python stderr:', pyErr);
  } catch (e) {
    console.log('Python error:', e.message, e.stdout, e.stderr);
  }
}

test().catch(console.error);
