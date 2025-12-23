/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, Upload, X } from 'lucide-react';
import { useTheme } from "@/components/themeprovider";
import Reveal from '@/components/reveal';

/* ---------- TYPES ---------- */

type HSL = {
  h: number;
  s: number;
  l: number;
};

type RGB = {
  r: number;
  g: number;
  b: number;
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

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
};

/* ---------- IMAGE COLOR EXTRACTION ---------- */
const extractColorsFromImage = (imageFile: File): Promise<RGB[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Resize image for faster processing
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

      if (!imageData) {
        reject(new Error('Failed to get image data'));
        return;
      }

      // Use k-means clustering to extract dominant colors
      const colors: RGB[] = [];
      const pixels: RGB[] = [];

      // Sample pixels (every 4th pixel for performance)
      for (let i = 0; i < imageData.data.length; i += 16) {
        pixels.push({
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2],
        });
      }

      // Simple k-means clustering for 8 colors
      const k = 8;
      const maxIterations = 10;
      let centroids: RGB[] = [];

      // Initialize centroids randomly
      for (let i = 0; i < k; i++) {
        centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
      }

      // K-means iterations
      for (let iter = 0; iter < maxIterations; iter++) {
        const clusters: RGB[][] = Array(k).fill(null).map(() => []);

        // Assign pixels to nearest centroid
        pixels.forEach(pixel => {
          let minDist = Infinity;
          let closestCluster = 0;

          centroids.forEach((centroid, idx) => {
            const dist = Math.sqrt(
              Math.pow(pixel.r - centroid.r, 2) +
              Math.pow(pixel.g - centroid.g, 2) +
              Math.pow(pixel.b - centroid.b, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              closestCluster = idx;
            }
          });

          clusters[closestCluster].push(pixel);
        });

        // Update centroids
        centroids = clusters.map(cluster => {
          if (cluster.length === 0) return centroids[0];
          const sum = cluster.reduce(
            (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
            { r: 0, g: 0, b: 0 }
          );
          return {
            r: sum.r / cluster.length,
            g: sum.g / cluster.length,
            b: sum.b / cluster.length,
          };
        });
      }

      resolve(centroids);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};

/* ---------- IMPROVED PALETTE GENERATORS ---------- */

const generateTints = ({ h, s, l }: HSL) => {
  return [15, 30, 45, 60, 75].map(amount => ({
    h,
    s: Math.max(5, s - amount * 0.3),
    l: clamp(l + amount),
  }));
};

const generateShades = ({ h, s, l }: HSL) => {
  return [15, 30, 45, 60, 75].map(amount => ({
    h,
    s: Math.max(0, s - amount * 0.25),
    l: clamp(l - amount),
  }));
};

const generateAnalogous = ({ h, s, l }: HSL) => {
  return [-30, -15, 15, 30].map(offset => ({
    h: (h + offset + 360) % 360,
    s: clamp(s + (Math.random() * 10 - 5)),
    l: clamp(l + (Math.random() * 10 - 5)),
  }));
};

const generateTriadic = ({ h, s, l }: HSL) => {
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
  return [
    { h, s, l },
    { h: (h + 150) % 360, s, l },
    { h: (h + 210) % 360, s, l },
  ];
};

const generateTetradic = ({ h, s, l }: HSL) => {
  return [0, 90, 180, 270].map(offset => ({
    h: (h + offset) % 360,
    s,
    l,
  }));
};

const generateMonochromatic = ({ h, s, l }: HSL) => {
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
              <div
                className="h-24 rounded-xl border-2 border-black/10 dark:border-white/10 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl overflow-hidden relative"
                style={{ 
                  background: hslStr,
                  boxShadow: `0 8px 32px -8px ${hex}40`
                }}
              >
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

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {isCopied ? (
                    <Check size={24} className="text-white drop-shadow-2xl" strokeWidth={3} />
                  ) : (
                    <Copy size={24} className="text-white drop-shadow-2xl" strokeWidth={2} />
                  )}
                </div>
              </div>

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

  const [mode, setMode] = useState<'generative' | 'custom'>('generative');
  const [baseHsl, setBaseHsl] = useState({
    h: 210,
    s: 80,
    l: 50,
  });
  const [inputFormat, setInputFormat] = useState<"HEX" | "RGB">("HEX");
  const [colorInput, setColorInput] = useState("#3B82F6");
  const [copiedStates, setCopiedStates] = useState<Record<string, { index: number; format: string } | null>>({});
  const [isDraggingSlider, setIsDraggingSlider] = useState<'hue' | 'saturation' | 'lightness' | null>(null);
  
  // Custom mode states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<RGB[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hex = hslToHex(baseHsl.h, baseHsl.s, baseHsl.l);

  useEffect(() => {
    if (isDraggingSlider) {
      const handleMouseUp = () => setIsDraggingSlider(null);
      const handleTouchEnd = () => setIsDraggingSlider(null);
      
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

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDraggingSlider) return;

        const slider = document.getElementById(`slider-${isDraggingSlider}`);
        if (!slider) return;

        const touch = e.touches[0];
        const rect = slider.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
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
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
      
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchmove', handleTouchMove);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    try {
      const colors = await extractColorsFromImage(file);
      setExtractedColors(colors);
    } catch (error) {
      console.error('Error extracting colors:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setExtractedColors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`min-h-screen overflow-y-auto ${bgClass} ${textClass} transition-colors duration-300 relative`}>
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 35px, ${darkMode ? 'rgba(99,102,241,0.5)' : 'rgba(59,130,246,0.3)'} 36px)`,
        }}></div>
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: `radial-gradient(circle, ${hex} 0%, transparent 70%)`,
            top: '10%',
            left: '10%',
            animation: 'float 25s ease-in-out infinite'
          }}
        ></div>
        
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            top: '20%',
            right: '15%',
            animation: 'float 20s ease-in-out infinite reverse'
          }}
        ></div>

        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[90px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            bottom: '15%',
            left: '20%',
            animation: 'float 30s ease-in-out infinite'
          }}
        ></div>
      </div>

      {/* Noise texture */}
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

        {/* Mode Switcher */}
        <Reveal delay={120}>
          <div className={`${glassCard} border ${borderColor} rounded-2xl p-2 mb-8 max-w-md mx-auto shadow-2xl flex gap-2`}>
            <button
              onClick={() => setMode('generative')}
              className={`flex-1 py-3 px-6 rounded-xl font-mono font-semibold transition-all ${
                mode === 'generative'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : `${inputBg} ${textClass} hover:bg-opacity-80`
              }`}
            >
              Generative
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-3 px-6 rounded-xl font-mono font-semibold transition-all ${
                mode === 'custom'
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                  : `${inputBg} ${textClass} hover:bg-opacity-80`
              }`}
            >
              Custom
            </button>
          </div>
        </Reveal>

        {/* Generative Mode */}
        {mode === 'generative' && (
          <>
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
                      className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none touch-none"
                      onMouseDown={(e) => {
                        setIsDraggingSlider('hue');
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const hue = Math.round((x / rect.width) * 360);
                        const newHsl = { h: hue, s: baseHsl.s, l: baseHsl.l };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(hue, baseHsl.s, baseHsl.l));
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setIsDraggingSlider('hue');
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const hue = Math.round((x / rect.width) * 360);
                        const newHsl = { h: hue, s: baseHsl.s, l: baseHsl.l };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(hue, baseHsl.s, baseHsl.l));
                      }}
                      style={{
                        background: 'linear-gradient(to right, hsl(0, 80%, 50%), hsl(30, 80%, 50%), hsl(60, 80%, 50%), hsl(90, 80%, 50%), hsl(120, 80%, 50%), hsl(150, 80%, 50%), hsl(180, 80%, 50%), hsl(210, 80%, 50%), hsl(240, 80%, 50%), hsl(270, 80%, 50%), hsl(300, 80%, 50%), hsl(330, 80%, 50%), hsl(360, 80%, 50%))'
                      }}
                    >
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
                      className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none touch-none"
                      onMouseDown={(e) => {
                        setIsDraggingSlider('saturation');
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const saturation = Math.round((x / rect.width) * 100);
                        const newHsl = { h: baseHsl.h, s: saturation, l: baseHsl.l };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(baseHsl.h, saturation, baseHsl.l));
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setIsDraggingSlider('saturation');
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const saturation = Math.round((x / rect.width) * 100);
                        const newHsl = { h: baseHsl.h, s: saturation, l: baseHsl.l };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(baseHsl.h, saturation, baseHsl.l));
                      }}
                      style={{
                        background: `linear-gradient(to right, hsl(${baseHsl.h}, 0%, 50%), hsl(${baseHsl.h}, 100%, 50%))`
                      }}
                    >
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
                      className="relative w-full h-10 rounded-lg cursor-pointer border-2 border-white/10 overflow-hidden select-none touch-none"
                      onMouseDown={(e) => {
                        setIsDraggingSlider('lightness');
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const lightness = Math.round((x / rect.width) * 100);
                        const newHsl = { h: baseHsl.h, s: baseHsl.s, l: lightness };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(baseHsl.h, baseHsl.s, lightness));
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setIsDraggingSlider('lightness');
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const lightness = Math.round((x / rect.width) * 100);
                        const newHsl = { h: baseHsl.h, s: baseHsl.s, l: lightness };
                        setBaseHsl(newHsl);
                        setColorInput(hslToHex(baseHsl.h, baseHsl.s, lightness));
                      }}
                      style={{
                        background: `linear-gradient(to right, hsl(${baseHsl.h}, ${baseHsl.s}%, 0%), hsl(${baseHsl.h}, ${baseHsl.s}%, 100%))`
                      }}
                    >
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                        style={{ left: `${baseHsl.l}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Palette Grid - Generative */}
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
          </>
        )}

        {/* Custom Mode - Image Upload */}
        {mode === 'custom' && (
          <>
            <Reveal delay={150}>
              <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-2xl`}>
                <label className={`block text-sm font-mono ${secondaryText} uppercase tracking-wider mb-4`}>
                  Upload Image
                </label>
                
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${borderColor} rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-purple-500 hover:bg-white/5`}
                  >
                    <Upload size={48} className="mx-auto mb-4 opacity-50" />
                    <p className={`${secondaryText} font-mono mb-2`}>
                      Click to upload an image
                    </p>
                    <p className={`text-xs ${secondaryText} font-mono opacity-60`}>
                      PNG, JPG, or WEBP • Max 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all backdrop-blur-sm"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                    
                    {isExtracting && (
                      <p className={`text-center ${secondaryText} font-mono text-sm`}>
                        Extracting colors...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Reveal>

            {extractedColors.length > 0 && (
              <>
                {/* Extracted Colors Palette */}
                <Reveal delay={200}>
                  <div className={`${glassCard} border ${borderColor} rounded-2xl p-8 mb-8 transition-all hover:shadow-2xl`}>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-mono font-semibold mb-1">Extracted Colors</h3>
                        <p className="text-xs opacity-60 font-mono leading-relaxed">
                          Dominant colors extracted from your image using k-means clustering.
                        </p>
                      </div>

                      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                        {extractedColors.map((rgb, i) => {
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                          const rgbStr = `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
                          const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                          const isCopied = copiedStates['extracted']?.index === i;
                          const copiedFormat = copiedStates['extracted']?.format;

                          return (
                            <div key={i} className="group relative">
                              <div
                                className="h-24 rounded-xl border-2 border-black/10 dark:border-white/10 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl overflow-hidden relative"
                                style={{ 
                                  backgroundColor: hex,
                                  boxShadow: `0 8px 32px -8px ${hex}40`
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-2 gap-1">
                                  <div className="flex gap-1 w-full">
                                    <button
                                      onClick={() => handleCopy('extracted', hsl, i, 'hex')}
                                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-1 py-1 text-[10px] font-mono text-white transition-all"
                                      title={hex}
                                    >
                                      {isCopied && copiedFormat === 'hex' ? '✓' : 'HEX'}
                                    </button>
                                    <button
                                      onClick={() => handleCopy('extracted', hsl, i, 'rgb')}
                                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-1 py-1 text-[10px] font-mono text-white transition-all"
                                      title={rgbStr}
                                    >
                                      {isCopied && copiedFormat === 'rgb' ? '✓' : 'RGB'}
                                    </button>
                                    <button
                                      onClick={() => handleCopy('extracted', hsl, i, 'hsl')}
                                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-1 py-1 text-[10px] font-mono text-white transition-all"
                                      title={hslStr}
                                    >
                                      {isCopied && copiedFormat === 'hsl' ? '✓' : 'HSL'}
                                    </button>
                                  </div>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  {isCopied ? (
                                    <Check size={20} className="text-white drop-shadow-2xl" strokeWidth={3} />
                                  ) : (
                                    <Copy size={20} className="text-white drop-shadow-2xl" strokeWidth={2} />
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 text-center">
                                <p className="text-[10px] font-mono opacity-70 truncate">{hex}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Generative Palettes for Each Extracted Color */}
                <div className="space-y-12">
                  {extractedColors.slice(0, 4).map((rgb, colorIndex) => {
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

                    return (
                      <div key={colorIndex} className="space-y-6">
                        <Reveal delay={240 + colorIndex * 40}>
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl border-2 border-white/30 shadow-lg flex-shrink-0"
                              style={{ backgroundColor: hex }}
                            ></div>
                            <h2 className={`text-2xl font-bold font-mono ${textClass}`}>
                              Palettes from Color #{colorIndex + 1}
                            </h2>
                          </div>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Reveal delay={260 + colorIndex * 40}>
                            <div className={`${glassCard} border ${borderColor} rounded-2xl p-6 transition-all hover:shadow-2xl`}>
                              <PaletteRow
                                title="Tints"
                                description="Lighter variations"
                                colors={generateTints(hsl)}
                                copiedIndex={copiedStates[`color${colorIndex}-tints`]?.index ?? null}
                                copiedFormat={copiedStates[`color${colorIndex}-tints`]?.format ?? null}
                                onCopy={(color, idx, format) => handleCopy(`color${colorIndex}-tints`, color, idx, format)}
                              />
                            </div>
                          </Reveal>

                          <Reveal delay={280 + colorIndex * 40}>
                            <div className={`${glassCard} border ${borderColor} rounded-2xl p-6 transition-all hover:shadow-2xl`}>
                              <PaletteRow
                                title="Shades"
                                description="Darker variations"
                                colors={generateShades(hsl)}
                                copiedIndex={copiedStates[`color${colorIndex}-shades`]?.index ?? null}
                                copiedFormat={copiedStates[`color${colorIndex}-shades`]?.format ?? null}
                                onCopy={(color, idx, format) => handleCopy(`color${colorIndex}-shades`, color, idx, format)}
                              />
                            </div>
                          </Reveal>

                          <Reveal delay={300 + colorIndex * 40}>
                            <div className={`${glassCard} border ${borderColor} rounded-2xl p-6 transition-all hover:shadow-2xl`}>
                              <PaletteRow
                                title="Analogous"
                                description="Adjacent colors"
                                colors={generateAnalogous(hsl)}
                                copiedIndex={copiedStates[`color${colorIndex}-analogous`]?.index ?? null}
                                copiedFormat={copiedStates[`color${colorIndex}-analogous`]?.format ?? null}
                                onCopy={(color, idx, format) => handleCopy(`color${colorIndex}-analogous`, color, idx, format)}
                              />
                            </div>
                          </Reveal>

                          <Reveal delay={320 + colorIndex * 40}>
                            <div className={`${glassCard} border ${borderColor} rounded-2xl p-6 transition-all hover:shadow-2xl`}>
                              <PaletteRow
                                title="Complementary"
                                description="Opposite colors"
                                colors={generateComplementary(hsl)}
                                copiedIndex={copiedStates[`color${colorIndex}-complementary`]?.index ?? null}
                                copiedFormat={copiedStates[`color${colorIndex}-complementary`]?.format ?? null}
                                onCopy={(color, idx, format) => handleCopy(`color${colorIndex}-complementary`, color, idx, format)}
                              />
                            </div>
                          </Reveal>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
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
      `}</style>
    </div>
  );
} 