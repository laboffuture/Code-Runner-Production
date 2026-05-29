'use client';

import { Lightbulb, ArrowRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RecommendedProblem {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  reason: string;
  matchScore: number;
}

const mockRecommendations: RecommendedProblem[] = [
  {
    id: '1',
    name: 'House Robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    reason: 'Fill gap in DP fundamentals',
    matchScore: 95
  },
  {
    id: '2',
    name: 'Number of Islands',
    difficulty: 'Medium',
    topic: 'Graphs',
    reason: 'Practice DFS/BFS on grids',
    matchScore: 92
  },
  {
    id: '3',
    name: 'Permutations',
    difficulty: 'Medium',
    topic: 'Backtracking',
    reason: 'Strengthen backtracking skills',
    matchScore: 88
  },
  {
    id: '4',
    name: 'Validate BST',
    difficulty: 'Medium',
    topic: 'Trees',
    reason: 'Common tree problem pattern',
    matchScore: 85
  },
  {
    id: '5',
    name: 'Coin Change',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    reason: 'Master DP patterns',
    matchScore: 90
  },
];

export function RecommendedProblems() {
  const [problems] = useState<RecommendedProblem[]>(mockRecommendations);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#76B900]/40 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-[#76B900]" />
        <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">RECOMMENDED FOR YOU</h3>
      </div>

      <div className="space-y-3">
        {problems.map((problem, index) => (
          <div
            key={problem.id}
            className="group p-4 rounded-lg border-2 border-gray-200 hover:border-[#76B900]/60 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Rank Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#76B900] text-white flex items-center justify-center font-orbitron font-black text-sm">
                {index + 1}
              </div>

              {/* Problem Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-rajdhani font-bold text-gray-900">{problem.name}</h4>
                  <div className={`px-2 py-0.5 rounded text-xs font-orbitron font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-600 font-rajdhani">
                    📚 {problem.topic}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#76B900]" />
                    <span className="text-xs font-orbitron font-bold text-[#76B900]">
                      {problem.matchScore}% match
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-fira mb-3">
                  💡 {problem.reason}
                </p>

                {/* Action Button */}
                <button className="w-full py-2 px-4 bg-[#76B900] hover:bg-[#5a8f00] text-white rounded-lg text-xs font-orbitron font-bold tracking-wider transition-colors flex items-center justify-center gap-2 group-hover:shadow-md">
                  START SOLVING
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-rajdhani text-center">
          🎯 Problems selected based on your weak areas and solving patterns
        </p>
      </div>
    </div>
  );
}
