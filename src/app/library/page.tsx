"use client";
import React, { useState, useEffect } from 'react';
import { Copy, Check, Trash2, Plus, Share2, Heart, Download, Search, BookmarkPlus } from 'lucide-react';
import { useTheme } from "@/components/themeprovider";
import Reveal from '@/components/reveal';
import { useRouter, useSearchParams } from 'next/navigation';

interface SavedColor {
  id: string;
  hex: string;
  name: string;
  timestamp: number;
  favorite?: boolean;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  timestamp: number;
  favorite?: boolean;
  description?: string;
}

type ViewMode = 'colors' | 'palettes';
type SortMode = 'newest' | 'oldest' | 'name';

const LibraryPage = () => {
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [copiedField, setCopiedField] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('colors');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [isAddingPalette, setIsAddingPalette] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newPaletteDesc, setNewPaletteDesc] = useState('');
  const [newPaletteColors, setNewPaletteColors] = useState<string[]>(['#000000']);

  const { darkMode } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const colors = localStorage.getItem('huekit_saved_colors');
    const palettes = localStorage.getItem('huekit_saved_palettes');
    if (colors) setSavedColors(JSON.parse(colors));
    if (palettes) setSavedPalettes(JSON.parse(palettes));

    const colorParam = searchParams?.get('c');
    const paletteParam = searchParams?.get('p');
    
    if (colorParam) {
      try {
        const decoded = JSON.parse(atob(colorParam));
        const color: SavedColor = {
          id: Date.now().toString(),
          hex: decoded.h,
          name: decoded.n,
          favorite: decoded.f === 1,
          timestamp: Date.now()
        };
        addColorFromShared(color);
      } catch (e) {
        console.error('Failed to load shared color');
      }
    } else if (paletteParam) {
      try {
        const decoded = JSON.parse(atob(paletteParam));
        const palette: ColorPalette = {
          id: Date.now().toString(),
          name: decoded.n,
          colors: decoded.c,
          description: decoded.d,
          favorite: decoded.f === 1,
          timestamp: Date.now()
        };
        addPaletteFromShared(palette);
      } catch (e) {
        console.error('Failed to load shared palette');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('huekit_saved_colors', JSON.stringify(savedColors));
  }, [savedColors]);

  useEffect(() => {
    localStorage.setItem('huekit_saved_palettes', JSON.stringify(savedPalettes));
  }, [savedPalettes]);

  const addColorFromShared = (colorData: SavedColor) => {
    setSavedColors(prev => {
      const exists = prev.find(c => c.hex === colorData.hex);
      if (exists) return prev;
      return [...prev, { ...colorData, id: Date.now().toString() }];
    });
  };

  const addPaletteFromShared = (paletteData: ColorPalette) => {
    setSavedPalettes(prev => {
      const exists = prev.find(p => p.name === paletteData.name);
      if (exists) return prev;
      return [...prev, { ...paletteData, id: Date.now().toString() }];
    });
  };

  const addColor = () => {
    if (!newColorHex || !newColorName.trim()) return;
    const newColor: SavedColor = {
      id: Date.now().toString(),
      hex: newColorHex,
      name: newColorName.trim(),
      timestamp: Date.now(),
      favorite: false
    };
    setSavedColors([newColor, ...savedColors]);
    setNewColorHex('#000000');
    setNewColorName('');
    setIsAddingColor(false);
  };

  const addPalette = () => {
    if (!newPaletteName.trim() || newPaletteColors.length === 0) return;
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: newPaletteName.trim(),
      description: newPaletteDesc.trim(),
      colors: newPaletteColors.filter(c => c),
      timestamp: Date.now(),
      favorite: false
    };
    setSavedPalettes([newPalette, ...savedPalettes]);
    setNewPaletteName('');
    setNewPaletteDesc('');
    setNewPaletteColors(['#000000']);
    setIsAddingPalette(false);
  };

  const deleteColor = (id: string) => {
    setSavedColors(savedColors.filter(c => c.id !== id));
  };

  const deletePalette = (id: string) => {
    setSavedPalettes(savedPalettes.filter(p => p.id !== id));
  };

  const toggleFavoriteColor = (id: string) => {
    setSavedColors(savedColors.map(c => 
      c.id === id ? { ...c, favorite: !c.favorite } : c
    ));
  };

  const toggleFavoritePalette = (id: string) => {
    setSavedPalettes(savedPalettes.map(p => 
      p.id === id ? { ...p, favorite: !p.favorite } : p
    ));
  };

  const shareColor = (color: SavedColor) => {
    const compact = { h: color.hex, n: color.name, f: color.favorite ? 1 : 0 };
    const encoded = btoa(JSON.stringify(compact)).replace(/=/g, '');
    const url = `${window.location.origin}/library?c=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedField(`share-color-${color.id}`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const sharePalette = (palette: ColorPalette) => {
    const compact = { n: palette.name, c: palette.colors, d: palette.description, f: palette.favorite ? 1 : 0 };
    const encoded = btoa(JSON.stringify(compact)).replace(/=/g, '');
    const url = `${window.location.origin}/library?p=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedField(`share-palette-${palette.id}`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const exportAsJSON = () => {
    const data = {
      colors: savedColors,
      palettes: savedPalettes,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `huekit-library-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addColorToPalette = (index: number, hex: string) => {
    const updated = [...newPaletteColors];
    updated[index] = hex;
    setNewPaletteColors(updated);
  };

  const removeColorFromPalette = (index: number) => {
    setNewPaletteColors(newPaletteColors.filter((_, i) => i !== index));
  };

  const filterAndSort = <T extends { name: string; timestamp: number; favorite?: boolean }>(items: T[]) => {
    let filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.favorite);
    }

    return filtered.sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filteredColors = filterAndSort(savedColors);
  const filteredPalettes = filterAndSort(savedPalettes);

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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${darkMode ? 'rgba(99,102,241,0.9)' : 'rgba(59,130,246,0.6)'} 35px, ${darkMode ? 'rgba(99,102,241,0.9)' : 'rgba(59,130,246,0.6)'} 36px)`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-36 pb-16 relative z-10">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30" style={{
            background: darkMode 
              ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
          }}></div>
          <Reveal>
            <h1 className={`text-5xl font-bold mb-4 font-mono ${textClass} relative`}>
              <span className="relative inline-block">
                Color Library
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full opacity-50"></div>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className={`${secondaryText} text-lg max-w-2xl mx-auto font-mono`}>
              Save your favorite colors and palettes. Share them with unique URLs or export as JSON.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className={`flex items-center rounded-xl p-1.5 ${darkMode ? 'bg-black/30' : 'bg-white/60'} backdrop-blur-xl border ${borderColor} shadow-inner`}>
                <button
                  onClick={() => setViewMode('colors')}
                  className={`px-4 py-2 font-mono text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'colors'
                      ? `${darkMode ? 'bg-purple-500/30 text-white' : 'bg-purple-500/25 text-gray-900'} shadow-md`
                      : `${tertiaryText} hover:text-current`
                  }`}
                >
                  Colors ({savedColors.length})
                </button>
                <button
                  onClick={() => setViewMode('palettes')}
                  className={`px-4 py-2 font-mono text-sm font-semibold rounded-lg transition-all ${
                    viewMode === 'palettes'
                      ? `${darkMode ? 'bg-purple-500/30 text-white' : 'bg-purple-500/25 text-gray-900'} shadow-md`
                      : `${tertiaryText} hover:text-current`
                  }`}
                >
                  Palettes ({savedPalettes.length})
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewMode === 'colors' ? setIsAddingColor(true) : setIsAddingPalette(true)}
                  className={`flex items-center gap-2 px-4 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-purple-500 hover:text-purple-500 font-mono text-sm`}
                >
                  <Plus size={16} />
                  Add {viewMode === 'colors' ? 'Color' : 'Palette'}
                </button>
                <button
                  onClick={exportAsJSON}
                  className={`flex items-center gap-2 px-4 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-blue-500 hover:text-blue-500 font-mono text-sm`}
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${tertiaryText}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl pl-10 pr-4 py-2.5 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-sm`}
                  />
                </div>
              </div>
              
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className={`${inputBg} border ${inputBorder} rounded-xl px-4 py-2.5 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono cursor-pointer text-sm`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 ${showFavoritesOnly ? 'bg-pink-500/20 border-pink-500 text-pink-500' : `${btnBg} ${inputBorder}`} border rounded-xl transition-all hover:border-pink-500 hover:text-pink-500 font-mono text-sm`}
              >
                <Heart size={16} className={showFavoritesOnly ? 'fill-current' : ''} />
                Favorites
              </button>
            </div>
          </div>
        </Reveal>

        {isAddingColor && (
          <Reveal delay={0}>
            <div className={`mb-8 ${cardBg} border ${borderColor} rounded-2xl p-6 shadow-lg`}>
              <h3 className={`text-xl font-bold mb-4 font-mono ${textClass}`}>Add New Color</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${secondaryText} mb-2 font-mono`}>Color</label>
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className={`w-full h-12 ${inputBg} border ${inputBorder} rounded-xl cursor-pointer`}
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className={`w-full mt-2 ${inputBg} border ${inputBorder} rounded-xl px-4 py-2 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono`}
                    placeholder="#000000"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${secondaryText} mb-2 font-mono`}>Name</label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-4 py-2 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono`}
                    placeholder="e.g., Ocean Blue"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addColor}
                  disabled={!newColorHex || !newColorName.trim()}
                  className={`flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Add Color
                </button>
                <button
                  onClick={() => setIsAddingColor(false)}
                  className={`px-4 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} font-mono`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {isAddingPalette && (
          <Reveal delay={0}>
            <div className={`mb-8 ${cardBg} border ${borderColor} rounded-2xl p-6 shadow-lg`}>
              <h3 className={`text-xl font-bold mb-4 font-mono ${textClass}`}>Add New Palette</h3>
              <div className="space-y-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${secondaryText} mb-2 font-mono`}>Palette Name</label>
                  <input
                    type="text"
                    value={newPaletteName}
                    onChange={(e) => setNewPaletteName(e.target.value)}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-4 py-2 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono`}
                    placeholder="e.g., Sunset Vibes"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${secondaryText} mb-2 font-mono`}>Description (Optional)</label>
                  <input
                    type="text"
                    value={newPaletteDesc}
                    onChange={(e) => setNewPaletteDesc(e.target.value)}
                    className={`w-full ${inputBg} border ${inputBorder} rounded-xl px-4 py-2 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono`}
                    placeholder="Brief description of your palette"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-medium ${secondaryText} font-mono`}>Colors</label>
                    <button
                      onClick={() => setNewPaletteColors([...newPaletteColors, '#000000'])}
                      className={`text-sm ${secondaryText} hover:text-purple-500 transition-colors font-mono`}
                    >
                      + Add Color
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {newPaletteColors.map((color, index) => (
                      <div key={index} className="relative">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => addColorToPalette(index, e.target.value)}
                          className={`w-full h-20 ${inputBg} border ${inputBorder} rounded-xl cursor-pointer`}
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => addColorToPalette(index, e.target.value)}
                          className={`w-full mt-2 ${inputBg} border ${inputBorder} rounded-xl px-2 py-1 ${textClass} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono text-xs`}
                        />
                        {newPaletteColors.length > 1 && (
                          <button
                            onClick={() => removeColorFromPalette(index)}
                            className={`absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPalette}
                  disabled={!newPaletteName.trim() || newPaletteColors.length === 0}
                  className={`flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Add Palette
                </button>
                <button
                  onClick={() => setIsAddingPalette(false)}
                  className={`px-4 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} font-mono`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {viewMode === 'colors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColors.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Reveal>
                  <BookmarkPlus size={48} className={`mx-auto mb-4 ${tertiaryText}`} />
                  <p className={`${secondaryText} font-mono`}>
                    {searchQuery || showFavoritesOnly ? 'No colors found' : 'No saved colors yet. Add your first color!'}
                  </p>
                </Reveal>
              </div>
            ) : (
              filteredColors.map((color, index) => (
                <Reveal key={color.id} delay={index * 40}>
                  <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                      <div 
                        className="w-full h-32 rounded-xl mb-4 shadow-lg border-2"
                        style={{ 
                          backgroundColor: color.hex,
                          borderColor: `${color.hex}40`,
                          boxShadow: `0 10px 30px -10px ${color.hex}60`
                        }}
                      ></div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-bold font-mono ${textClass} text-lg`}>{color.name}</h3>
                          <p className={`${tertiaryText} font-mono text-sm`}>{color.hex}</p>
                        </div>
                        <button
                          onClick={() => toggleFavoriteColor(color.id)}
                          className={`p-2 rounded-lg transition-all ${color.favorite ? 'text-pink-500' : tertiaryText} hover:text-pink-500`}
                        >
                          <Heart size={18} className={color.favorite ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(color.hex, `color-${color.id}`)}
                          className={`flex-1 flex items-center justify-center gap-2 ${btnBg} ${btnHover} rounded-xl py-2 transition-all border ${inputBorder} text-sm font-mono hover:border-purple-500 hover:text-purple-500`}
                        >
                          {copiedField === `color-${color.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          Copy
                        </button>
                        <button
                          onClick={() => shareColor(color)}
                          className={`px-3 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-blue-500 hover:text-blue-500`}
                        >
                          {copiedField === `share-color-${color.id}` ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                        </button>
                        <button
                          onClick={() => deleteColor(color.id)}
                          className={`px-3 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-red-500 hover:text-red-500`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        )}

        {viewMode === 'palettes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPalettes.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Reveal>
                  <BookmarkPlus size={48} className={`mx-auto mb-4 ${tertiaryText}`} />
                  <p className={`${secondaryText} font-mono`}>
                    {searchQuery || showFavoritesOnly ? 'No palettes found' : 'No saved palettes yet. Create your first palette!'}
                  </p>
                </Reveal>
              </div>
            ) : (
              filteredPalettes.map((palette, index) => (
                <Reveal key={palette.id} delay={index * 40}>
                  <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 ${hoverBorder} transition-all backdrop-blur-sm shadow-sm hover:shadow-md relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                      <div className="flex gap-2 mb-4 h-24 rounded-xl overflow-hidden shadow-lg">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="flex-1 transition-all hover:flex-[1.5] cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(color, `palette-${palette.id}-color-${i}`)}
                            title={`Click to copy ${color}`}
                          ></div>
                        ))}
                      </div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-bold font-mono ${textClass} text-lg`}>{palette.name}</h3>
                          {palette.description && (
                            <p className={`${tertiaryText} font-mono text-sm mt-1`}>{palette.description}</p>
                          )}
                          <p className={`${tertiaryText} font-mono text-xs mt-1`}>{palette.colors.length} colors</p>
                        </div>
                        <button
                          onClick={() => toggleFavoritePalette(palette.id)}
                          className={`p-2 rounded-lg transition-all ${palette.favorite ? 'text-pink-500' : tertiaryText} hover:text-pink-500`}
                        >
                          <Heart size={18} className={palette.favorite ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {palette.colors.map((color, i) => (
                          <button
                            key={i}
                            onClick={() => copyToClipboard(color, `palette-${palette.id}-color-${i}`)}
                            className={`px-3 py-1.5 ${btnBg} ${btnHover} rounded-lg transition-all border ${inputBorder} text-xs font-mono hover:border-purple-500`}
                          >
                            {copiedField === `palette-${palette.id}-color-${i}` ? <Check size={12} className="inline text-green-500" /> : color}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(palette.colors.join(', '), `palette-all-${palette.id}`)}
                          className={`flex-1 flex items-center justify-center gap-2 ${btnBg} ${btnHover} rounded-xl py-2 transition-all border ${inputBorder} text-sm font-mono hover:border-purple-500 hover:text-purple-500`}
                        >
                          {copiedField === `palette-all-${palette.id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          Copy All
                        </button>
                        <button
                          onClick={() => sharePalette(palette)}
                          className={`px-3 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-blue-500 hover:text-blue-500`}
                        >
                          {copiedField === `share-palette-${palette.id}` ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                        </button>
                        <button
                          onClick={() => deletePalette(palette.id)}
                          className={`px-3 py-2 ${btnBg} ${btnHover} rounded-xl transition-all border ${inputBorder} hover:border-red-500 hover:text-red-500`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        input[type="color"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-color: transparent;
          cursor: pointer;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 0.75rem;
        }
        input[type="color"]::-moz-color-swatch {
          border: none;
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default LibraryPage;