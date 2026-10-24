"use client";
import { Header } from "@/components/layout/Header";
import { LevelList } from "@/components/lists/LevelList";
import type { Level } from "@/lib/types";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Terminal, Zap, Target, Activity } from "lucide-react";
import { useGlobalAudio } from "@/contexts/AudioContext";
import { usePageAudio } from "@/hooks/usePageAudio";
import { useAnimations } from "@/hooks/useAnimations";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getLevelsBackdrop } from "@/lib/view-backgrounds";
import FloatingParticles from "@/components/ui/FloatingParticles";
interface LevelPageProps {
  params: {
    age_group: string;
  };
}
export default function LevelPage({ params }: LevelPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [levelsData, setLevelsData] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [ageGroup, setAgeGroup] = useState<string>("");
  const {} = useGlobalAudio();
  const { accentColor, theme } = useTheme();
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  usePageAudio({ audioType: "background" });
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname),
      );
    }
  }, [isAuthenticated, authLoading, router]);
  const {
    animateHeroEntrance,
    animateCardsEntrance,
    addGlitchEffect,
    isLoaded,
  } = useAnimations();
  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const { age_group } = resolvedParams;
        setAgeGroup(age_group);
        const data = await api.levels.getByAgeGroup(
          age_group as "11-14" | "15-18",
        );
        setLevelsData(data as Level[]);
      } catch (error) {
        console.error("Error loading levels:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);
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
  const cyanParticleColor = () => {
    const c = Math.floor(Math.random() * 100) + 155;
    return `rgba(0, ${c}, ${c}, ${Math.random() * 0.5 + 0.2})`;
  };
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="font-mono text-cyan-400 text-sm animate-pulse">
            {`// Loading ${ageGroup} mission data...`}
          </p>
        </div>
      </div>
    );
  }
  const formattedAgeGroup = ageGroup.replace("-", "–");
  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#0a0e17", color: "#f3ede9" }}
    >
      {/* Space Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url("${getLevelsBackdrop(theme.id)}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      {/* Grid Overlay - Same as Home Page */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `
                        linear-gradient(to right, ${hexToRgba(accentColor, 0.05)} 1px, transparent 1px),
                        linear-gradient(to bottom, ${hexToRgba(accentColor, 0.05)} 1px, transparent 1px)
                    `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      ></div>
      {/* Floating Particles Container - CSS animations only */}
      <FloatingParticles size="1.5px" getColor={cyanParticleColor} />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-sm font-mono mb-8"
          style={{ color: accentColor }}
        >
          <Link
            href="/home"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Terminal className="h-3 w-3" />
            <span>HOME_BASE</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span style={{ color: theme.colors.light }}>TRAINING_PROTOCOLS</span>
        </nav>
        {/* Mission Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Target className="h-12 w-12 text-neon-green" />
              <div className="absolute -inset-2 bg-neon-green/20 rounded-full blur animate-pulse"></div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-space font-bold text-primary glow-text">
                OPERATIVE TRAINING
              </h1>
              <p
                className="text-lg font-mono opacity-80"
                style={{ color: accentColor }}
              >
                Ages {formattedAgeGroup} | Advanced Protocols
              </p>
            </div>
          </div>
          {/* Mission Briefing */}
          <div className="max-w-3xl mx-auto relative">
            {/* SVG Filter for Electric Border */}
            <svg className="absolute" style={{ width: 0, height: 0 }}>
              <defs>
                <filter
                  id="briefing-turbulent-displace"
                  colorInterpolationFilters="sRGB"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.02"
                    numOctaves="10"
                    result="noise1"
                    seed="1"
                  />
                  <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                    <animate
                      attributeName="dy"
                      values="700; 0"
                      dur="6s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    />
                  </feOffset>
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.02"
                    numOctaves="10"
                    result="noise2"
                    seed="1"
                  />
                  <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                    <animate
                      attributeName="dy"
                      values="0; -700"
                      dur="6s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    />
                  </feOffset>
                  <feComposite
                    in="offsetNoise1"
                    in2="offsetNoise2"
                    result="combinedNoise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="combinedNoise"
                    scale="15"
                    xChannelSelector="R"
                    yChannelSelector="B"
                  />
                </filter>
              </defs>
            </svg>
            {/* Electric Border Container */}
            <div
              className="relative p-0.5 rounded-2xl"
              style={{
                background: `linear-gradient(-30deg, ${hexToRgba(accentColor, 0.4)}, transparent, ${hexToRgba(accentColor, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))`,
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
                      background: "rgba(10, 14, 23, 0.95)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="h-5 w-5" style={{ color: accentColor }} />
                      <span
                        className="font-space text-sm font-bold"
                        style={{ color: accentColor }}
                      >
                        MISSION BRIEFING
                      </span>
                    </div>
                    <p
                      className="text-lg font-medium"
                      style={{ color: "#f3ede9", opacity: 0.8 }}
                    >
                      Select your training module to begin advanced neural
                      programming protocols. Each mission is designed to enhance
                      your computational abilities.
                    </p>
                  </div>
                </div>
                {/* Glow Layers */}
                <div
                  className="absolute inset-0 w-full h-full border-2 rounded-2xl"
                  style={{
                    borderColor: hexToRgba(accentColor, 0.6),
                    filter: "blur(1px) url(#briefing-turbulent-displace)",
                  }}
                ></div>
                <div
                  className="absolute inset-0 w-full h-full border-2 rounded-2xl"
                  style={{
                    borderColor: accentColor,
                    filter: "blur(4px) url(#briefing-turbulent-displace)",
                  }}
                ></div>
              </div>
              {/* Overlay Effects */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl opacity-100 scale-110"
                style={{
                  mixBlendMode: "overlay",
                  filter: "blur(16px)",
                  background:
                    "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
                }}
              ></div>
              <div
                className="absolute inset-0 w-full h-full rounded-2xl opacity-50 scale-110"
                style={{
                  mixBlendMode: "overlay",
                  filter: "blur(16px)",
                  background:
                    "linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)",
                }}
              ></div>
              {/* Background Glow */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl -z-10 scale-110 opacity-30"
                style={{
                  filter: "blur(32px)",
                  background: `linear-gradient(-30deg, ${accentColor}, transparent, ${accentColor})`,
                }}
              ></div>
            </div>
          </div>
          {/* System Status */}
          <div className="flex items-center justify-center gap-4">
            {/* Modules Count Badge */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded border-2 font-space font-semibold text-xs"
              style={{
                background: `linear-gradient(135deg, rgba(10, 14, 23, 0.95), ${hexToRgba(accentColor, 0.15)})`,
                borderColor: theme.colors.light,
                color: theme.colors.light,
                boxShadow: `${hexToRgba(theme.colors.light, 0.3)} 0px 0px 20px`,
              }}
            >
              <Activity
                className="w-3 h-3 animate-pulse"
                style={{ color: theme.colors.light }}
              />
              <span>{levelsData.length} MODULES</span>
            </div>
          </div>
        </div>
        <LevelList levels={levelsData} />
      </main>
      {/* Audio Control - Fixed Bottom Left */}
    </div>
  );
}