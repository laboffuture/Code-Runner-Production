'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { GraduationCap, Plus, Loader2, Users, ChevronRight, KeyRound } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider">MY CLASSROOMS</h1>
              <p className="text-sm text-gray-600 font-fira">Pick a class to see student insight</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider"
            >
              <Plus className="w-4 h-4" /> NEW CLASS
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        {showCreate && (
          <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 mb-6">
            <h2 className="font-orbitron text-sm font-bold text-gray-900 mb-3">Create a classroom</h2>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Class name (e.g. Grade 6 - A)"
                className="flex-1 min-w-[220px] px-3 py-2 border-2 border-gray-200 rounded-lg font-rajdhani focus:border-indigo-400 outline-none"
              />
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as '11-14' | '15-18')}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg font-rajdhani"
              >
                <option value="11-14">11-14</option>
                <option value="15-18">15-18</option>
              </select>
              <button
                onClick={create}
                disabled={creating || !name.trim()}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-orbitron font-bold text-xs tracking-wider"
              >
                {creating ? 'CREATING…' : 'CREATE'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-rajdhani">
            No classrooms yet. Click <span className="font-bold text-indigo-600">NEW CLASS</span> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classrooms.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/teacher/classrooms/${c.id}`)}
                className="text-left bg-white border-2 border-gray-200 hover:border-indigo-300 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-orbitron font-black text-lg text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500 font-rajdhani mt-1">Age group {c.age_group}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm font-rajdhani text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-500" /> {c.studentCount} students
                  </span>
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-4 h-4 text-amber-500" /> Code <span className="font-fira font-bold">{c.joinCode}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
