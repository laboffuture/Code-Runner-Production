'use client';

import { useState, useEffect } from 'react';
import { Code, Sparkles } from 'lucide-react';
import type { Problem } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

interface EducationalAccordionsProps {
  problem: Problem;
}

export default function EducationalAccordions({ problem }: EducationalAccordionsProps) {
  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const textGlowStyle = hasCompilerTheme && isDark
    ? { color: '#ffffff', textShadow: `0 0 15px ${accentColor}aa, 0 0 6px ${accentColor}66` }
    : {};
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const cardStyle = hasCompilerTheme
    ? { background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: accentRgba(0.35) }
    : {};
  const cardClass = hasCompilerTheme
    ? ''
    : 'border-cyan-200/50 dark:border-cyan-700/30 bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 shadow-cyan-500/10';

  const renderExplanation = (text: string) => {
    if (!text) return null;

    // Remove Input Format, Output Format, and input/output instruction lines
    const inputOutputPhrases = [
      'you do not need to read any input',
      'print the exact message shown in the question',
      'read input from',
      'print output to',
    ];
    const filtered = text
      .split('\n')
      .reduce<{ lines: string[]; skip: boolean }>((acc, line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('Input Format:') || trimmed.startsWith('Output Format:')) {
          return { lines: acc.lines, skip: true };
        }
        if (acc.skip && trimmed === '') {
          return { lines: acc.lines, skip: true };
        }
        if (inputOutputPhrases.some(phrase => trimmed.toLowerCase().includes(phrase))) {
          return { lines: acc.lines, skip: false };
        }
        return { lines: [...acc.lines, line], skip: false };
      }, { lines: [], skip: false })
      .lines
      .join('\n')
      .trim();

    const lines = filtered.split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|'));

    if (tableLines.length > 0) {
      const rows = tableLines.map(line =>
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );
      if (rows.length === 0) return <p>{text}</p>;
      const headers = rows[0];
      const dataRows = rows.slice(2);
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-left text-sm font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Split into bullet points: by newline, or by ". " between sentences
    const rawLines = filtered.split('\n').map(l => l.trim()).filter(Boolean);
    const points: string[] = [];
    rawLines.forEach(line => {
      // If the line already looks like a bullet (starts with -, ●, •), keep as-is
      if (/^[-●•]/.test(line)) {
        points.push(line.replace(/^[-●•]\s*/, ''));
      }
      // Keep numbered list items (1. 2. 3.) as single bullets but strip the number
      else if (/^\d+[\.\)]/.test(line)) {
        points.push(line.replace(/^\d+[\.\)]\s*/, ''));
      }
      // Keep header lines (ending with :) as single bullets
      else if (line.endsWith(':')) {
        points.push(line);
      } else {
        // Split on ". " boundaries to turn sentences into separate bullets
        const sentences = line.split(/\.\s+/);
        sentences.forEach((s, i) => {
          const trimmed = s.trim();
          if (trimmed) {
            // Re-add the period unless it's the last fragment and original didn't end with one
            points.push(trimmed.endsWith('.') ? trimmed : (i < sentences.length - 1 ? trimmed + '.' : trimmed));
          }
        });
      }
    });

    if (points.length <= 1) {
      return <p className="mb-0">{filtered}</p>;
    }

    return (
      <ul className="space-y-1.5 list-none">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-4 mb-6">

      {/* Reference Code */}
      {problem.case_code && (
        <div
          className={`mission-card relative overflow-hidden rounded-2xl p-6 border-2 shadow-lg ${cardClass}`}
          style={cardStyle}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <h3 className="font-orbitron text-sm font-bold text-cyan-700 dark:text-cyan-300 mb-3 flex items-center gap-2 relative">
            <div className="p-1.5 rounded-lg bg-cyan-200 dark:bg-cyan-900/50">
              <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span>Reference Code</span>
          </h3>
          <pre className="bg-slate-900 text-cyan-400 p-4 rounded-lg font-mono text-xs overflow-x-auto custom-scrollbar relative">
            {problem.case_code}
          </pre>
        </div>
      )}

      {/* Hint */}
      {problem.case_explanation && (
        <div
          className={`mission-card relative overflow-hidden rounded-2xl p-6 border-2 shadow-lg ${cardClass}`}
          style={cardStyle}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <h3 className="font-orbitron text-sm font-bold text-cyan-700 dark:text-cyan-300 mb-3 flex items-center gap-2 relative">
            <div className="p-1.5 rounded-lg bg-cyan-200 dark:bg-cyan-900/50">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span>Hint</span>
          </h3>
          <div className="compiler-body-text text-base text-slate-900 dark:text-white leading-relaxed relative" style={textGlowStyle}>
            {renderExplanation(problem.case_explanation)}
          </div>
        </div>
      )}

    </div>
  );
}
