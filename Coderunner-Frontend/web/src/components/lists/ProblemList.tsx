'use client';

import type { Problem } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, CheckCircle, Zap, Target, Lock } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ProblemListProps {
  problems: Problem[];
  sessionId?: number;
}


export function ProblemList({ problems, sessionId }: ProblemListProps) {
  const { playProjectTextSound } = useGlobalAudio();
  const { accentColor, theme } = useTheme();

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="space-y-3">
        {problems.map((problem, index) => {
            // Check if this is the final task (6th task, index 5)
            const isFinalTask = index === 5;

            return (
                <div key={problem.problem_id}>
                    {/* Add CHEAT SHEET section before the final task */}
                    {isFinalTask && (
                        <>
                            <div className="flex items-center gap-2 mt-6 mb-4">
                                <span className="text-sm font-space uppercase tracking-wide font-extrabold" style={{ color: accentColor }}>CHEAT SHEET</span>
                            </div>

                            {/* Cheat Sheet Container */}
                            <Link
                                href={`/sessions/${problem.session_id}/cheat-sheet`}
                                className="block"
                                onClick={() => playProjectTextSound()}
                            >
                                <Card
                                    className="mb-6 hover:shadow-lg transition-all duration-300 border-2 relative overflow-hidden cursor-pointer"
                                    style={{
                                        background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.1)}, ${hexToRgba(accentColor, 0.05)})`,
                                        borderColor: hexToRgba(accentColor, 0.5),
                                        boxShadow: `0 0 15px ${hexToRgba(accentColor, 0.2)}`
                                    }}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, ${theme.colors.light}, ${accentColor})` }}></div>

                                    <div className="py-6 px-6">
                                        <div className="text-lg font-space font-semibold tracking-tight transition-colors" style={{ color: 'rgb(243, 237, 233)' }}>
                                            Quick Reference Guide
                                        </div>
                                    </div>
                                </Card>
                            </Link>

                            {/* FINAL TASK section header */}
                            <div className="flex items-center gap-2 mt-6 mb-4">
                                <span className="text-sm font-space uppercase tracking-wide font-extrabold" style={{ color: accentColor }}>FINAL TASK</span>
                            </div>
                        </>
                    )}

                    <Link
                        href={`/problems/${problem.problem_id}`}
                        className="block"
                        onClick={() => playProjectTextSound()}
                    >
                        <Card
                            className="hover:shadow-lg transition-all duration-300 group flex items-center border-2 relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.1)}, ${hexToRgba(accentColor, 0.05)})`,
                                borderColor: hexToRgba(accentColor, 0.5),
                                boxShadow: `0 0 15px ${hexToRgba(accentColor, 0.2)}`
                            }}
                        >
                            {/* Task Indicator Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, ${theme.colors.light}, ${accentColor})` }}></div>

                            <CardHeader className="flex-grow py-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="h-4 w-4" style={{ color: accentColor }} />
                                    <span className="text-xs font-space uppercase tracking-wide font-bold" style={{ color: accentColor }}>
                                        {isFinalTask ? 'FINAL TASK' : `TASK ${index + 1}`}
                                    </span>
                                    {!isFinalTask && (
                                        <>
                                            <div className="w-1 h-1 rounded-full" style={{ background: hexToRgba(accentColor, 0.6) }}></div>
                                            <Link
                                                href={`/sessions/${sessionId ?? problem.session_id}/introduction?returnTo=${problem.problem_id}`}
                                                onClick={(e) => { e.stopPropagation(); playProjectTextSound(); }}
                                                className="relative z-10"
                                            >
                                                <span
                                                    className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                                                    style={{
                                                        color: accentColor,
                                                        border: `1px solid ${hexToRgba(accentColor, 0.5)}`,
                                                        backgroundColor: hexToRgba(accentColor, 0.12),
                                                        boxShadow: `0 0 8px ${hexToRgba(accentColor, 0.2)}`,
                                                    }}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(accentColor, 0.25);
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${hexToRgba(accentColor, 0.4)}`;
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLElement).style.backgroundColor = hexToRgba(accentColor, 0.12);
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${hexToRgba(accentColor, 0.2)}`;
                                                    }}
                                                >
                                                    <BookOpen className="h-3 w-3" />
                                                    ARENA
                                                </span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <CardTitle className="text-lg font-space transition-colors" style={{ color: '#f3ede9' }}>
                                   {problem.title}
                                </CardTitle>
                            </CardHeader>

                            <CardFooter className="p-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-space font-semibold"
                                        style={{ color: accentColor }}
                                    >
                                        <Zap className="h-4 w-4 mr-1" />
                                        EXECUTE
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                </div>
            );
        })}
    </div>
  );
}
