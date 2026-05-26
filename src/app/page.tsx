"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExperienceCanvas from "@/components/ExperienceCanvas";
import PortfolioUI from "@/components/PortfolioUI";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [themeProgress, setThemeProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThemeTooltip, setShowThemeTooltip] = useState(false);
  const [showMusicTooltip, setShowMusicTooltip] = useState(false);
  const [timeString, setTimeString] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dayAmbientRef = useRef<HTMLAudioElement | null>(null);
  const nightAmbientRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) audioRef.current.pause();
      if (dayAmbientRef.current) dayAmbientRef.current.pause();
      if (nightAmbientRef.current) nightAmbientRef.current.pause();
    };
  }, []);

  // Update ambient sound volumes dynamically when day/night themeProgress animates
  useEffect(() => {
    if (!isPlaying || typeof window === "undefined") return;

    if (!dayAmbientRef.current) {
      dayAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Birds/R01-24-Birds%20Chirping%20Outside.mp3");
      dayAmbientRef.current.loop = true;
      dayAmbientRef.current.volume = 0;
    }
    if (!nightAmbientRef.current) {
      nightAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Misc/R01-42-Night%20Time%20Crickets.mp3");
      nightAmbientRef.current.loop = true;
      nightAmbientRef.current.volume = 0;
    }

    const dayAmbient = dayAmbientRef.current;
    const nightAmbient = nightAmbientRef.current;

    if (dayAmbient.paused) {
      dayAmbient.play().catch(e => console.warn("Day ambient blocked:", e));
    }
    if (nightAmbient.paused) {
      nightAmbient.play().catch(e => console.warn("Night ambient blocked:", e));
    }

    const masterVolume = audioRef.current ? audioRef.current.volume : 0;
    const masterRatio = masterVolume / 0.25;

    // Cross-fade volumes: dayAmbient gets quieter at night; nightAmbient gets louder
    dayAmbient.volume = Math.max(0, Math.min(1, (1.0 - themeProgress) * masterRatio * 0.55));
    nightAmbient.volume = Math.max(0, Math.min(1, themeProgress * masterRatio * 0.65));
  }, [themeProgress, isPlaying]);

  // Toggle background music with smooth volume fade-in/fade-out
  const toggleAudio = () => {
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      audioRef.current = new Audio("https://archive.org/download/ambientforfilm/Meditation.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
    if (!dayAmbientRef.current) {
      dayAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Birds/R01-24-Birds%20Chirping%20Outside.mp3");
      dayAmbientRef.current.loop = true;
      dayAmbientRef.current.volume = 0;
    }
    if (!nightAmbientRef.current) {
      nightAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Misc/R01-42-Night%20Time%20Crickets.mp3");
      nightAmbientRef.current.loop = true;
      nightAmbientRef.current.volume = 0;
    }

    const audio = audioRef.current;
    const dayAmbient = dayAmbientRef.current;
    const nightAmbient = nightAmbientRef.current;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (isPlaying) {
      const targetVolume = 0;
      const fadeStep = 0.02;
      const intervalMs = 50;

      fadeIntervalRef.current = setInterval(() => {
        if (audio.volume > targetVolume + 0.01) {
          audio.volume = Math.max(0, audio.volume - fadeStep);
          const ratio = audio.volume / 0.25;
          dayAmbient.volume = Math.max(0, Math.min(1, (1.0 - themeProgress) * ratio * 0.55));
          nightAmbient.volume = Math.max(0, Math.min(1, themeProgress * ratio * 0.65));
        } else {
          audio.volume = 0;
          audio.pause();
          dayAmbient.volume = 0;
          dayAmbient.pause();
          nightAmbient.volume = 0;
          nightAmbient.pause();
          setIsPlaying(false);
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, intervalMs);
    } else {
      audio.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
      });
      dayAmbient.play().catch(e => console.warn("Day ambient blocked:", e));
      nightAmbient.play().catch(e => console.warn("Night ambient blocked:", e));

      setIsPlaying(true);

      const targetVolume = 0.25;
      const fadeStep = 0.015;
      const intervalMs = 50;

      fadeIntervalRef.current = setInterval(() => {
        if (audio.volume < targetVolume - 0.01) {
          audio.volume = Math.min(targetVolume, audio.volume + fadeStep);
          const ratio = audio.volume / 0.25;
          dayAmbient.volume = Math.max(0, Math.min(1, (1.0 - themeProgress) * ratio * 0.55));
          nightAmbient.volume = Math.max(0, Math.min(1, themeProgress * ratio * 0.65));
        } else {
          audio.volume = targetVolume;
          dayAmbient.volume = Math.max(0, Math.min(1, (1.0 - themeProgress) * 0.55));
          nightAmbient.volume = Math.max(0, Math.min(1, themeProgress * 0.65));
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        }
      }, intervalMs);
    }
  };

  // 1. Client mount trigger
  useEffect(() => {
    setMounted(true);
    
    // Determine initial theme based on system time (Day: 6 AM to 6 PM, Night: 6 PM to 6 AM)
    const hour = new Date().getHours();
    const isNightTime = hour < 6 || hour >= 18;
    setIsDark(isNightTime);
    setThemeProgress(isNightTime ? 1 : 0);

    // Preload audio files in the background immediately on mount to prevent click delay
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("https://archive.org/download/ambientforfilm/Meditation.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
      audioRef.current.preload = "auto";

      dayAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Birds/R01-24-Birds%20Chirping%20Outside.mp3");
      dayAmbientRef.current.loop = true;
      dayAmbientRef.current.volume = 0;
      dayAmbientRef.current.preload = "auto";

      nightAmbientRef.current = new Audio("https://archive.org/download/Red_Library_Animals_Misc/R01-42-Night%20Time%20Crickets.mp3");
      nightAmbientRef.current.loop = true;
      nightAmbientRef.current.volume = 0;
      nightAmbientRef.current.preload = "auto";
    }

    // Show theme tooltip after 1.5 seconds
    const themeTimer = setTimeout(() => {
      setShowThemeTooltip(true);
    }, 1500);

    // Auto-close theme tooltip after 6.5s and open music tooltip
    const musicTimer = setTimeout(() => {
      setShowThemeTooltip(false);
      setShowMusicTooltip(true);
    }, 7000);

    // Auto-close music tooltip after 12.5s
    const closeMusicTimer = setTimeout(() => {
      setShowMusicTooltip(false);
    }, 12500);

    return () => {
      clearTimeout(themeTimer);
      clearTimeout(musicTimer);
      clearTimeout(closeMusicTimer);
    };
  }, []);

  // 1b. Update clock time every second on client mount
  useEffect(() => {
    if (!mounted) return;
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  // 2. Toggle dark mode class on html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // 3. Smooth Day/Night interpolator (using requestAnimationFrame + easeInOutCubic)
  useEffect(() => {
    if (!mounted) return;

    let animationFrameId: number;
    const start = performance.now();
    const duration = 1500; // 1.5s transition for cinematic feeling
    const initialVal = themeProgress;
    const targetVal = isDark ? 1 : 0;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      // cubic easing: easeInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentProgress = initialVal + (targetVal - initialVal) * ease;
      setThemeProgress(currentProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setThemeProgress(targetVal);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDark, mounted]);

  // Preloader UI during mounting and initialization
  if (!mounted) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center bg-[#f5f2eb] text-[#11100d] z-50 font-sans">
        <div className="flex flex-col items-center gap-6">
          {/* Animated pulsing leaf/glowing ring */}
          <div className="relative flex justify-center items-center">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-800/10 border-t-emerald-800 animate-spin" />
            <Sparkles className="absolute w-5 h-5 text-emerald-950 animate-pulse" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-serif text-lg tracking-wide text-emerald-950">
              Entering the sanctuary...
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[#181713]">
              Technology & Nature Coexisting
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen transition-theme">
      {/* 1. Cinematic 3D Scene Layer */}
      <ExperienceCanvas isDark={isDark} themeProgress={themeProgress} />

      {/* 2. Premium Navigation / Floating Header */}
      <header className="fixed top-0 left-0 w-full p-6 z-40 pointer-events-none flex justify-between items-center max-w-[1440px] mx-auto left-1/2 -translate-x-1/2 px-6 md:px-12">
        <div className="pointer-events-auto">
          <a
            href="#hero"
            className="font-serif italic text-lg font-medium text-emerald-900 dark:text-emerald-300 transition-colors"
          >
            Sudip Manna
          </a>
        </div>

        {/* Floating Menu Link shortcuts & Toggle Group */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#11100d] dark:text-[#a0a5b5]">
            <a href="#about" className="hover:text-emerald-950 dark:hover:text-white transition-colors">What I'm Building</a>
            <a href="#skills" className="hover:text-emerald-950 dark:hover:text-white transition-colors">Development Stack</a>
            <a href="#projects" className="hover:text-emerald-950 dark:hover:text-white transition-colors">Featured Work</a>
            <a href="#experience" className="hover:text-emerald-950 dark:hover:text-white transition-colors">Education & Journey</a>
            <a href="#contact" className="hover:text-emerald-950 dark:hover:text-white transition-colors">Inquire</a>
          </nav>

          {/* Digital System Clock Pill */}
          {timeString && (
            <div className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#2c2b29]/10 dark:bg-white/10 border border-[#2c2b29]/10 dark:border-white/15 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              {timeString}
            </div>
          )}

          {/* Premium Music Toggle Button */}
          <div className="relative">
            <AnimatePresence>
              {showMusicTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute top-12 right-0 w-44 p-3 rounded-2xl bg-[#f5f2eb]/95 dark:bg-[#0c0d12]/95 border border-emerald-500/20 dark:border-white/10 shadow-lg text-[#2d3a31] dark:text-[#a0a5b5] text-[10px] font-sans font-medium leading-normal pointer-events-auto z-50 backdrop-blur-md"
                >
                  {/* Little speech bubble arrow pointing up */}
                  <div className="absolute -top-1 right-5 w-2 h-2 bg-[#f5f2eb] dark:bg-[#0c0d12] rotate-45 border-l border-t border-emerald-500/20 dark:border-white/10" />
                  
                  <div className="flex justify-between items-start gap-1 relative z-10">
                    <span>🎵 Tap here to hear the nature soundscapes! 🌿</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMusicTooltip(false);
                      }} 
                      className="text-[#5a7052] dark:text-[#8da482] hover:scale-110 active:scale-95 cursor-pointer text-xs font-bold shrink-0 -mt-1 -mr-1 p-0.5"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                toggleAudio();
                setShowMusicTooltip(false);
              }}
              aria-label={isPlaying ? "Mute Background Music" : "Play Background Music"}
              className="h-9 px-3.5 rounded-full cursor-pointer flex items-center gap-2 bg-[#2c2b29]/10 dark:bg-white/10 border border-[#2c2b29]/10 dark:border-white/15 backdrop-blur-md relative transition-all duration-300 shadow-sm hover:bg-[#2c2b29]/15 dark:hover:bg-white/15 active:scale-95 text-emerald-900 dark:text-emerald-300"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isPlaying ? (
                  <Volume2 className="w-4 h-4 text-emerald-950 dark:text-emerald-400 transition-colors duration-300" />
                ) : (
                  <VolumeX className="w-4 h-4 opacity-75 text-[#11100d] dark:text-[#a0a5b5] transition-opacity duration-300" />
                )}
              </div>

              {/* Equalizer Visualizer Bars */}
              <div className="flex items-end gap-[2px] h-3 w-4 px-[1px]">
                <div
                  className={`w-[2.5px] bg-emerald-800 dark:bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? "equalizer-bar h-full" : "h-[3px]"
                    }`}
                />
                <div
                  className={`w-[2.5px] bg-emerald-800 dark:bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? "equalizer-bar h-full" : "h-[3px]"
                    }`}
                />
                <div
                  className={`w-[2.5px] bg-emerald-800 dark:bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? "equalizer-bar h-full" : "h-[3px]"
                    }`}
                />
                <div
                  className={`w-[2.5px] bg-emerald-800 dark:bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? "equalizer-bar h-full" : "h-[3px]"
                    }`}
                />
              </div>
            </button>
          </div>

          {/* Premium Animated Theme Toggle Button */}
          <div className="relative">
            <AnimatePresence>
              {showThemeTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute top-12 right-0 w-44 p-3 rounded-2xl bg-[#f5f2eb]/95 dark:bg-[#0c0d12]/95 border border-emerald-500/20 dark:border-white/10 shadow-lg text-[#2d3a31] dark:text-[#a0a5b5] text-[10px] font-sans font-medium leading-normal pointer-events-auto z-50 backdrop-blur-md"
                >
                  {/* Little speech bubble arrow pointing up */}
                  <div className="absolute -top-1 right-7 w-2 h-2 bg-[#f5f2eb] dark:bg-[#0c0d12] rotate-45 border-l border-t border-emerald-500/20 dark:border-white/10" />

                  <div className="flex justify-between items-start gap-1 relative z-10">
                    <span>✨ Switch between Day & Night modes! 🌙</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowThemeTooltip(false);
                      }} 
                      className="text-[#5a7052] dark:text-[#8da482] hover:scale-110 active:scale-95 cursor-pointer text-xs font-bold shrink-0 -mt-1 -mr-1 p-0.5"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                setIsDark(!isDark);
                setShowThemeTooltip(false);
              }}
              aria-label="Toggle Atmosphere"
              className="w-16 h-9 rounded-full p-1 cursor-pointer flex items-center bg-[#2c2b29]/10 dark:bg-white/10 border border-[#2c2b29]/10 dark:border-white/15 backdrop-blur-md relative transition-colors duration-500 shadow-inner"
            >
              {/* Background Icons */}
              <div className="absolute inset-0 flex justify-between items-center px-2.5 pointer-events-none">
                <Sun className="w-4 h-4 opacity-70 dark:opacity-20 transition-opacity text-amber-500" />
                <Moon className="w-4 h-4 opacity-30 dark:opacity-85 transition-opacity text-[#11100d] dark:text-blue-300" />
              </div>

              {/* Sliding Thumb */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                animate={{ x: isDark ? 28 : 0 }}
                className="w-7 h-7 rounded-full bg-white dark:bg-[#0c0d12]/90 flex items-center justify-center shadow-md border border-[#2c2b29]/10 dark:border-white/20 z-10"
              >
                {isDark ? (
                  <Moon className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HTML Content Overlay Layer */}
      <PortfolioUI />
    </main>
  );
}
