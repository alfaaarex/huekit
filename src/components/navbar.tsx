"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/themeprovider";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Github, UserCircle } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const isPalettes = pathname.startsWith("/palettes");
  
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const primaryText = darkMode ? "text-white" : "text-gray-900";
  const iconColor = darkMode ? "text-zinc-300" : "text-gray-600";
  const tabActiveText = darkMode ? "text-white" : "text-gray-900";
  const tabInactiveText = darkMode ? "text-zinc-400" : "text-gray-500";

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 px-6
        transition-all duration-500 ease-out
        ${scrolled ? "translate-y-2" : "translate-y-4"}
      `}
    >
      <nav 
        className={`
          relative max-w-5xl mx-auto
          backdrop-blur-xl backdrop-saturate-150
          ${darkMode ? 'bg-black/20' : 'bg-white/40'}
          border ${darkMode ? 'border-white/20' : 'border-white/50'}
          rounded-2xl
          transition-all duration-500 ease-out
          overflow-hidden
          shadow-lg
        `}
        style={{
          boxShadow: darkMode
            ? '0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset'
            : '0 20px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255,255,255,0.6) inset',
        }}
      >
        
        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: darkMode
              ? 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
              : 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Top highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 50%, transparent)',
          }}
        />

        <div className="relative px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Logo section */}
            <div className="flex items-center gap-2.5 group/logo cursor-pointer">
              <div className="relative">
                {/* Animated glow background */}
                <div className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover/logo:opacity-70 transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234, 242, 89, 0.6), rgba(121, 63, 44, 0.6))',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center transform group-hover/logo:scale-110 group-hover/logo:rotate-12 transition-all duration-500 ease-out">
                  <svg width="28" height="25" viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg transform group-hover/logo:rotate-[-12deg] transition-transform duration-500">
                    <path d="M15.0459 0L30.0917 27.8313H-2.95639e-05L15.0459 0Z" fill="url(#paint0_linear_102_217)"/>
                    <defs>
                      <linearGradient id="paint0_linear_102_217" x1="32.4194" y1="4.28825" x2="-3.99473" y2="30.5046" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#EAF259"/>
                        <stop offset="0.5" stopColor="#793F2C"/>
                        <stop offset="1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <span className={`font-bold text-lg tracking-tight font-mono ${primaryText} transition-all duration-300 group-hover/logo:tracking-wide`}>
                HUEKIT
              </span>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Tab switcher */}
              <div className={`
                relative flex items-center rounded-2xl p-1.5
                ${darkMode ? 'bg-black/30' : 'bg-white/60'}
                backdrop-blur-xl
                border ${darkMode ? 'border-white/20' : 'border-white/40'}
                transition-all duration-300
                shadow-inner
              `}
              style={{
                boxShadow: darkMode 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.1)'
                  : 'inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(255,255,255,0.5)'
              }}>
                {/* Active tab indicator with gradient border */}
                <div
                  className={`
                    absolute top-1.5 bottom-1.5 rounded-xl
                    transition-all duration-500 ease-out
                    ${isPalettes ? "left-[calc(50%+3px)] right-1.5" : "left-1.5 right-[calc(50%+3px)]"}
                  `}
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))',
                    boxShadow: darkMode
                      ? '0 4px 16px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.2), 0 0 0 1px rgba(139, 92, 246, 0.3)'
                      : '0 4px 16px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                  }}
                />

                <Link href="/" className="relative z-10 flex-1">
                  <button
                    className={`
                      w-full px-5 py-2
                      font-mono text-sm font-semibold
                      rounded-xl
                      transition-all duration-300
                      ${!isPalettes 
                        ? `${tabActiveText} scale-[1.02]`
                        : `${tabInactiveText} hover:text-current hover:scale-[1.01]`}
                    `}
                  >
                    Convert
                  </button>
                </Link>

                <Link href="/palettes" className="relative z-10 flex-1">
                  <button
                    className={`
                      w-full px-5 py-2
                      font-mono text-sm font-semibold
                      rounded-xl
                      transition-all duration-300
                      ${isPalettes 
                        ? `${tabActiveText} scale-[1.02]`
                        : `${tabInactiveText} hover:text-current hover:scale-[1.01]`}
                    `}
                  >
                    Palettes
                  </button>
                </Link>
              </div>

              {/* Icon buttons */}
              <div className="flex items-center gap-1.5">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  onMouseEnter={() => setHoveredIcon('theme')}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className={`
                    relative p-2 rounded-xl
                    ${darkMode ? 'bg-white/10' : 'bg-white/40'}
                    backdrop-blur-md
                    border ${darkMode ? 'border-white/20' : 'border-white/30'}
                    transition-all duration-300
                    ${iconColor}
                    hover:scale-110 active:scale-95
                    ${hoveredIcon === 'theme' ? 'shadow-lg' : ''}
                    group/icon overflow-hidden
                  `}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500"
                    style={{
                      background: darkMode 
                        ? 'radial-gradient(circle at center, rgba(234, 179, 8, 0.2), transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2), transparent 70%)',
                    }}
                  />
                  {darkMode ? (
                    <Sun size={18} className="relative z-10 transition-all duration-500 group-hover/icon:rotate-180 group-hover/icon:text-yellow-400" />
                  ) : (
                    <Moon size={18} className="relative z-10 transition-all duration-500 group-hover/icon:rotate-[-30deg] group-hover/icon:text-indigo-500" />
                  )}
                </button>

                {/* GitHub button */}
                <Link href="https://github.com/alfaaarex/huekit">
                  <button
                    onMouseEnter={() => setHoveredIcon('github')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    className={`
                      relative p-2 rounded-xl
                      ${darkMode ? 'bg-white/10' : 'bg-white/40'}
                      backdrop-blur-md
                      border ${darkMode ? 'border-white/20' : 'border-white/30'}
                      transition-all duration-300
                      ${iconColor}
                      hover:scale-110 active:scale-95
                      ${hoveredIcon === 'github' ? 'text-purple-400 shadow-lg' : ''}
                      group/icon overflow-hidden
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.25), transparent 70%)',
                      }}
                    />
                    <Github size={18} className="relative z-10 transition-all duration-500 group-hover/icon:rotate-[360deg]" />
                  </button>
                </Link>

                {/* Profile button */}
                <Link href="https://agni.is-a.dev/">
                  <button
                    onMouseEnter={() => setHoveredIcon('profile')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    className={`
                      relative p-2 rounded-xl
                      ${darkMode ? 'bg-white/10' : 'bg-white/40'}
                      backdrop-blur-md
                      border ${darkMode ? 'border-white/20' : 'border-white/30'}
                      transition-all duration-300
                      ${iconColor}
                      hover:scale-110 active:scale-95
                      ${hoveredIcon === 'profile' ? 'text-blue-400 shadow-lg' : ''}
                      group/icon overflow-hidden
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.25), transparent 70%)',
                      }}
                    />
                    <UserCircle size={18} className="relative z-10 transition-all duration-500 group-hover/icon:scale-110" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}