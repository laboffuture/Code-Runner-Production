'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { BookOpen, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

interface CaseRow { problem_id: number; title: string; difficulty: string; case_number: number; hasGuide: boolean; }
interface SessionRow { session_id: number; cases: CaseRow[]; }
interface LevelRow { level_number: number; sessions: SessionRow[]; }
interface Guide {
  available: boolean; title: string; question?: string; difficulty?: string;
  solution_code?: string;
  walkthrough?: Array<{ label: string; code_snippet: string; explanation: string }>;
  student_explanation?: string; worked_example?: string;
  key_concepts?: string[]; common_mistakes?: string[]; verified?: boolean;
}

export default function CurriculumGuide() {
  const [tree, setTree] = useState<LevelRow[]>([]);
  const [openSession, setOpenSession] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);

  useEffect(() => {
    api.curriculum.getTree('11-14')
      .then((d) => setTree((d as { tree?: LevelRow[] })?.tree ?? []))
      .catch(() => setTree([]))
      .finally(() => setLoading(false));
  }, []);

  const openGuide = async (problemId: number) => {
    setSelected(problemId);
    setGuideLoading(true);
    try { setGuide((await api.curriculum.getGuide(problemId)) as Guide); }
    catch { setGuide(null); }
    finally { setGuideLoading(false); }
  };

  return (
    <main className="max-w-[1600px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-indigo-500" /> ANSWER GUIDE
      </h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Browser */}
          <div className="lg:col-span-4 space-y-4">
            {tree.map((lvl) => (
              <div key={lvl.level_number} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="font-orbitron font-bold text-gray-900 mb-2">Level {lvl.level_number}</div>
                {lvl.sessions.map((s) => (
                  <div key={s.session_id} className="mb-1">
                    <button
                      onClick={() => setOpenSession(openSession === s.session_id ? null : s.session_id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 text-sm font-rajdhani text-gray-700"
                    >
                      <span>Session {s.session_id}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${openSession === s.session_id ? 'rotate-90' : ''}`} />
                    </button>
                    {openSession === s.session_id && (
                      <div className="ml-3 mt-1 space-y-1">
                        {s.cases.map((c) => (
                          <button
                            key={c.problem_id}
                            onClick={() => openGuide(c.problem_id)}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-sm font-rajdhani ${selected === c.problem_id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <span className="truncate">Case {c.case_number}: {c.title}</span>
                            {c.hasGuide && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Guide panel */}
          <div className="lg:col-span-8">
            {!selected ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center text-gray-400 font-rajdhani">
                Pick a case on the left to see its teaching guide.
              </div>
            ) : guideLoading ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : !guide || guide.available === false ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
                <h2 className="font-orbitron font-bold text-gray-900">{guide?.title}</h2>
                {guide?.question && <pre className="mt-3 whitespace-pre-wrap font-rajdhani text-gray-700 text-sm">{guide.question}</pre>}
                <p className="mt-4 text-gray-400 font-rajdhani">Detailed guide coming soon.</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="font-orbitron font-black text-gray-900 text-lg flex items-center gap-2">
                    {guide.title}
                    {guide.verified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">VERIFIED</span>}
                  </h2>
                </div>
                {/* 1. Question */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">THE QUESTION</div>
                  <pre className="whitespace-pre-wrap font-rajdhani text-gray-800 text-sm bg-gray-50 rounded-lg p-3">{guide.question}</pre>
                </section>
                {/* 2. Answer */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">THE ANSWER</div>
                  <pre className="whitespace-pre-wrap font-fira text-sm bg-[#0b1020] text-emerald-200 rounded-lg p-3 overflow-x-auto">{guide.solution_code}</pre>
                </section>
                {/* 3. Logic breakdown */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-2">HOW IT WORKS</div>
                  <ol className="space-y-3">
                    {(guide.walkthrough ?? []).map((w, i) => (
                      <li key={i} className="border-l-2 border-indigo-200 pl-3">
                        <div className="font-rajdhani font-bold text-gray-900 text-sm">{i + 1}. {w.label}</div>
                        {w.code_snippet && <pre className="whitespace-pre-wrap font-fira text-xs bg-gray-50 rounded p-2 mt-1 overflow-x-auto">{w.code_snippet}</pre>}
                        <div className="text-sm text-gray-700 font-rajdhani mt-1">{w.explanation}</div>
                      </li>
                    ))}
                  </ol>
                </section>
                {/* 4. Explain it simply */}
                <section>
                  <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">EXPLAIN IT SIMPLY</div>
                  <p className="font-rajdhani text-gray-800 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">{guide.student_explanation}</p>
                </section>
                {/* 5. Example */}
                {guide.worked_example && (
                  <section>
                    <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">EXAMPLE</div>
                    <pre className="whitespace-pre-wrap font-fira text-sm bg-gray-50 rounded-lg p-3">{guide.worked_example}</pre>
                  </section>
                )}
                {/* supporting */}
                {(guide.key_concepts?.length ?? 0) > 0 && (
                  <section className="flex flex-wrap gap-2">
                    {guide.key_concepts!.map((k) => (
                      <span key={k} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-rajdhani">{k}</span>
                    ))}
                  </section>
                )}
                {(guide.common_mistakes?.length ?? 0) > 0 && (
                  <section>
                    <div className="text-xs font-orbitron tracking-widest text-gray-500 mb-1">COMMON MISTAKES</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700 font-rajdhani space-y-1">
                      {guide.common_mistakes!.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
