/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Github, User, Sun, Moon, UserCircle } from 'lucide-react';
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
/* ---------- PALETTE GENERATORS ---------- */

const generateTints = ({ h, s, l }: HSL) =>
  [10, 25, 40, 55, 70].map(amount => ({
    h,
    s,
    l: clamp(l + amount),
  }));

const generateShades = ({ h, s, l }: HSL) =>
  [10, 25, 40, 55, 70].map(amount => ({
    h,
    s,
    l: clamp(l - amount),
  }));

const generateAnalogous = ({ h, s, l }: HSL) =>
  [-30, -15, 15, 30].map(offset => ({
    h: (h + offset + 360) % 360,
    s,
    l,
  }));

const generateComplementary = ({ h, s, l }: HSL) => [
  { h, s, l },
  { h: (h + 180) % 360, s, l },
];

const generateSplitComplementary = ({ h, s, l }: HSL) =>
  [-150, 150].map(offset => ({
    h: (h + offset + 360) % 360,
    s,
    l,
  }));

/* ---------- UI HELPERS ---------- */

const PaletteRow = ({
  title,
  colors,
}: {
  title: string;
  colors: HSL[];
}) => (
  <div className="space-y-3">
    <h3 className="text-sm font-mono opacity-70">{title}</h3>

    <div className="grid grid-cols-5 gap-3">
      {colors.map((c, i) => {
        const css = hslToCss(c.h, c.s, c.l);
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={i}
            className="h-16 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer"
            style={{ background: css }}
            title={css}
            onClick={() => navigator.clipboard.writeText(css)}
          />
        );
      })}
    </div>
  </div>
);

/* ---------- PAGE ---------- */

export default function PalettesPage() {
const [darkMode, setDarkMode] = useState(false);
const cardBg = darkMode ? "bg-zinc-950/60" : "bg-white/70";
const borderColor = darkMode ? "border-white/10" : "border-black/10";
const secondaryText = darkMode ? "text-zinc-400" : "text-zinc-600";
const bgClass = darkMode ? 'bg-black' : 'bg-gray-50';
const textClass = darkMode ? 'text-white' : 'text-gray-900';
const hoverBorder = darkMode ? 'hover:border-zinc-700' : 'hover:border-gray-300';
const inputBg = darkMode ? 'bg-zinc-800/50' : 'bg-gray-50';
const inputBorder = darkMode ? 'border-zinc-700' : 'border-gray-300';
const btnBg = darkMode ? 'bg-zinc-800' : 'bg-gray-100';
const btnHover = darkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-200';
const tertiaryText = darkMode ? 'text-zinc-500' : 'text-gray-500';
const navBg = darkMode ? 'bg-zinc-950/30' : 'bg-white/50';
const glassCard =
  "backdrop-blur-xl bg-white/10 dark:bg-zinc-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] pointer-events-auto";

  // Temporary base color (we’ll wire this to Convert later)
  const [baseHsl, setBaseHsl] = useState({
  h: 210,
  s: 80,
  l: 45,
});
const [inputFormat, setInputFormat] = useState<"HEX" | "RGB">("HEX");
const [colorInput, setColorInput] = useState("");
const hex = hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);
useEffect(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const updateTheme = () => setDarkMode(media.matches);

  updateTheme();
  media.addEventListener('change', updateTheme);

  return () => media.removeEventListener('change', updateTheme);
}, []);
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



  return (
    <div className={`min-h-screen overflow-y-auto ${bgClass} ${textClass} transition-colors duration-300 relative`}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.8)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.8)'} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}></div>
        {/* Animated diagonal lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 36px)`,
        }}></div>
      </div>
      {/* Gradient Overlay Effects - More Vibrant */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-175 h-175 rounded-full blur-[140px] opacity-30"
          style={{
            background: `radial-gradient(circle, ${hex} 0%, transparent 70%)`,
            top: '5%',
            left: '15%',
            animation: 'float 20s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute w-150 h-150 rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
            animation: 'float 15s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="absolute w-125 h-125 rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            top: '40%',
            right: '25%',
            animation: 'float 18s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute w-137.5 h-137.5 rounded-full blur-[110px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '30%',
            left: '25%',
            animation: 'float 22s ease-in-out infinite reverse'
          }}
        ></div>
      </div>
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 overflow-y-auto">
        <nav className={`border ${borderColor} ${navBg} backdrop-blur-2xl rounded-2xl transition-all duration-300
${scrolled ? 'shadow-2xl backdrop-blur-3xl' : 'shadow-lg backdrop-blur-xl'} transition-colors relative  max-w-7xl mx-auto pointer-events-auto`} style={{
          boxShadow: darkMode 
            ? '0 20px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)' 
            : '0 20px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
        }}>
          <div
  className="absolute inset-0 pointer-events-none rounded-2xl"
  style={{
    background: darkMode
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0))'
  }}
/>
<div
  className="absolute inset-0 pointer-events-none opacity-[0.035]"
  style={{
    backgroundImage: `
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")
    `
  }}
/>
<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: `linear-gradient(
      135deg,
      ${hex}22 0%,
      transparent 30%
    )`
  }}
/>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <svg width="31" height="28" viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <span className="font-bold text-xl align-center tracking-tight font-mono">HUEKIT</span>
              </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${darkMode ? 'bg-zinc-900' : 'bg-gray-200'} rounded-full p-1 shadow-inner`}>
                <Link href="/"><button className={`px-4 py-1.5 rounded-full text-sm font-medium ${secondaryText} hover:${textClass} transition-all font-mono`}>
                  Convert
                </button></Link>
                <Link href="/palettes">
                <button className={`px-4 py-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-white'} text-sm font-medium transition-all font-mono shadow-sm`}>
                  Palettes
                </button>
                </Link>
                
              </div>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${btnHover} rounded-lg transition-all shadow-sm hover:shadow-md ${darkMode ? 'hover:text-yellow-400' : 'hover:text-blue-600'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className={`p-2 ${btnHover} rounded-lg transition-all shadow-sm hover:shadow-md hover:text-purple-500`}>
                <Link href="https://github.com/alfaaarex/color-tool"><Github size={20} /></Link>
              </button>
              <button className={`p-2 ${btnHover} rounded-lg transition-all shadow-sm hover:shadow-md hover:text-blue-500`}>
                <Link href="https://agni.is-a.dev/"><UserCircle size={20} /></Link>
              </button>
            </div>
          </div>
        </div>
      </nav>
     <div className="relative">
  {/* Main Content */}
<div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
    <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none" style={{
            background: darkMode 
              ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
          }}></div>
          <h1 className={`text-5xl font-bold mb-4 font-mono ${textClass} relative`}>
            <span className="relative inline-block">
              Generative Palettes
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50"></div>
            </span>
          </h1>
          <p className={`${secondaryText} text-lg max-w-2xl mx-auto font-mono relative`}>
            One HEX Code from you generates palettes automatically for you to use in your work!
          </p>
        </div>
  {/* body goes here */}
  <div className="flex flex-col lg:flex-row gap-8 items-start">
    <div className={`${glassCard} border ${borderColor} rounded-2xl p-4 mb-8 flex items-center gap-3 pointer-events-auto `}>
  <input
  value={colorInput}
  onChange={e => handleColorInput(e.target.value)}
  placeholder={inputFormat === "HEX" ? "#FF0000" : "255, 0, 0"}
  className="flex-1 bg-transparent outline-none font-mono text-sm"
/>

  <select
    value={inputFormat}
    onChange={e => {
      setInputFormat(e.target.value as "HEX" | "RGB");
      setColorInput("");
    }}
    className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-sm"
  >
    <option>HEX</option>
    <option>RGB</option>
  </select>
</div>

  {/* columns */}
  <div className="flex flex-col gap-8 lg:w-1/2 overflow-y-visible!">
  {/* palette cards go here */}
  <div className={`${glassCard} border ${borderColor} rounded-2xl p-6`}>
  <PaletteRow title="Tints" colors={generateTints(baseHsl)} />
</div>
<div className={`${glassCard} border ${borderColor} rounded-2xl p-6`}>
  <PaletteRow title="Shades" colors={generateShades(baseHsl)} />
</div>
<div className={`${glassCard} border ${borderColor} rounded-2xl p-6`}>
  <PaletteRow title="Analogous" colors={generateAnalogous(baseHsl)} />
</div>
<div className={`${glassCard} border ${borderColor} rounded-2xl p-6`}>
  <PaletteRow
    title="Complementary"
    colors={generateComplementary(baseHsl)}
  />
</div>
<div className={`${glassCard} border ${borderColor} rounded-2xl p-6`}>
  <PaletteRow
    title="Split Complementary"
    colors={generateSplitComplementary(baseHsl)}
  />
</div>

</div>
</div>
</div>
</div>

      </div>
      </div>
      
  );
}
