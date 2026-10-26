
'use client';

import { Header } from '@/components/layout/Header';
import { SessionList } from '@/components/lists/SessionList';
import type { Level } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Terminal, Target, Activity, Zap, Database } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useAnimations } from '@/hooks/useAnimations';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useTheme } from '@/contexts/ThemeContext';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { getLevelsBackdrop } from '@/lib/view-backgrounds';

interface LevelDetailPageProps {
    params: {
        age_group: string;
        level_number: string;
    };
}

export default function LevelDetailPage({ params }: LevelDetailPageProps) {
    const [levelData, setLevelData] = useState<Level | null>(null);
    const [loading, setLoading] = useState(true);
    const [ageGroup, setAgeGroup] = useState<string>('');
    const [levelNumber, setLevelNumber] = useState<string>('');
    const { forcePlayBackgroundMusic, forcePlayMissionMusic, getCurrentMusicType } = useGlobalAudio();
    const { accentColor, theme } = useTheme();

    const hexToRgba = (hex: string, opacity: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const {
        animateHeroEntrance,
        animateCardsEntrance,
        addGlitchEffect,
        isLoaded
    } = useAnimations();

    useEffect(() => {
        async function loadData() {
            try {
                const resolvedParams = await params;
                const { age_group, level_number } = resolvedParams;
                setAgeGroup(age_group);
                setLevelNumber(level_number);

                // Use API client to fetch from backend API service
                const data = await api.levels.getByAgeGroup(age_group as '11-14' | '15-18') as Level[];
                const levelNum = parseInt(level_number, 10);
                const level = data.find((l: Level) => l.level_number === levelNum);
                
                if (!level) {
                    notFound();
                }
                setLevelData(level);
            } catch (error) {
                console.error('Error loading level:', error);
                notFound();
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params]);

    useEffect(() => {
        if (!levelData) return;
        
        // Check if this is the Galactic Code Quest mission
        const isGalacticMission = levelData.title?.toLowerCase().includes('galactic') || 
                                 levelData.title?.toLowerCase().includes('code quest') ||
                                 levelData.description?.toLowerCase().includes('galactic');
        
        const requiredMusicType = isGalacticMission ? 'mission' : 'background';
        const currentMusicType = getCurrentMusicType();

        // Only change music if we need to switch to a different type
        if (currentMusicType !== requiredMusicType) {
            const playAudio = async () => {
                try {
                    if (isGalacticMission) {
                        // Force switch to scott-buckley for Galactic Code Quest mission
                        await forcePlayMissionMusic();
                    } else {
                        // Force switch to base music for other missions
                        await forcePlayBackgroundMusic();
                    }
                } catch (error) {
                    const handleUserInteraction = () => {
                        if (isGalacticMission) {
                            forcePlayMissionMusic();
                        } else {
                            forcePlayBackgroundMusic();
                        }
                        document.removeEventListener('click', handleUserInteraction);
                        document.removeEventListener('keydown', handleUserInteraction);
                    };

                    document.addEventListener('click', handleUserInteraction);
                    document.addEventListener('keydown', handleUserInteraction);

                    return () => {
                        document.removeEventListener('click', handleUserInteraction);
                        document.removeEventListener('keydown', handleUserInteraction);
                    };
                }
            };

            playAudio();
        }
    }, [levelData, forcePlayBackgroundMusic, forcePlayMissionMusic, getCurrentMusicType]);

    // Initialize animations and background when loaded - No Three.js
    useEffect(() => {
        if (isLoaded && !loading) {
            const timer = setTimeout(() => {
                animateHeroEntrance();
                animateCardsEntrance();
                addGlitchEffect();
            }, 500);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [isLoaded, loading]);

    // Cyan training-theme particle field (same look as before).
    const cyanParticleColor = () => {
        const c = Math.floor(Math.random() * 100) + 155;
        return `rgba(0, ${c}, ${c}, ${Math.random() * 0.5 + 0.2})`;
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-cyan"></div>
                <p className="mt-4 text-neon-cyan font-space">Loading Level Data...</p>
            </div>
        );
    }

    if (!levelData) {
        notFound();
    }
    
    const formattedAgeGroup = ageGroup.replace('-', '–');

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0e17', color: '#f3ede9' }}>
            {/* Space Background Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `url("${getLevelsBackdrop(theme.id)}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>

            {/* Grid Overlay */}
            <div
                className="fixed inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${hexToRgba(accentColor, 0.05)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(accentColor, 0.05)} 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                    zIndex: 1
                }}
            ></div>

            {/* Floating Particles Container - CSS animations only */}
            <FloatingParticles size="1.5px" getColor={cyanParticleColor} />

            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
                {/* Enhanced Navigation Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm font-mono mb-8" style={{ color: accentColor }}>
                    <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Terminal className="h-3 w-3" />
                        <span>HOME_BASE</span>
                    </Link>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    {ageGroup && (
                        <Link href={`/levels/${ageGroup}`} className="hover:text-primary transition-colors">
                            <span>TRAINING_PROTOCOLS</span>
                        </Link>
                    )}
                    {!ageGroup && <span>TRAINING_PROTOCOLS</span>}
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-neon-green">MISSION_{levelData?.level_number || ''}</span>
                </nav>
                
                {/* Mission Details Header */}
                <div className="text-center mb-12 space-y-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="relative">
                            <Target className="h-12 w-12 text-neon-purple" />
                            <div className="absolute -inset-2 bg-neon-purple/20 rounded-full blur animate-pulse"></div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl md:text-4xl font-space font-bold text-primary glow-text">
                                MISSION {levelData.level_number}
                            </h1>
                            <p className="text-lg font-space font-bold uppercase opacity-90" style={{ color: accentColor }}>
                                {levelData.title.replace(/^Mission\s*\d+\s*:\s*/i, '')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Mission Briefing */}
                    <div className="max-w-4xl mx-auto relative">
                        {/* Electric Border Container */}
                        <div
                            className="relative p-0.5 rounded-2xl"
                            style={{
                                background: `linear-gradient(-30deg, ${hexToRgba(accentColor, 0.4)}, transparent, ${hexToRgba(accentColor, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))`
                            }}
                        >
                            {/* Inner Container */}
                            <div className="relative">
                                {/* Border Outer */}
                                <div
                                    className="border-2 rounded-2xl pr-1 pb-1"
                                    style={{ borderColor: hexToRgba(accentColor, 0.5) }}
                                >
                                    {/* Main Briefing Card */}
                                    <div
                                        className="w-full rounded-2xl border-2 -mt-1 -ml-1 relative overflow-hidden p-6"
                                        style={{
                                            borderColor: accentColor,
                                            background: 'transparent'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <Database className="h-5 w-5" style={{ color: accentColor }} />
                                            <span className="font-space text-sm font-bold" style={{ color: accentColor }}>MISSION BRIEFING</span>
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed whitespace-pre-line" style={{ color: '#f3ede9', opacity: 0.8 }}>
                                            {levelData.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Status */}
                    <div className="flex items-center justify-center gap-4">
                        {/* Sessions Count Badge */}
                        <div
                            className="flex items-center gap-2 px-3 py-1 rounded border-2 font-space font-semibold text-xs"
                            style={{
                                background: `linear-gradient(135deg, rgba(10, 14, 23, 0.95), ${hexToRgba(accentColor, 0.15)})`,
                                borderColor: theme.colors.light,
                                color: theme.colors.light,
                                boxShadow: `${hexToRgba(theme.colors.light, 0.3)} 0px 0px 20px`
                            }}
                        >
                            <Activity className="w-3 h-3 animate-pulse" style={{ color: theme.colors.light }} />
                            <span>{levelData.sessions.length} SESSIONS</span>
                        </div>
                    </div>
                </div>
                
                <SessionList sessions={levelData.sessions} level={levelData} />
            </main>
            


            {/* Audio Control - Fixed Bottom Left */}
        </div>
    );
}
