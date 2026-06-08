'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Plus, Loader2, Users, ChevronRight, KeyRound } from 'lucide-react';

interface ClassroomRow {
  id: string;
  name: string;
  age_group: string;
  joinCode: string;
  studentCount: number;
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
      {/* Action row — the topbar already names the page; this carries the
          subtitle + the create action. */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-rajdhani text-sm text-gray-600">Pick a class to see student insight</p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-[#76B900] px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-white hover:bg-[#68a300]"
        >
          <Plus className="h-4 w-4" /> NEW CLASS
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-xl border-2 border-[#76B900]/30 bg-white p-5">
          <h2 className="mb-3 font-orbitron text-sm font-bold text-gray-900">Create a classroom</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Class name (e.g. Grade 6 - A)"
              className="min-w-[220px] flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 font-rajdhani outline-none focus:border-[#76B900]"
            />
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as '11-14' | '15-18')}
              className="rounded-lg border-2 border-gray-200 px-3 py-2 font-rajdhani"
            >
              <option value="11-14">11-14</option>
              <option value="15-18">15-18</option>
            </select>
            <button
              onClick={create}
              disabled={creating || !name.trim()}
              className="rounded-lg bg-[#76B900] px-5 py-2 font-orbitron text-xs font-bold tracking-wider text-white hover:bg-[#68a300] disabled:opacity-50"
            >
              {creating ? 'CREATING…' : 'CREATE'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#76B900]" />
        </div>
      ) : error ? (
        <div className="py-20 text-center font-rajdhani text-red-600">{error}</div>
      ) : classrooms.length === 0 ? (
        <div className="py-20 text-center font-rajdhani text-gray-400">
          No classrooms yet. Click <span className="font-bold text-[#76B900]">NEW CLASS</span> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classrooms.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/teacher/classrooms/${c.id}`)}
              className="group rounded-xl border-2 border-gray-200 bg-white p-5 text-left transition-colors hover:border-[#76B900]/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-orbitron text-lg font-black text-gray-900">{c.name}</div>
                  <div className="mt-1 font-rajdhani text-xs text-gray-500">Age group {c.age_group}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#76B900]" />
              </div>
              <div className="mt-4 flex items-center gap-4 font-rajdhani text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-[#76B900]" /> {c.studentCount} students
                </span>
                <span className="flex items-center gap-1">
                  <KeyRound className="h-4 w-4 text-amber-500" /> Code <span className="font-fira font-bold">{c.joinCode}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
