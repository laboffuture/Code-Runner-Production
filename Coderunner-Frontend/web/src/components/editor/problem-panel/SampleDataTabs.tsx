'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { CharacterId } from '@/lib/character-themes';
import type { Problem, TestCase } from '@/lib/types';

interface SampleDataTabsProps {
  problem: Problem;
  testCases: TestCase[];
}

const CARD_THEMES: Record<CharacterId, {
  border: string; bg: string; shadow: string;
  label: string; text: string; outputLabel: string;
}> = {
  astra: {
    border:      'border-cyan-200/50 dark:border-cyan-700/30',
    bg:          'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30',
    shadow:      'shadow-cyan-500/10',
    label:       'text-cyan-700 dark:text-cyan-300',
    text:        'text-cyan-700 dark:text-cyan-300',
    outputLabel: 'text-cyan-600 dark:text-cyan-400',
  },
  nila: {
    border:      'border-green-200/50 dark:border-green-700/30',
    bg:          'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    shadow:      'shadow-green-500/10',
    label:       'text-green-700 dark:text-green-300',
    text:        'text-green-700 dark:text-green-300',
    outputLabel: 'text-green-600 dark:text-green-400',
  },
  kenji: {
    border:      'border-orange-200/50 dark:border-orange-700/30',
    bg:          'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
    shadow:      'shadow-orange-500/10',
    label:       'text-orange-700 dark:text-orange-300',
    text:        'text-orange-700 dark:text-orange-300',
    outputLabel: 'text-orange-600 dark:text-orange-400',
  },
  leo: {
    border:      'border-purple-200/50 dark:border-purple-700/30',
    bg:          'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
    shadow:      'shadow-purple-500/10',
    label:       'text-purple-700 dark:text-purple-300',
    text:        'text-purple-700 dark:text-purple-300',
    outputLabel: 'text-purple-600 dark:text-purple-400',
  },
};

export default function SampleDataTabs({ problem, testCases }: SampleDataTabsProps) {
  const [activeTab, setActiveTab] = useState('data');
  const { character, accentColor } = useTheme();
  const ct = CARD_THEMES[character];
  const glowStyle = { textShadow: `0 0 8px ${accentColor}80, 0 0 2px ${accentColor}40` };

  return (
    <div className="sample-data-tabs">
      {/* Tab Navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setActiveTab('data')}
          className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl ${
            activeTab === 'data'
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
        >
          <span className="font-orbitron">Sample Data</span>
        </button>
        <button
          onClick={() => setActiveTab('protocol')}
          className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl ${
            activeTab === 'protocol'
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
        >
          <span className="font-orbitron">Test Cases</span>
        </button>
      </div>

      {/* Sample Data Content */}
      {activeTab === 'data' && (
        <div className="flex gap-3">
          {problem.sample_input && (
            <div className={`flex-1 relative overflow-hidden rounded-2xl p-5 border-2 ${ct.border} ${ct.bg} shadow-lg ${ct.shadow}`}>
              <p className={`font-orbitron text-[10px] font-bold ${ct.label} uppercase tracking-widest mb-3`}>Input</p>
              <pre className={`font-rajdhani ${ct.text} whitespace-pre-wrap leading-relaxed`} style={{ fontSize: '15px', ...glowStyle }}>
                {problem.sample_input}
              </pre>
            </div>
          )}

          {problem.sample_output && (
            <div className={`flex-1 relative overflow-hidden rounded-2xl p-5 border-2 ${ct.border} ${ct.bg} shadow-lg ${ct.shadow}`}>
              <p className={`font-orbitron text-[10px] font-bold ${ct.label} uppercase tracking-widest mb-3`}>Expected Output</p>
              <pre className={`font-rajdhani ${ct.text} leading-relaxed whitespace-pre-wrap`} style={{ fontSize: '15px', ...glowStyle }}>
                {problem.sample_output}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Protocol Content */}
      {activeTab === 'protocol' && (
        <div className="space-y-3">
          {testCases && testCases.length > 0 ? (
            <div>
              <div className="space-y-2">
                {testCases.slice(0, 3).map((testCase, index) => (
                  <div key={index} className="glass-panel border border-slate-200 dark:border-cyan-500/20 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-cyan-500/10">
                      <span className="font-orbitron text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Test Case #{index + 1}</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-orbitron text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Input</span>
                        <pre className="mt-1 font-rajdhani text-slate-800 dark:text-slate-200 whitespace-pre-wrap" style={{ fontSize: '15px', ...glowStyle }}>
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className={`font-orbitron text-[10px] font-bold ${ct.outputLabel} uppercase tracking-widest`}>Expected Output</span>
                        <pre className={`mt-1 font-rajdhani ${ct.text} whitespace-pre-wrap`} style={{ fontSize: '15px', ...glowStyle }}>
                          {testCase.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-cyan-500/20">
              <p className="text-sm text-slate-800 dark:text-slate-200">Test cases are hidden for this problem.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
