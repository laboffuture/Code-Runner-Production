'use client';

import { AlertCircle, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WeakArea {
  name: string;
  successRate: number;
  attemptedProblems: number;
  lastPracticed: string;
  priority: 'High' | 'Medium' | 'Low';
}

const mockWeakAreas: WeakArea[] = [
  { name: 'Dynamic Programming', successRate: 36, attemptedProblems: 18, lastPracticed: '2 days ago', priority: 'High' },
  { name: 'Graphs', successRate: 43, attemptedProblems: 15, lastPracticed: '5 days ago', priority: 'High' },
  { name: 'Backtracking', successRate: 52, attemptedProblems: 14, lastPracticed: '1 week ago', priority: 'Medium' },
  { name: 'Trees (Hard)', successRate: 58, attemptedProblems: 12, lastPracticed: '3 days ago', priority: 'Medium' },
];

export function WeakAreas() {
  const [weakAreas] = useState<WeakArea[]>(mockWeakAreas);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-300 bg-red-50';
      case 'Medium': return 'border-yellow-300 bg-yellow-50';
      case 'Low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#76B900]/40 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">AREAS TO IMPROVE</h3>
      </div>

      <div className="space-y-4">
        {weakAreas.map((area) => (
          <div
            key={area.name}
            className={`p-4 rounded-lg border-2 ${getPriorityBorder(area.priority)} hover:shadow-md transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-rajdhani font-bold text-gray-900 mb-1">{area.name}</h4>
                <p className="text-xs text-gray-600 font-fira">
                  {area.attemptedProblems} problems attempted • Last: {area.lastPracticed}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-orbitron font-bold ${getPriorityColor(area.priority)}`}>
                {area.priority}
              </span>
            </div>

            {/* Success Rate Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-rajdhani text-gray-600">Success Rate</span>
                <span className="font-orbitron font-black text-red-600">{area.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${area.successRate}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button className="mt-3 w-full py-2 px-4 bg-[#76B900] hover:bg-[#5a8f00] text-white rounded-lg text-xs font-orbitron font-bold tracking-wider transition-colors flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              PRACTICE NOW
            </button>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 font-rajdhani text-center">
          💡 Focus on <span className="font-bold text-red-600">High Priority</span> topics for maximum improvement
        </p>
      </div>
    </div>
  );
}
