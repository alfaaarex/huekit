"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/themeprovider";
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
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Github, User, Sun, Moon, UserCircle } from 'lucide-react';

export default function Navbar( ) {
    
    const { darkMode, toggleDarkMode } = useTheme();
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
    const primaryText = darkMode ? "text-white" : "text-gray-900";
    const iconColor = darkMode ? "text-zinc-300" : "text-gray-700";
    const tabActiveText = darkMode ? "text-white" : "text-gray-900";
    const tabInactiveText = darkMode ? "text-zinc-400" : "text-gray-800";
    const innerbg = darkMode ? "shadow-inner bg-zinc-900/70" : "shadow-inner bg-zinc-900/30";
    const pathname = usePathname();
    const isPalettes = pathname.startsWith("/palettes");

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
    <div
  className={`
    fixed top-0 left-0 right-0 z-50 px-6
    transition-transform duration-300 ease-out
    ${scrolled ? "-translate-y-20" : "translate-y-5"}
  `}
>
        <nav className={`border ${borderColor} ${scrolled ? "opacity-95" : "opacity-100"} ${navBg} backdrop-blur-2xl rounded-2xl transition-all duration-300
    ${scrolled ? 'shadow-2xl backdrop-blur-3xl' : 'shadow-lg backdrop-blur-xl'} transition-colors relative  max-w-7xl mx-auto pointer-events-auto`}>
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
  className="rounded-2xl pointer-events-none"
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
                <span className={`font-bold text-xl align-middle tracking-tight font-mono ${primaryText}`}>HUEKIT</span>
              </div>
            
            <div className="flex items-center gap-4">
                
              <div className={`relative flex items-center rounded-full p-1 ${innerbg} dark:bg-zinc-900
  bg-gray-200`}>
  <div
  className={`
    absolute top-1 bottom-1 w-[calc(50%-4px)]
 rounded-full
    transition-transform duration-300 ease-out
    ${darkMode ? "bg-zinc-800" : "bg-white shadow-sm"}
    ${isPalettes ? "translate-x-[calc(100%-1px)]" : "translate-x-0"}
  `}
/>
                <Link href="/" className="relative z-10">
  <button
  className={`
    px-4 py-1.5
    font-mono text-sm
    
    ${!isPalettes ? tabActiveText : tabInactiveText}
  `}
>
  Convert
</button>
</Link>

<Link href="/palettes" className="relative z-10">
  <button
  className={`
    px-4 py-1.5
    font-mono text-sm
    ${isPalettes ? tabActiveText : tabInactiveText}
  `}
>
  Palettes
</button>
</Link>

                
              </div>
              
              <button
  onClick={toggleDarkMode}
  className={`p-2 ${btnHover} rounded-lg transition-all ${iconColor}`}
>
  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
</button>
              <button className={`p-2 ${btnHover} rounded-lg transition-all shadow-sm hover:shadow-md hover:text-purple-500 ${iconColor}`}>
                <Link href="https://github.com/alfaaarex/color-tool"><Github size={20} /></Link>
              </button>
              <button className={`p-2 ${btnHover} rounded-lg transition-all shadow-sm hover:shadow-md hover:text-blue-500 ${iconColor}`}>
                <Link href="https://agni.is-a.dev/"><UserCircle size={20} /></Link>
              </button>
            </div>
          </div>
        </div>
      </nav>
</div>
);
}