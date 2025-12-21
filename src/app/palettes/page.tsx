/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Github, User, Sun, Moon, UserCircle } from 'lucide-react';
import { useTheme } from "@/components/themeprovider";
import Reveal from '@/components/reveal';

/* ---------- TYPES ---------- */

type HSL = {
  h: number;
  s: number;
  l: number;
};

/* ---------- HELPERS ---------- */
const looksLikeHex = (value: string) => {
  const v = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(v);
};

const looksLikeRgb = (value: string) => {
  const parts = value.trim().split(/[\s,]+/);
  return (
    parts.length === 3 &&
    parts.every(p => {
      const n = Number(p);
      return !isNaN(n) && n >= 0 && n <= 255;
    })
  );
};

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return (
    "#" +
    [f(0), f(8), f(4)]
      .map(x => Math.round(x * 255).toString(16).padStart(2, "0"))
      .join("")
  );
};

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, v));

const hslToCss = (h: number, s: number, l: number) =>
  `hsl(${h}, ${s}%, ${l}%)`;

const parseRgb = (value: string) => {
  const parts = value.split(/[\s,]+/).map(Number);
  if (parts.length !== 3 || parts.some(v => isNaN(v) || v < 0 || v > 255))
    return null;

  return { r: parts[0], g: parts[1], b: parts[2] };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;

  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
};

/* ---------- IMPROVED PALETTE GENERATORS ---------- */

const generateTints = ({ h, s, l }: HSL) => {
  // Generate lighter versions by increasing lightness
  // More subtle progression for better usability
  return [15, 30, 45, 60, 75].map(amount => ({
    h,
    s: Math.max(5, s - amount * 0.3), // Slightly desaturate as it gets lighter
    l: clamp(l + amount),
  }));
};

const generateShades = ({ h, s, l }: HSL) => {
  // Generate darker versions by decreasing lightness
  // Desaturate as it gets darker for more natural appearance
  return [15, 30, 45, 60, 75].map(amount => ({
    h,
    s: Math.max(0, s - amount * 0.25), // Desaturate as it gets darker
    l: clamp(l - amount),
  }));
};

const generateAnalogous = ({ h, s, l }: HSL) => {
  // Colors adjacent on the color wheel
  return [-30, -15, 15, 30].map(offset => ({
    h: (h + offset + 360) % 360,
    s: clamp(s + (Math.random() * 10 - 5)), // Add slight variation
    l: clamp(l + (Math.random() * 10 - 5)),
  }));
};

const generateTriadic = ({ h, s, l }: HSL) => {
  // Three colors evenly spaced on color wheel
  return [0, 120, 240].map(offset => ({
    h: (h + offset) % 360,
    s,
    l,
  }));
};

const generateComplementary = ({ h, s, l }: HSL) => [
  { h, s, l },
  { h: (h + 180) % 360, s, l },
];

const generateSplitComplementary = ({ h, s, l }: HSL) => {
  // Base color plus two colors adjacent to its complement
  return [
    { h, s, l },
    { h: (h + 150) % 360, s, l },
    { h: (h + 210) % 360, s, l },
  ];
};

const generateTetradic = ({ h, s, l }: HSL) => {
  // Four colors evenly spaced (square on color wheel)
  return [0, 90, 180, 270].map(offset => ({
    h: (h + offset) % 360,
    s,
    l,
  }));
};

const generateMonochromatic = ({ h, s, l }: HSL) => {
  // Same hue, varying saturation and lightness
  return [
    { h, s: clamp(s - 30), l: clamp(l + 30) },
    { h, s: clamp(s - 15), l: clamp(l + 15) },
    { h, s, l },
    { h, s: clamp(s + 15), l: clamp(l - 15) },
    { h, s: clamp(s + 30), l: clamp(l - 30) },
  ];
};

/* ---------- UI HELPERS ---------- */

const PaletteRow = ({
  title,
  description,
  colors,
  copiedIndex,
  copiedFormat,
  onCopy,
}: {
  title: string;
  description: string;
  colors: HSL[];
  copiedIndex: number | null;
  copiedFormat: string | null;
  onCopy: (color: HSL, index: number, format: 'hex' | 'rgb' | 'hsl') => void;
}) => {
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-mono font-semibold mb-1">{title}</h3>
        <p className="text-xs opacity-60 font-mono leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {colors.map((c, i) => {
          const hex = hslToHex(c.h, c.s, c.l);
          const rgb = hslToRgb(c.h, c.s, c.l);
          const hslStr = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
          const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          const isCopied = copiedIndex === i;
          
          return (
            <div
              key={i}
              className="group relative"
            >
              {/* Main color swatch */}
              <div
                className="h-24 rounded-xl border-2 border-black/10 dark:border-white/10 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl overflow-hidden relative"
                style={{ 
                  background: hslStr,
                  boxShadow: `0 8px 32px -8px ${hex}40`
                }}
              >
                {/* Hover overlay with format buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-2 gap-1">
                  <div className="flex gap-1 w-full">
                    <button
                      onClick={() => onCopy(c, i, 'hex')}
                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-white transition-all"
                      title={hex}
                    >
                      {isCopied && copiedFormat === 'hex' ? '✓' : 'HEX'}
                    </button>
                    <button
                      onClick={() => onCopy(c, i, 'rgb')}
                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-white transition-all"
                      title={rgbStr}
                    >
                      {isCopied && copiedFormat === 'rgb' ? '✓' : 'RGB'}
                    </button>
                    <button
                      onClick={() => onCopy(c, i, 'hsl')}
                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-mono text-white transition-all"
                      title={hslStr}
                    >
                      {isCopied && copiedFormat === 'hsl' ? '✓' : 'HSL'}
                    </button>
                  </div>
                </div>

                {/* Quick copy icon (center) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {isCopied ? (
                    <Check size={24} className="text-white drop-shadow-2xl" strokeWidth={3} />
                  ) : (
                    <Copy size={24} className="text-white drop-shadow-2xl" strokeWidth={2} />
                  )}
                </div>
              </div>

              {/* Color code display below */}
              <div className="mt-2 text-center">
                <p className="text-[10px] font-mono opacity-70 truncate">{hex}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- PAGE ---------- */

export default function PalettesPage() {
  const { darkMode } = useTheme();

  const cardBg = darkMode ? "bg-zinc-950/60" : "bg-white/70";
  const borderColor = darkMode ? "border-white/10" : "border-black/10";
  const secondaryText = darkMode ? "text-zinc-400" : "text-zinc-600";
  const bgClass = darkMode ? 'bg-black' : 'bg-gray-50';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const inputBg = darkMode ? 'bg-zinc-800/50' : 'bg-gray-50';
  const inputBorder = darkMode ? 'border-zinc-700' : 'border-gray-300';
  const glassCard = "backdrop-blur-xl bg-white/10 dark:bg-zinc-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] pointer-events-auto";

  const [baseHsl, setBaseHsl] = useState({
    h: 210,
    s: 80,
    l: 50,
  });
  const [inputFormat, setInputFormat] = useState<"HEX" | "RGB">("HEX");
  const [colorInput, setColorInput] = useState("#3B82F6");
  const [copiedStates, setCopiedStates] = useState<Record<string, { index: number; format: string } | null>>({});
  const [scrolled, setScrolled] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<'hue' | 'saturation' | 'lightness' | null>(null);

  const hex = hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      const handleMouseUp = () => setIsDraggingSlider(null);
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingSlider) return;

        const slider = document.getElementById(`slider-${isDraggingSlider}`);
        if (!slider) return;

        const rect = slider.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const percentage = (x / rect.width) * 100;

        if (isDraggingSlider === 'hue') {
          const hue = Math.round((percentage / 100) * 360);
          const newHsl = { h: hue, s: baseHsl.s, l: baseHsl.l };
          setBaseHsl(newHsl);
          setColorInput(hslToHex(hue, baseHsl.s, baseHsl.l));
        } else if (isDraggingSlider === 'saturation') {
          const saturation = Math.round(percentage);
          const newHsl = { h: baseHsl.h, s: saturation, l: baseHsl.l };
          setBaseHsl(newHsl);
          setColorInput(hslToHex(baseHsl.h, saturation, baseHsl.l));
        } else if (isDraggingSlider === 'lightness') {
          const lightness = Math.round(percentage);
          const newHsl = { h: baseHsl.h, s: baseHsl.s, l: lightness };
          setBaseHsl(newHsl);
          setColorInput(hslToHex(baseHsl.h, baseHsl.s, lightness));
        }
      };

      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isDraggingSlider, baseHsl]);

  const handleColorInput = (value: string) => {
    setColorInput(value);

    let rgb = null;

    if (looksLikeHex(value)) {
      rgb = hexToRgb(value);
    } else if (looksLikeRgb(value)) {
      rgb = parseRgb(value);
    }

    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setBaseHsl(hsl);
    if (looksLikeHex(value)) {
      setInputFormat("HEX");
    } else if (looksLikeRgb(value)) {
      setInputFormat("RGB");
    }
  };

  const handleCopy = (paletteId: string, color: HSL, index: number, format: 'hex' | 'rgb' | 'hsl') => {
    let textToCopy = '';
    
    if (format === 'hex') {
      textToCopy = hslToHex(color.h, color.s, color.l);
    } else if (format === 'rgb') {
      const s = color.s / 100;
      const l = color.l / 100;
      const k = (n: number) => (n + color.h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const r = Math.round(f(0) * 255);
      const g = Math.round(f(8) * 255);
      const b = Math.round(f(4) * 255);
      textToCopy = `rgb(${r}, ${g}, ${b})`;
    } else {
      textToCopy = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedStates(prev => ({ ...prev, [paletteId]: { index, format } }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [paletteId]: null }));
    }, 2000);
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${bgClass} ${textClass} transition-colors duration-300 relative`}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 36px)`,
        }}></div>
      </div>

      {/* Floating Orbs - Multiple animated gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary base color orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: `radial-gradient(circle, ${hex} 0%, transparent 70%)`,
            top: '10%',
            left: '10%',
            animation: 'float 25s ease-in-out infinite'
          }}
        ></div>
        
        {/* Secondary purple orb */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            top: '20%',
            right: '15%',
            animation: 'float 20s ease-in-out infinite reverse'
          }}
        ></div>

        {/* Tertiary pink orb */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[90px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            bottom: '15%',
            left: '20%',
            animation: 'float 30s ease-in-out infinite'
          }}
        ></div>

        {/* Blue accent orb */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            bottom: '25%',
            right: '20%',
            animation: 'float 28s ease-in-out infinite reverse'
          }}
        ></div>

        {/* Small accent orbs */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-[70px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            animation: 'pulse 15s ease-in-out infinite'
          }}
        ></div>

        <div 
          className="absolute w-[250px] h-[250px] rounded-full blur-[60px] opacity-15"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
            top: '60%',
            right: '40%',
            animation: 'pulse 18s ease-in-out infinite reverse'
          }}
        ></div>
      </div>

      {/* Animated mesh gradient overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 20% 30%, ${darkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.15)'} 0px, transparent 50%),
              radial-gradient(at 80% 20%, ${darkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.15)'} 0px, transparent 50%),
              radial-gradient(at 40% 70%, ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'} 0px, transparent 50%),
              radial-gradient(at 60% 80%, ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'} 0px, transparent 50%)
            `,
            animation: 'meshMove 20s ease-in-out infinite alternate'
          }}
        ></div>
      </div>

      {/* Animated particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-20"
            style={{
              background: `linear-gradient(45deg, ${hex}, ${darkMode ? '#8b5cf6' : '#3b82f6'})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particle ${15 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none" style={{
            background: darkMode 
              ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
          }}></div>
          <Reveal>
            <h1 className={`text-5xl font-bold mb-4 font-mono ${textClass} relative`}>
              <span className="relative inline-block">
                Generative Palettes
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50"></div>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className={`${secondaryText} text-lg max-w-2xl mx-auto font-mono relative`}>
              Generate harmonious color palettes instantly. Hover over swatches and choose your format.
            </p>
          </Reveal>
        </div>

        {/* Color Input */}
        <Reveal delay={150}>
          <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-2xl`}>
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-2xl flex-shrink-0 transition-all hover:scale-110"
                style={{ 
                  backgroundColor: hex,
                  boxShadow: `0 20px 60px -12px ${hex}80, 0 0 0 1px ${hex}40`
                }}
              ></div>
              
              <div className="flex-1 space-y-2">
                <label className={`block text-xs font-mono ${secondaryText} uppercase tracking-wider`}>
                  Base Color
                </label>
                <input
                  value={colorInput}
                  onChange={e => handleColorInput(e.target.value)}
                  placeholder={inputFormat === "HEX" ? "#3B82F6" : "59, 130, 246"}
                  className={`w-full ${inputBg} border-2 ${inputBorder} rounded-xl px-5 py-3.5 ${textClass} font-mono text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
              </div>

              <select
                value={inputFormat}
                onChange={e => {
                  setInputFormat(e.target.value as "HEX" | "RGB");
                  setColorInput(e.target.value === "HEX" ? hex : "");
                }}
                className={`${inputBg} border-2 ${inputBorder} rounded-xl px-5 py-3.5 ${textClass} font-mono text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all hover:border-purple-400`}
              >
                <option>HEX</option>
                <option>RGB</option>
              </select>
            </div>

            {/* Color Sliders */}
            <div className="space-y-4">
              {/* Hue Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`block text-[10px] font-mono ${secondaryText} uppercase tracking-wider opacity-70`}>
                    Hue
                  </label>
                  <span className={`text-xs font-mono ${textClass}`}>{baseHsl.h}°</span>
                </div>
                <div 
                  id="slider-hue"
                  className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none"
                  onMouseDown={(e) => {
                    setIsDraggingSlider('hue');
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const hue = Math.round((x / rect.width) * 360);
                    const newHsl = { h: hue, s: baseHsl.s, l: baseHsl.l };
                    setBaseHsl(newHsl);
                    setColorInput(hslToHex(hue, baseHsl.s, baseHsl.l));
                  }}
                  style={{
                    background: 'linear-gradient(to right, hsl(0, 80%, 50%), hsl(30, 80%, 50%), hsl(60, 80%, 50%), hsl(90, 80%, 50%), hsl(120, 80%, 50%), hsl(150, 80%, 50%), hsl(180, 80%, 50%), hsl(210, 80%, 50%), hsl(240, 80%, 50%), hsl(270, 80%, 50%), hsl(300, 80%, 50%), hsl(330, 80%, 50%), hsl(360, 80%, 50%))'
                  }}
                >
                  {/* Position indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                    style={{ left: `${(baseHsl.h / 360) * 100}%` }}
                  />
                </div>
              </div>

              {/* Saturation Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`block text-[10px] font-mono ${secondaryText} uppercase tracking-wider opacity-70`}>
                    Saturation
                  </label>
                  <span className={`text-xs font-mono ${textClass}`}>{baseHsl.s}%</span>
                </div>
                <div 
                  id="slider-saturation"
                  className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none"
                  onMouseDown={(e) => {
                    setIsDraggingSlider('saturation');
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const saturation = Math.round((x / rect.width) * 100);
                    const newHsl = { h: baseHsl.h, s: saturation, l: baseHsl.l };
                    setBaseHsl(newHsl);
                    setColorInput(hslToHex(baseHsl.h, saturation, baseHsl.l));
                  }}
                  style={{
                    background: `linear-gradient(to right, hsl(${baseHsl.h}, 0%, 50%), hsl(${baseHsl.h}, 100%, 50%))`
                  }}
                >
                  {/* Position indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                    style={{ left: `${baseHsl.s}%` }}
                  />
                </div>
              </div>

              {/* Lightness Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`block text-[10px] font-mono ${secondaryText} uppercase tracking-wider opacity-70`}>
                    Lightness
                  </label>
                  <span className={`text-xs font-mono ${textClass}`}>{baseHsl.l}%</span>
                </div>
                <div 
                  id="slider-lightness"
                  className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none"
                  onMouseDown={(e) => {
                    setIsDraggingSlider('lightness');
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const lightness = Math.round((x / rect.width) * 100);
                    const newHsl = { h: baseHsl.h, s: baseHsl.s, l: lightness };
                    setBaseHsl(newHsl);
                    setColorInput(hslToHex(baseHsl.h, baseHsl.s, lightness));
                  }}
                  style={{
                    background: `linear-gradient(to right, hsl(${baseHsl.h}, ${baseHsl.s}%, 0%), hsl(${baseHsl.h}, ${baseHsl.s}%, 100%))`
                  }}
                >
                  {/* Position indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                    style={{ left: `${baseHsl.l}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Palette Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Reveal delay={200}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-purple-500/30`}>
              <PaletteRow 
                title="Tints" 
                description="Lighter variations created by mixing with white. Perfect for backgrounds and subtle highlights."
                colors={generateTints(baseHsl)} 
                copiedIndex={copiedStates['tints']?.index ?? null}
                copiedFormat={copiedStates['tints']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('tints', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-blue-500/30`}>
              <PaletteRow 
                title="Shades" 
                description="Darker variations created by mixing with black. Ideal for text and depth."
                colors={generateShades(baseHsl)} 
                copiedIndex={copiedStates['shades']?.index ?? null}
                copiedFormat={copiedStates['shades']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('shades', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-indigo-500/30`}>
              <PaletteRow 
                title="Monochromatic" 
                description="Same hue with varying saturation and lightness. Creates elegant, cohesive designs."
                colors={generateMonochromatic(baseHsl)} 
                copiedIndex={copiedStates['mono']?.index ?? null}
                copiedFormat={copiedStates['mono']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('mono', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-green-500/30`}>
              <PaletteRow 
                title="Analogous" 
                description="Colors adjacent on the wheel. Harmonious and naturally pleasing to the eye."
                colors={generateAnalogous(baseHsl)} 
                copiedIndex={copiedStates['analogous']?.index ?? null}
                copiedFormat={copiedStates['analogous']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('analogous', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={360}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-red-500/30`}>
              <PaletteRow
                title="Complementary"
                description="Opposite colors on the wheel. Maximum contrast and visual impact."
                colors={generateComplementary(baseHsl)}
                copiedIndex={copiedStates['complementary']?.index ?? null}
                copiedFormat={copiedStates['complementary']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('complementary', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-orange-500/30`}>
              <PaletteRow
                title="Split Complementary"
                description="Base color plus two adjacent to its complement. Contrast with more nuance."
                colors={generateSplitComplementary(baseHsl)}
                copiedIndex={copiedStates['split']?.index ?? null}
                copiedFormat={copiedStates['split']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('split', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={440}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-yellow-500/30`}>
              <PaletteRow 
                title="Triadic" 
                description="Three evenly spaced colors. Bold, vibrant, and balanced contrast."
                colors={generateTriadic(baseHsl)} 
                copiedIndex={copiedStates['triadic']?.index ?? null}
                copiedFormat={copiedStates['triadic']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('triadic', color, idx, format)}
              />
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 transition-all hover:shadow-2xl hover:border-pink-500/30`}>
              <PaletteRow
                title="Tetradic"
                description="Four evenly spaced colors forming a square. Rich, dynamic variety."
                colors={generateTetradic(baseHsl)}
                copiedIndex={copiedStates['tetradic']?.index ?? null}
                copiedFormat={copiedStates['tetradic']?.format ?? null}
                onCopy={(color, idx, format) => handleCopy('tetradic', color, idx, format)}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          33% { 
            transform: translate(50px, -50px) scale(1.1); 
          }
          66% { 
            transform: translate(-30px, 30px) scale(0.95); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.15;
          }
          50% { 
            transform: scale(1.3); 
            opacity: 0.25;
          }
        }

        @keyframes meshMove {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(50px, 50px) rotate(5deg);
          }
        }

        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}