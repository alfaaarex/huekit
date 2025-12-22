"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/themeprovider";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Github, User, Sun, Moon, UserCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const isPalettes = pathname.startsWith("/palettes");
  
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const primaryText = darkMode ? "text-white" : "text-gray-900";
  const iconColor = darkMode ? "text-zinc-300" : "text-gray-700";
  const tabActiveText = darkMode ? "text-white" : "text-gray-900";
  const tabInactiveText = darkMode ? "text-zinc-400" : "text-gray-500";

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 px-6
        transition-all duration-500 ease-out
        ${scrolled ? "translate-y-3" : "translate-y-6"}
      `}
    >
      <nav 
        className={`
          relative max-w-7xl mx-auto
          backdrop-blur-2xl
          ${darkMode ? 'bg-black/40' : 'bg-white/40'}
          border ${darkMode ? 'border-white/10' : 'border-black/5'}
          rounded-2xl
          shadow-2xl
          transition-all duration-500
          ${scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.12)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.08)]'}
          overflow-hidden
          group
        `}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease infinite'
          }}
        />

        {/* Shimmer effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite'
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />

        {/* Top highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
          }}
        />

        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo section */}
            <div className="flex items-center gap-3 group/logo">
              <div className="relative">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover/logo:opacity-60 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #EAF259, #793F2C, #000)'
                  }}
                />
                <div className="relative w-9 h-9 rounded-lg flex items-center justify-center transform group-hover/logo:scale-110 transition-transform duration-300">
                  <svg width="31" height="28" viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className="transform group-hover/logo:rotate-12 transition-transform duration-500">
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
              <span className={`font-bold text-xl tracking-tight font-mono ${primaryText} group-hover/logo:bg-gradient-to-r group-hover/logo:from-purple-500 group-hover/logo:via-blue-500 group-hover/logo:to-pink-500 group-hover/logo:bg-clip-text group-hover/logo:text-transparent transition-all duration-300`}>
                HUEKIT
              </span>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Tab switcher with glass morphism */}
              <div className={`
                relative flex items-center rounded-full p-1.5
                ${darkMode ? 'bg-black/40' : 'bg-white/40'}
                backdrop-blur-xl
                border ${darkMode ? 'border-white/10' : 'border-black/5'}
                shadow-inner
              `}>
                {/* Animated background pill */}
                <div
                  className={`
                    absolute top-1.5 bottom-1.5 w-[calc(50%-6px)]
                    rounded-full
                    transition-all duration-500 ease-out
                    ${darkMode 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/20' 
                      : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 shadow-md'}
                    ${isPalettes ? "translate-x-[calc(100%+2px)]" : "translate-x-0"}
                  `}
                  style={{
                    boxShadow: isPalettes
                      ? '0 0 20px rgba(139, 92, 246, 0.3)'
                      : '0 0 20px rgba(59, 130, 246, 0.3)'
                  }}
                />

                <Link href="/" className="relative z-10">
                  <button
                    className={`
                      px-5 py-2
                      font-mono text-sm font-medium
                      rounded-full
                      transition-all duration-300
                      ${!isPalettes 
                        ? `${tabActiveText} scale-105` 
                        : `${tabInactiveText} hover:text-current`}
                    `}
                  >
                    Convert
                  </button>
                </Link>

                <Link href="/palettes" className="relative z-10">
                  <button
                    className={`
                      px-5 py-2
                      font-mono text-sm font-medium
                      rounded-full
                      transition-all duration-300
                      ${isPalettes 
                        ? `${tabActiveText} scale-105` 
                        : `${tabInactiveText} hover:text-current`}
                    `}
                  >
                    Palettes
                  </button>
                </Link>
              </div>

              {/* Icon buttons with enhanced effects */}
              <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button
                  onClick={toggleDarkMode}
                  onMouseEnter={() => setHoveredIcon('theme')}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className={`
                    relative p-2.5 rounded-xl
                    ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}
                    backdrop-blur-sm
                    border ${darkMode ? 'border-white/10' : 'border-black/5'}
                    transition-all duration-300
                    ${iconColor}
                    hover:scale-110 hover:shadow-lg
                    ${hoveredIcon === 'theme' ? 'shadow-lg' : ''}
                    group/icon
                  `}
                  style={{
                    boxShadow: hoveredIcon === 'theme'
                      ? darkMode 
                        ? '0 0 20px rgba(234, 179, 8, 0.3)'
                        : '0 0 20px rgba(99, 102, 241, 0.3)'
                      : undefined
                  }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"
                    style={{
                      background: darkMode
                        ? 'radial-gradient(circle at center, rgba(234, 179, 8, 0.1), transparent)'
                        : 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1), transparent)'
                    }}
                  />
                  {darkMode ? (
                    <Sun size={20} className="relative z-10 transform group-hover/icon:rotate-180 transition-transform duration-500" />
                  ) : (
                    <Moon size={20} className="relative z-10 transform group-hover/icon:-rotate-12 transition-transform duration-300" />
                  )}
                </button>

                {/* GitHub button */}
                <Link href="https://github.com/alfaaarex/huekit">
                  <button
                    onMouseEnter={() => setHoveredIcon('github')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    className={`
                      relative p-2.5 rounded-xl
                      ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}
                      backdrop-blur-sm
                      border ${darkMode ? 'border-white/10' : 'border-black/5'}
                      transition-all duration-300
                      ${iconColor}
                      hover:scale-110 hover:shadow-lg hover:text-purple-500
                      ${hoveredIcon === 'github' ? 'shadow-lg text-purple-500' : ''}
                      group/icon
                    `}
                  >
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15), transparent)'
                      }}
                    />
                    <Github size={20} className="relative z-10 transform group-hover/icon:scale-110 transition-transform duration-300" />
                  </button>
                </Link>

                {/* Profile button */}
                <Link href="https://agni.is-a.dev/">
                  <button
                    onMouseEnter={() => setHoveredIcon('profile')}
                    onMouseLeave={() => setHoveredIcon(null)}
                    className={`
                      relative p-2.5 rounded-xl
                      ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}
                      backdrop-blur-sm
                      border ${darkMode ? 'border-white/10' : 'border-black/5'}
                      transition-all duration-300
                      ${iconColor}
                      hover:scale-110 hover:shadow-lg hover:text-blue-500
                      ${hoveredIcon === 'profile' ? 'shadow-lg text-blue-500' : ''}
                      group/icon
                    `}
                  >
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15), transparent)'
                      }}
                    />
                    <UserCircle size={20} className="relative z-10 transform group-hover/icon:scale-110 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-50"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)'
          }}
        />
      </nav>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
