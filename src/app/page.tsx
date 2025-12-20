"use client";
import React, { useState, useEffect } from 'react';
import { Copy, Check, Github, User, Sun, Moon, UserCircle } from 'lucide-react';
import Link from 'next/link';

import { useTheme } from "@/components/themeprovider";
import Reveal from '@/components/reveal';

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const ColorPickerApp = () => {
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 });
  const [copiedField, setCopiedField] = useState('');
  const [pickerColor, setPickerColor] = useState({ x: 100, y: 0 });
  const [hexInput, setHexInput] = useState('#ff0000');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<null | 'hue' | 'saturation' | 'lightness'>(null);

  const { darkMode } = useTheme();

  const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
  const hslToCss = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
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
    // Always sync hexInput with current color
    setHexInput(hex);
  }, [hex]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handlePickerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
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

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${darkMode ? 'rgba(99,102,241,0.9)' : 'rgba(59,130,246,0.6)'} 35px, ${darkMode ? 'rgba(99,102,241,0.9)' : 'rgba(59,130,246,0.6)'} 36px)`,
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
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30" style={{
            background: darkMode 
              ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
          }}></div>
          <Reveal>
            <h1 className={`text-5xl font-bold mb-4 font-mono ${textClass} relative`}>
              <span className="relative inline-block">
                Color Calculator
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50"></div>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className={`${secondaryText} text-lg max-w-2xl mx-auto font-mono`}>
              Convert various shades of your choice and manipulate them the way you want. More features are coming soon!
            </p>
          </Reveal>
        </div>

        {/* Main Grid - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-8">
            {/* HEX */}
            <Reveal delay={180}>
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
            </Reveal>

            {/* RGB */}
            <Reveal delay={200}>
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
            </Reveal>

            {/* HSL */}
            <Reveal delay={220}>
              <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <label className={`block text-sm font-medium ${secondaryText} mb-4 font-mono relative z-10`}>HSL</label>
                
                <div className="space-y-5 relative z-10">
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

                  <div>
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

                  <div>
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
            </Reveal>
          </div>

          {/* Right Column - Preview & Picker */}
          <div className="space-y-8">
            {/* Color Preview */}
            <Reveal delay={180}>
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
            </Reveal>
              
            {/* Color Picker Gradient */}
            <Reveal delay={200}>
              <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <label className={`block text-sm font-medium ${secondaryText} mb-3 font-mono relative z-10`}>Picker</label>
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
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)'
                    }}
                  />
                </div>
              </div>
            </Reveal>
          </div>
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