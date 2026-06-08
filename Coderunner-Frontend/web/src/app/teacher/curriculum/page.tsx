'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  Layers,
  ListChecks,
  Code2,
  Lightbulb,
  GraduationCap,
  FlaskConical,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types — mirror the parsed API bodies exactly                        */
/* ------------------------------------------------------------------ */

interface Case {
  problem_id: number;
  title: string;
  difficulty: string;
  case_number: number;
  hasGuide: boolean;
}

interface Session {
  session_id: number;
  title: string;
  cases: Case[];
}

interface Level {
  level_number: number;
  sessions: Session[];
}

interface TreeResponse {
  ageGroup: string;
  tree: Level[];
}

interface WalkthroughStep {
  label: string;
  code_snippet: string;
  explanation: string;
}

interface Guide {
  available: boolean;
  title: string;
  difficulty?: string;
  level_number?: number;
  session_id?: number;
  case_number?: number;
  question?: string;
  solution_code?: string;
  walkthrough?: WalkthroughStep[];
  student_explanation?: string;
  worked_example?: string;
  key_concepts?: string[];
  common_mistakes?: string[];
  verified?: boolean;
}

/* The case a teacher has opened into the guide reading view. We keep the
   surrounding session id so we can restore the open accordion on return. */
interface Selection {
  problemId: number;
  sessionId: number;
  levelNumber: number;
}

/* ------------------------------------------------------------------ */
/* Static class lookup maps — NEVER interpolate Tailwind color names    */
/* ------------------------------------------------------------------ */

type DifficultyStyle = { pill: string; dot: string };

const DIFFICULTY: Record<string, DifficultyStyle> = {
  intro: { pill: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  easy: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  medium: { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  hard: { pill: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  unknown: { pill: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

function diffKey(d: string | undefined): keyof typeof DIFFICULTY {
  const k = (d ?? '').toLowerCase();
  if (k === 'intro' || k === 'easy' || k === 'medium' || k === 'hard') return k;
  return 'unknown';
}

function diffLabel(d: string | undefined): string {
  const k = diffKey(d);
  return k.charAt(0).toUpperCase() + k.slice(1);
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function DifficultyPill({ difficulty, size = 'sm' }: { difficulty?: string; size?: 'sm' | 'md' }) {
  const style = DIFFICULTY[diffKey(difficulty)];
  const dims = size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[11px] px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-rajdhani font-semibold tracking-wide ${dims} ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {diffLabel(difficulty)}
    </span>
  );
}

/* A faint progress ring used on the session "ready" pill. Pure SVG —
   stroke colours are static, the only dynamic value is the dash length. */
function ProgressRing({ ratio }: { ratio: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 -rotate-90">
      <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" className="stroke-gray-200" />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-[#76B900]"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
      />
    </svg>
  );
}

function ReadyPill({ ready, total }: { ready: number; total: number }) {
  const done = total > 0 && ready === total;
  const ratio = total > 0 ? ready / total : 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-rajdhani text-xs font-semibold ${
        done
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-gray-50 text-gray-600'
      }`}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ProgressRing ratio={ratio} />}
      {ready}/{total} ready
    </span>
  );
}

/* A labelled section header used throughout the guide reading view. */
function SectionLabel({ icon: Icon, children }: { icon: typeof Code2; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-[#76B900]" />
      <h3 className="font-orbitron text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
        {children}
      </h3>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CurriculumGuide() {
  const [tree, setTree] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [openSessions, setOpenSessions] = useState<Set<number>>(new Set());

  const [selection, setSelection] = useState<Selection | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  /* ---- load the tree once ---- */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setTreeError(null);
    api.curriculum
      .getTree('11-14')
      .then((d) => {
        if (!alive) return;
        const body = d as TreeResponse;
        const levels = body?.tree ?? [];
        setTree(levels);
        setActiveLevel(levels.length > 0 ? levels[0].level_number : null);
      })
      .catch(() => {
        if (!alive) return;
        setTreeError('We could not load the curriculum. Please refresh to try again.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const currentLevel = useMemo(
    () => tree.find((l) => l.level_number === activeLevel) ?? null,
    [tree, activeLevel],
  );

  /* Aggregate counts for the active-level summary line. */
  const levelSummary = useMemo(() => {
    if (!currentLevel) return { sessions: 0, cases: 0, ready: 0 };
    let cases = 0;
    let ready = 0;
    for (const s of currentLevel.sessions) {
      cases += s.cases.length;
      ready += s.cases.filter((c) => c.hasGuide).length;
    }
    return { sessions: currentLevel.sessions.length, cases, ready };
  }, [currentLevel]);

  /* ---- interactions ---- */
  const switchLevel = (levelNumber: number) => {
    setActiveLevel(levelNumber);
    setOpenSessions(new Set());
  };

  const toggleSession = (sessionId: number) => {
    setOpenSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const openGuide = async (c: Case, sessionId: number, levelNumber: number) => {
    setSelection({ problemId: c.problem_id, sessionId, levelNumber });
    setGuide(null);
    setGuideError(null);
    setGuideLoading(true);
    try {
      const g = (await api.curriculum.getGuide(c.problem_id)) as Guide;
      setGuide(g);
    } catch {
      setGuideError('This guide could not be opened right now. Please try again.');
    } finally {
      setGuideLoading(false);
    }
  };

  const backToBrowser = () => {
    /* Restore the level + ensure the originating session is open. */
    if (selection) {
      setActiveLevel(selection.levelNumber);
      setOpenSessions((prev) => {
        const next = new Set(prev);
        next.add(selection.sessionId);
        return next;
      });
    }
    setSelection(null);
    setGuide(null);
    setGuideError(null);
  };

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  const showGuideView = selection !== null;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <p className="mb-6 font-fira text-sm text-gray-600">
        Model solutions and read-aloud explanations for every case
      </p>

      <div>
        {loading ? (
          <LoadingState />
        ) : treeError ? (
          <ErrorState message={treeError} />
        ) : tree.length === 0 ? (
          <EmptyState />
        ) : showGuideView ? (
          <GuideView
            selection={selection}
            guide={guide}
            loading={guideLoading}
            error={guideError}
            onBack={backToBrowser}
          />
        ) : (
          <BrowserView
            tree={tree}
            activeLevel={activeLevel}
            currentLevel={currentLevel}
            summary={levelSummary}
            openSessions={openSessions}
            onSwitchLevel={switchLevel}
            onToggleSession={toggleSession}
            onOpenCase={openGuide}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Browser view                                                        */
/* ------------------------------------------------------------------ */

function BrowserView({
  tree,
  activeLevel,
  currentLevel,
  summary,
  openSessions,
  onSwitchLevel,
  onToggleSession,
  onOpenCase,
}: {
  tree: Level[];
  activeLevel: number | null;
  currentLevel: Level | null;
  summary: { sessions: number; cases: number; ready: number };
  openSessions: Set<number>;
  onSwitchLevel: (n: number) => void;
  onToggleSession: (id: number) => void;
  onOpenCase: (c: Case, sessionId: number, levelNumber: number) => void;
}) {
  return (
    <div>
      {/* Level tabs (segmented pills) */}
      <div className="flex flex-wrap items-center gap-2">
        {tree.map((lvl) => {
          const active = lvl.level_number === activeLevel;
          return (
            <button
              key={lvl.level_number}
              onClick={() => onSwitchLevel(lvl.level_number)}
              className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-orbitron text-xs font-bold tracking-wider transition-colors ${
                active
                  ? 'border-[#76B900] bg-[#76B900] text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#76B900]/40 hover:text-[#76B900]'
              }`}
            >
              <Layers className={`h-4 w-4 ${active ? 'text-white' : 'text-[#76B900]'}`} />
              LEVEL {lvl.level_number}
            </button>
          );
        })}
      </div>

      {/* Active-level summary line */}
      {currentLevel && (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-rajdhani text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{summary.sessions} sessions</span>
          <span className="text-gray-300">·</span>
          <span>{summary.cases} cases</span>
          <span className="text-gray-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {summary.ready} guides ready
          </span>
        </div>
      )}

      {/* Session list */}
      <div className="mt-6 space-y-4">
        {currentLevel && currentLevel.sessions.length > 0 ? (
          currentLevel.sessions.map((session, idx) => (
            <SessionCard
              key={session.session_id}
              index={idx}
              session={session}
              levelNumber={currentLevel.level_number}
              open={openSessions.has(session.session_id)}
              onToggle={() => onToggleSession(session.session_id)}
              onOpenCase={onOpenCase}
            />
          ))
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center font-rajdhani text-gray-400">
            This level has no sessions yet.
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  index,
  session,
  levelNumber,
  open,
  onToggle,
  onOpenCase,
}: {
  index: number;
  session: Session;
  levelNumber: number;
  open: boolean;
  onToggle: () => void;
  onOpenCase: (c: Case, sessionId: number, levelNumber: number) => void;
}) {
  const total = session.cases.length;
  const ready = session.cases.filter((c) => c.hasGuide).length;
  const title = session.title?.trim() || `Session ${session.session_id}`;

  return (
    <section
      className={`overflow-hidden rounded-xl border-2 bg-white transition-colors ${
        open ? 'border-[#76B900]/40' : 'border-gray-200 hover:border-[#76B900]/40'
      }`}
    >
      {/* Header row — whole row is the accordion toggle. NOT sticky: a sticky
          header here would scroll over (hide) the first case row when expanded,
          making the list look like it starts at Case 2. */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors ${
          open ? 'bg-white' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#76B900]/30 bg-[#76B900]/10 font-orbitron text-sm font-black text-[#76B900]">
          {pad2(index + 1)}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-rajdhani text-base font-bold text-gray-900">{title}</h2>
          <p className="font-rajdhani text-xs text-gray-400">
            {total} {total === 1 ? 'case' : 'cases'}
          </p>
        </div>

        <ReadyPill ready={ready} total={total} />

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#76B900]' : ''
          }`}
        />
      </button>

      {/* Case rows */}
      {open && (
        <div className="border-t border-gray-100">
          {session.cases.length === 0 ? (
            <div className="px-5 py-6 font-rajdhani text-sm text-gray-400">
              No cases in this session yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {session.cases.map((c) => (
                <li key={c.problem_id}>
                  <button
                    onClick={() => onOpenCase(c, session.session_id, levelNumber)}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#76B900]/5"
                  >
                    {c.hasGuide ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                    )}

                    <span className="min-w-0 flex-1 truncate font-rajdhani text-sm text-gray-700 group-hover:text-gray-900">
                      <span className="font-fira text-xs text-gray-400">
                        Case {c.case_number}
                      </span>
                      <span className="px-2 text-gray-300">·</span>
                      <span className="font-semibold">{c.title}</span>
                    </span>

                    {!c.hasGuide && (
                      <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 font-rajdhani text-[11px] font-semibold text-slate-500 sm:inline">
                        soon
                      </span>
                    )}
                    <DifficultyPill difficulty={c.difficulty} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Guide reading view                                                  */
/* ------------------------------------------------------------------ */

function GuideView({
  selection,
  guide,
  loading,
  error,
  onBack,
}: {
  selection: Selection;
  guide: Guide | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}) {
  /* Prefer guide-reported coordinates, fall back to the selection. */
  const lvl = guide?.level_number ?? selection.levelNumber;
  const ses = guide?.session_id ?? selection.sessionId;
  const cas = guide?.case_number;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 font-rajdhani text-sm font-semibold text-gray-600 transition-colors hover:border-[#76B900]/40 hover:text-[#76B900]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to guide
        </button>

        <nav className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-fira text-xs text-gray-400">
          <span>Level {lvl}</span>
          <span className="text-gray-300">›</span>
          <span>Session {ses}</span>
          {cas !== undefined && (
            <>
              <span className="text-gray-300">›</span>
              <span>Case {cas}</span>
            </>
          )}
        </nav>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-orbitron text-xl font-black tracking-wide text-gray-900">
            {guide?.title ?? 'Loading…'}
          </h2>
          {guide?.difficulty && <DifficultyPill difficulty={guide.difficulty} size="md" />}
          {guide?.verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-orbitron text-[10px] font-bold tracking-wider text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Body states */}
      {loading ? (
        <div className="rounded-xl border-2 border-gray-200 bg-white px-6 py-20">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#76B900]" />
            <span className="font-rajdhani text-sm">Loading the guide…</span>
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !guide || guide.available === false ? (
        <ComingSoon question={guide?.question} />
      ) : (
        <GuideContent guide={guide} />
      )}
    </div>
  );
}

function GuideContent({ guide }: { guide: Guide }) {
  const walkthrough = guide.walkthrough ?? [];
  const concepts = guide.key_concepts ?? [];
  const mistakes = guide.common_mistakes ?? [];

  return (
    <div className="space-y-5">
      {/* 1. The question */}
      {guide.question && (
        <Card>
          <SectionLabel icon={BookOpen}>The Question</SectionLabel>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 font-rajdhani text-sm leading-relaxed text-gray-800">
            {guide.question}
          </pre>
        </Card>
      )}

      {/* 2. The answer */}
      {guide.solution_code && (
        <Card>
          <SectionLabel icon={Code2}>The Answer</SectionLabel>
          <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#0b1020]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <pre className="overflow-x-auto p-4 font-fira text-sm leading-relaxed text-emerald-200">
              {guide.solution_code}
            </pre>
          </div>
        </Card>
      )}

      {/* 3. How it works */}
      {walkthrough.length > 0 && (
        <Card>
          <SectionLabel icon={ListChecks}>How It Works</SectionLabel>
          <ol className="space-y-4">
            {walkthrough.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#76B900]/30 bg-[#76B900]/10 font-orbitron text-xs font-bold text-[#76B900]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  {w.label && (
                    <div className="font-rajdhani text-sm font-bold text-gray-900">{w.label}</div>
                  )}
                  {w.code_snippet && (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-gray-900 p-3 font-fira text-xs leading-relaxed text-emerald-200">
                      {w.code_snippet}
                    </pre>
                  )}
                  {w.explanation && (
                    <p className="mt-1.5 font-rajdhani text-sm leading-relaxed text-gray-600">
                      {w.explanation}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* 4. Explain it simply — warm read-aloud callout */}
      {guide.student_explanation && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="font-orbitron text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Explain It Simply
            </h3>
          </div>
          <p className="font-rajdhani text-[15px] leading-relaxed text-amber-900">
            {guide.student_explanation}
          </p>
        </div>
      )}

      {/* 5. Worked example */}
      {guide.worked_example && (
        <Card>
          <SectionLabel icon={FlaskConical}>Example</SectionLabel>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 font-fira text-sm leading-relaxed text-gray-800">
            {guide.worked_example}
          </pre>
        </Card>
      )}

      {/* Supporting — key concepts + common mistakes */}
      {(concepts.length > 0 || mistakes.length > 0) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {concepts.length > 0 && (
            <Card>
              <SectionLabel icon={KeyRound}>Key Concepts</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {concepts.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-[#76B900]/30 bg-[#76B900]/10 px-3 py-1 font-rajdhani text-xs font-semibold text-[#76B900]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {mistakes.length > 0 && (
            <Card>
              <SectionLabel icon={AlertTriangle}>Common Mistakes</SectionLabel>
              <ul className="space-y-2">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex gap-2 font-rajdhani text-sm leading-relaxed text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared building blocks & states                                     */
/* ------------------------------------------------------------------ */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border-2 border-gray-200 bg-white p-5">{children}</div>;
}

function ComingSoon({ question }: { question?: string }) {
  return (
    <div className="space-y-5">
      {question && (
        <Card>
          <SectionLabel icon={BookOpen}>The Question</SectionLabel>
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 font-rajdhani text-sm leading-relaxed text-gray-800">
            {question}
          </pre>
        </Card>
      )}
      <div className="rounded-xl border-2 border-dashed border-[#76B900]/40 bg-[#76B900]/5 px-6 py-12 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#76B900]/15">
          <Sparkles className="h-6 w-6 text-[#76B900]" />
        </span>
        <h3 className="font-orbitron text-sm font-bold tracking-wider text-gray-900">
          DETAILED GUIDE COMING SOON
        </h3>
        <p className="mx-auto mt-1.5 max-w-md font-rajdhani text-sm text-gray-500">
          A full model solution and read-aloud explanation for this case is on the way.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#76B900]" />
      <span className="font-rajdhani text-sm">Loading the curriculum…</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-6 py-12 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
      </span>
      <p className="font-rajdhani text-sm font-semibold text-rose-700">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <GraduationCap className="h-6 w-6 text-gray-400" />
      </span>
      <h3 className="font-orbitron text-sm font-bold tracking-wider text-gray-900">
        NO CURRICULUM YET
      </h3>
      <p className="mt-1.5 font-rajdhani text-sm text-gray-500">
        Once levels and sessions are published, their answer guides will appear here.
      </p>
    </div>
  );
}
