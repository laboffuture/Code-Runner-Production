'use client';

import { Code2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Skill {
  name: string;
  problemCount: number;
  category: 'LANGUAGE' | 'ALGORITHM' | 'DATA_STRUCTURE' | 'CONCEPT';
}

interface SkillsTagsProps {
  data: any;
}

export function SkillsTags({ data }: SkillsTagsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Extract skills from API data
  const userSkills = data?.skills || [];
  const skills = userSkills.length > 0
    ? [...userSkills].sort((a: Skill, b: Skill) => b.problemCount - a.problemCount)
    : [];

  const getCategoryColor = (category: Skill['category']) => {
    switch (category) {
      case 'LANGUAGE':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ALGORITHM':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'DATA_STRUCTURE':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'CONCEPT':
        return 'bg-[#91D2D9]/30 text-[#034AA6] border-[#0367A6]/40';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white border-2 border-[#91D2D9]/60 rounded-xl p-6 hover:border-[#0367A6]/60 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="w-5 h-5 text-[#0367A6]" />
        <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">SKILLS & EXPERTISE</h3>
      </div>

      {skills.length === 0 ? (
        <div className="flex items-center justify-center h-[120px] text-center">
          <div>
            <p className="text-gray-400 font-rajdhani">No skills tracked yet</p>
            <p className="text-xs text-gray-400 font-rajdhani mt-2">Solve problems to build your skill profile!</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${getCategoryColor(skill.category)} hover:shadow-md transition-all cursor-pointer`}
            >
              <span className="text-sm font-rajdhani font-bold">{skill.name}</span>
              <span className="text-xs font-orbitron font-black px-2 py-0.5 rounded-full bg-white/80">
                {skill.problemCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
