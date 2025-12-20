"use client";
import React, { useState, useEffect } from 'react';
import { Copy, Check, Github, User, Sun, Moon, UserCircle } from 'lucide-react';
import Link from 'next/link';

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const ColorPickerApp = () => {
  // const [activeTab, setActiveTab] = useState<"convert" | "palettes">("convert");
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 });
  const [copiedField, setCopiedField] = useState('');
  const [pickerColor, setPickerColor] = useState({ x: 100, y: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [hexInput, setHexInput] = useState('#ff0000');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] =
  useState<null | 'hue' | 'saturation' | 'lightness'>(null);


  /* ---------- PALETTE HELPERS ---------- */

const clamp = (v: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, v));

const hslToCss = (h: number, s: number, l: number) =>
  `hsl(${h}, ${s}%, ${l}%)`;

/* ---------- PALETTE GENERATORS ---------- */

const generateTints = (h: number, s: number, l: number) =>
  [10, 25, 40, 55, 70].map(amount => ({
    h,
    s,
    l: clamp(l + amount),
  }));

const generateShades = (h: number, s: number, l: number) =>
  [10, 25, 40, 55, 70].map(amount => ({
    h,
    s,
    l: clamp(l - amount),
  }));

const generateAnalogous = (h: number, s: number, l: number) =>
  [-30, -15, 15, 30].map(offset => ({
    h: (h + offset + 360) % 360,
    s,
    l,
  }));

const generateComplementary = (h: number, s: number, l: number) => [
  { h, s, l },
  { h: (h + 180) % 360, s, l },
];

const generateSplitComplementary = (h: number, s: number, l: number) =>
  [-150, 150].map(offset => ({
    h: (h + offset + 360) % 360,
    s,
    l,
  }));

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
  );
};

  const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

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

    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hexToRgb = (hex: string): RGB | null => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
      }
    : null;
};

const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);
useEffect(() => {
  const stopDrag = () => setIsDragging(false);
  window.addEventListener("mouseup", stopDrag);
  return () => window.removeEventListener("mouseup", stopDrag);
}, []);

  const hex = rgbToHex(color.r, color.g, color.b);
  const hsl = rgbToHsl(color.r, color.g, color.b);

  useEffect(() => {
  if (isDragging) return;

  setPickerColor({
    x: hsl.s,
    y: 100 - hsl.l,
  });
}, [hsl.h, hsl.s, hsl.l, isDragging]);

useEffect(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const updateTheme = () => setDarkMode(media.matches);

  updateTheme();
  media.addEventListener('change', updateTheme);

  return () => media.removeEventListener('change', updateTheme);
}, []);


 useEffect(() => {
  if (!/^#([0-9a-fA-F]{6})$/.test(hexInput)) {
    setHexInput(hex);
  }
}, [color]);


  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };



  const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();

  const x = Math.max(
    0,
    Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
  );
  const y = Math.max(
    0,
    Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
  );

  setPickerColor({ x, y });
  setColor(hslToRgb(hsl.h, x, 100 - y));
};

const handlePickerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  setIsDragging(true);
  handlePickerClick(e);
};


const handlePickerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isDragging) return;
  handlePickerClick(e);
};


  const handlePickerMouseUp = () => {
  setIsDragging(false);
};
  useEffect(() => {
    if (isDraggingSlider) {
      const handleMouseUp = () => setIsDraggingSlider(null);
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDraggingSlider]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
if (/^#([0-9a-fA-F]{6})$/.test(value)) {
  const rgb = hexToRgb(value);
  if (rgb) setColor(rgb);
}

  };

  const bgClass = darkMode ? 'bg-black' : 'bg-gray-50';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-zinc-900/50' : 'bg-white';
  const borderColor = darkMode ? 'border-white/10' : 'border-black/10';
  const hoverBorder = darkMode ? 'hover:border-zinc-700' : 'hover:border-gray-300';
  const inputBg = darkMode ? 'bg-zinc-800/50' : 'bg-gray-50';
  const inputBorder = darkMode ? 'border-zinc-700' : 'border-gray-300';
  const btnBg = darkMode ? 'bg-zinc-800' : 'bg-gray-100';
  const btnHover = darkMode ? 'hover:bg-zinc-700' : 'hover:bg-gray-200';
  const secondaryText = darkMode ? 'text-zinc-400' : 'text-gray-600';
  const tertiaryText = darkMode ? 'text-zinc-500' : 'text-gray-500';
  const navBg = darkMode ? 'bg-zinc-950/30' : 'bg-white/50';
  const renderPaletteRow = (
  title: string,
  colors: { h: number; s: number; l: number }[]
) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium opacity-70">{title}</h3>

    <div className="grid grid-cols-5 gap-3">
      {colors.map((c, i) => {
        const css = hslToCss(c.h, c.s, c.l);
        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
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

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
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
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: `radial-gradient(circle, ${hex} 0%, transparent 70%)`,
            top: '5%',
            left: '15%',
            animation: 'float 20s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 rounded-full blur-[120px] opacity-25"
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
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 pointer-events-none">
        <nav className={`border ${borderColor} ${navBg} backdrop-blur-2xl rounded-2xl transition-all duration-300
${scrolled ? 'shadow-2xl backdrop-blur-3xl' : 'shadow-lg backdrop-blur-xl'} transition-colors relative overflow-hidden max-w-7xl mx-auto pointer-events-auto`} style={{
          boxShadow: darkMode 
            ? '0 20px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)' 
            : '0 20px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
        }}>
          <div
  className="absolute inset-0 pointer-events-none"
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
      transparent 60%
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
                <Link href="/">
                <button className={`px-4 py-1.5 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-white'} text-sm font-medium transition-all font-mono shadow-sm`}>
                  Convert
                </button>
                </Link>
                <Link href="/palettes"><button className={`px-4 py-1.5 rounded-full text-sm font-medium ${secondaryText} hover:${textClass} transition-all font-mono`}>
                  Palettes
                </button></Link>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30" style={{
            background: darkMode 
              ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
          }}></div>
          <h1 className={`text-5xl font-bold mb-4 font-mono ${textClass} relative`}>
            <span className="relative inline-block">
              Colour Picker Utility
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50"></div>
            </span>
          </h1>
          <p className={`${secondaryText} text-lg max-w-2xl mx-auto font-mono`}>
            Convert various shades of your choice and manipulate them the way you want. More features are coming soon!
          </p>
        </div>

        {/* Main Grid - Swapped Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column - Controls */}
          <div className="flex flex-col gap-6 lg:w-1/2">
            {/* HEX */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <label className={`block text-sm font-medium ${secondaryText} mb-3 font-mono relative z-10`}>HEX</label>
              <div className="flex gap-2 relative z-10">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  className={`flex-1 ${inputBg} border ${inputBorder} rounded-xl px-4 py-3 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono`}
                  placeholder="#000000"
                />
                <button
                  onClick={() => copyToClipboard(hex, 'hex')}
                  className={`px-4 py-3 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-purple-500 hover:text-purple-500`}
                >
                  {copiedField === 'hex' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* RGB */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <label className={`block text-sm font-medium ${secondaryText} mb-4 font-mono relative z-10`}>RGB</label>
              <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                <div>
                  <label className={`block text-xs ${tertiaryText} mb-2 font-mono`}>R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={color.r}
                    onChange={(e) => setColor({ ...color, r: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-3 py-2.5 ${textClass} focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-center font-mono`}
                  />
                </div>
                <div>
                  <label className={`block text-xs ${tertiaryText} mb-2 font-mono`}>G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={color.g}
                    onChange={(e) => setColor({ ...color, g: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-3 py-2.5 ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-center font-mono`}
                  />
                </div>
                <div>
                  <label className={`block text-xs ${tertiaryText} mb-2 font-mono`}>B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={color.b}
                    onChange={(e) => setColor({ ...color, b: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-3 py-2.5 ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center font-mono`}
                  />
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(`rgb(${color.r}, ${color.g}, ${color.b})`, 'rgb')}
                className={`w-full flex items-center justify-center gap-2 ${btnBg} ${btnHover} rounded-xl py-2.5 transition-all border ${inputBorder} text-sm font-mono hover:border-blue-500 hover:text-blue-500 relative z-10`}
              >
                {copiedField === 'rgb' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                <span>{copiedField === 'rgb' ? 'Copied!' : `rgb(${color.r}, ${color.g}, ${color.b})`}</span>
              </button>
            </div>

            {/* HSL */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <label className={`block text-sm font-medium ${secondaryText} mb-4 font-mono relative z-10`}>HSL</label>
              
              <div className="space-y-5">
                <div className="relative z-10">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-mono">
                    <span className={tertiaryText}>Hue</span>
                    <span className={`${textClass}`}>{hsl.h}°</span>
                  </div>
                  <div 
                    className="relative w-full h-2 rounded-full cursor-pointer"
                    onMouseDown={(e) => {
                      setIsDraggingSlider('hue');
                      const rect = e.currentTarget.getBoundingClientRect();
                      const value = Math.round(((e.clientX - rect.left) / rect.width) * 360);
                      const newRgb = hslToRgb(value, hsl.s, hsl.l);
                      setColor(newRgb);
                    }}
                    onMouseMove={(e) => {
                      if (isDraggingSlider === 'hue') {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const value = Math.max(0, Math.min(359, Math.round(((e.clientX - rect.left) / rect.width) * 360)));
                        const newRgb = hslToRgb(value, hsl.s, hsl.l);
                        setColor(newRgb);
                      }
                    }}
                    style={{
                      background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'
                    }}
                  >
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                      style={{ left: `${(hsl.h / 360) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between text-sm mb-2 font-mono">
                    <span className={tertiaryText}>Saturation</span>
                    <span className={`${textClass}`}>{hsl.s}%</span>
                  </div>
                  <div 
                    className="relative w-full h-2 rounded-full cursor-pointer"
                    onMouseDown={(e) => {
                      setIsDraggingSlider('saturation');
                      const rect = e.currentTarget.getBoundingClientRect();
                      const value = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      const newRgb = hslToRgb(hsl.h, value, hsl.l);
                      setColor(newRgb);
                    }}
                    onMouseMove={(e) => {
                      if (isDraggingSlider === 'saturation') {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const value = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                        const newRgb = hslToRgb(hsl.h, value, hsl.l);
                        setColor(newRgb);
                      }
                    }}
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`
                    }}
                  >
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                      style={{ left: `${hsl.s}%` }}
                    ></div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between text-sm mb-2 font-mono">
                    <span className={tertiaryText}>Lightness</span>
                    <span className={`${textClass}`}>{hsl.l}%</span>
                  </div>
                  <div 
                    className="relative w-full h-2 rounded-full cursor-pointer"
                    onMouseDown={(e) => {
                      setIsDraggingSlider('lightness');
                      const rect = e.currentTarget.getBoundingClientRect();
                      const value = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      const newRgb = hslToRgb(hsl.h, hsl.s, value);
                      setColor(newRgb);
                    }}
                    onMouseMove={(e) => {
                      if (isDraggingSlider === 'lightness') {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const value = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                        const newRgb = hslToRgb(hsl.h, hsl.s, value);
                        setColor(newRgb);
                      }
                    }}
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`
                    }}
                  >
                    <div 
                      className="absolute w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                      style={{ left: `${hsl.l}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                className={`w-full flex items-center justify-center gap-2 ${btnBg} ${btnHover} rounded-xl py-2.5 transition-all border ${inputBorder} text-sm mt-4 font-mono hover:border-orange-500 hover:text-orange-500 relative z-10`}
              >
                {copiedField === 'hsl' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                <span>{copiedField === 'hsl' ? 'Copied!' : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}</span>
              </button>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="flex flex-col gap-8 lg:w-1/2">
            {/* Color Preview */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <label className={`block text-sm font-medium ${secondaryText} mb-3 font-mono relative z-10`}>Preview</label>
              <div 
                className="w-full h-28 rounded-xl shadow-2xl transition-all border-2 relative z-10"
                style={{ 
                  backgroundColor: hex,
                  borderColor: `${hex}40`,
                  boxShadow: `0 20px 50px -12px ${hex}60, 0 0 0 1px ${hex}20`
                }}
              ></div>
            </div>
              
            {/* Color Picker Gradient */}
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className={`block text-sm font-medium ${secondaryText} mb-3 font-mono relative z-10`}>Picker</label>
              {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
<div 
  className="w-full h-80 rounded-xl cursor-crosshair relative shadow-outer border-0 select-none z-10"
  onMouseDown={handlePickerMouseDown}
  onMouseMove={handlePickerMouseMove}
  style={{
  background: `
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))
  `,
  borderColor: `${hex}40`,
  boxShadow: `
    inset 0 2px 20px rgba(0,0,0,0.1),
    0 8px 24px -8px ${hex}40,
    0 0 0 1px ${hex}20
  `
}}
>
  {/* Picker cursor */}
  <div 
    className="absolute w-6 h-6 border-4 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    style={{ 
      left: `${pickerColor.x}%`, 
      top: `${pickerColor.y}%`,
      boxShadow:
        '0 0 0 1px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)'
    }}
  />
</div>

            
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default ColorPickerApp;