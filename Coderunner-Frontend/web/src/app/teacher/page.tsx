'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Plus, Loader2, Users, Copy, Check, ChevronRight } from 'lucide-react';

interface ClassroomRow {
  id: string;
  name: string;
  age_group: string;
  joinCode: string;
  studentCount: number;
}

// Purely decorative per-card accent, cycled by position — not tied to any
// real classroom attribute (there's no "category" field on a classroom).
const ACCENTS = ['#14B8A6', '#8B5CF6', '#22C55E', '#F43F5E', '#22C55E', '#F59E0B'];

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="flex items-center gap-1 text-gray-500 transition-colors hover:text-[#0F766E]"
      title="Copy class code"
    >
      Code <span className="font-fira font-bold text-gray-700">{code}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-[#0F766E]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function TeacherClassrooms() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'11-14' | '15-18'>('11-14');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.teacher.getClassrooms()) as { classrooms: ClassroomRow[] };
      setClassrooms(data.classrooms || []);
    } catch (e: any) {
      const msg = e?.message || '';
      setError(
        msg.includes('403') || msg.includes('401')
          ? 'Access denied. Teacher privileges required.'
          : 'Failed to load classrooms.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.teacher.createClassroom({ name: name.trim(), age_group: ageGroup });
      setName('');
      setShowCreate(false);
      await load();
    } catch {
      setError('Failed to create classroom.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-rajdhani text-sm text-gray-600">Pick a class to see student insight</p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-[#0F766E] px-5 py-2.5 font-orbitron text-xs font-bold tracking-wider text-white transition-colors hover:bg-[#0d6259]"
        >
          <Plus className="h-4 w-4" /> New Class
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-[#E7DFCF] bg-white p-5">
          <h2 className="mb-3 font-orbitron text-sm font-bold text-gray-900">Create a classroom</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Class name (e.g. Grade 6 - A)"
              className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 py-2 font-rajdhani outline-none focus:border-[#0F766E]"
            />
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as '11-14' | '15-18')}
              className="rounded-lg border border-gray-300 px-3 py-2 font-rajdhani"
            >
              <option value="11-14">11-14</option>
              <option value="15-18">15-18</option>
            </select>
            <button
              onClick={create}
              disabled={creating || !name.trim()}
              className="rounded-lg bg-[#0F766E] px-5 py-2 font-orbitron text-xs font-bold tracking-wider text-white hover:bg-[#0d6259] disabled:opacity-50"
            >
              {creating ? 'CREATING…' : 'CREATE'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
        </div>
      ) : error ? (
        <div className="py-20 text-center font-rajdhani text-red-600">{error}</div>
      ) : classrooms.length === 0 ? (
        <div className="py-20 text-center font-rajdhani text-gray-400">
          No classrooms yet. Click <span className="font-bold text-[#0F766E]">New Class</span> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classrooms.map((c, i) => (
            <button
              key={c.id}
              onClick={() => router.push(`/teacher/classrooms/${c.id}`)}
              className="group overflow-hidden rounded-2xl border border-[#E7DFCF] bg-white text-left transition-shadow hover:shadow-md"
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-orbitron text-lg font-black text-gray-900">{c.name}</div>
                    <div className="mt-1 font-rajdhani text-xs text-gray-500">Age group {c.age_group}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#0F766E]" />
                </div>
                <div className="mt-4 flex items-center gap-4 font-rajdhani text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-[#0F766E]" /> {c.studentCount} students
                  </span>
                  <CopyCode code={c.joinCode} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
