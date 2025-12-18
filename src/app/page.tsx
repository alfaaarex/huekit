// app/page.tsx
"use client"
import { Palettes } from "./palettes"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { HexColorPicker } from "react-colorful"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Sun, UserCircle } from "lucide-react"
import Link from "next/link"
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "")
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  )
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export default function Page() {
  const [hex, setHex] = useState("#ff0000")
  const [tab, setTab] = useState("convert")
  const tabRefs = {
  convert: useRef<HTMLButtonElement>(null),
  about: useRef<HTMLButtonElement>(null),
  palettes: useRef<HTMLButtonElement>(null),
}

const [pillStyle, setPillStyle] = useState({ x: 0, width: 0 })
const [{ r, g, b }, setRgb] = useState(() => hexToRgb(hex))
useEffect(() => {
  setRgb(hexToRgb(hex))
}, [hex])


useEffect(() => {
  const el = tabRefs[tab as keyof typeof tabRefs]?.current
  if (!el) return

  setPillStyle({
    x: el.offsetLeft,
    width: el.offsetWidth,
  })
}, [tab])
const [{ h, s, l }, setHsl] = useState(() => rgbToHsl(r, g, b))

useEffect(() => {
  setHsl(rgbToHsl(r, g, b))
}, [r, g, b])


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background glow */}
      {/* Background layers */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {/* Radial glow */}
  <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(152,117,193,0.08),transparent_50%)]" />

  {/* Wireframe grid */}
  <div
    className="
      absolute inset-0
      opacity-[0.08]
      bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),
          linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)]
      bg-[size:64px_64px]
    "
  />
</div>
{/* Subtle noise */}
<div
  className="absolute inset-0 opacity-[0.03] pointer-events-none"
  style={{
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
  }}
/>


      {/* NAVBAR */}
      <header className="sticky top-6 z-50">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-xl"
        >
          <div className="grid grid-cols-3 items-center px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-2 font-semibold text-2xl italic tracking-wide">
              <span className="text-orange-400">▲</span> HUEKIT
            </div>

            {/* Tabs */}
            <nav className="flex justify-center">
              <Tabs value={tab} onValueChange={setTab}>
               <TabsList className="relative rounded-2xl bg-black/40 p-1 backdrop-blur-md">
  <div className="relative flex">
    {/* Active pill */}
    <motion.span
  className="absolute inset-1 rounded-2xl z-0 pointer-events-none"
  animate={pillStyle}
  transition={{ type: "spring", stiffness: 320, damping: 30 }}
  style={{
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.18))",
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.14) inset,
      0 6px 20px rgba(0,0,0,0.4),
      0 0 24px ${hex}55
    `,
  }}
/>




    {/* Tabs */}
    <TabsTrigger
  ref={tabRefs.convert}
  value="convert"
  className="relative z-10 px-6 py-2 text-sm font-medium
             text-white/60 data-[state=active]:text-white
             bg-transparent hover:bg-transparent
             data-[state=active]:bg-transparent"
>
  Convert
</TabsTrigger>

<TabsTrigger
  ref={tabRefs.palettes}
  value="palettes"
  className="relative z-10 px-6 py-2 text-sm font-medium
             text-white/60 data-[state=active]:text-white
             bg-transparent hover:bg-transparent
             data-[state=active]:bg-transparent"
>
  Palettes
</TabsTrigger>

  </div>
</TabsList>


              </Tabs>
            </nav>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon"> <Link href="https://github.com/alfaaarex/color-tool"><Github className="h-4 w-4" /></Link></Button>
              <Button variant="ghost" size="icon"><Link href="https://agni.is-a.dev"><UserCircle className="h-4 w-4" /></Link></Button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* MAIN */}
      {/* Header */}
    <div className="space-y-3">
  <h2 className="text-2xl pt-20 font-semibold max-w-xl leading-relaxed text-center mx-auto max-w-5xl px-6 space-y-14">
    Colour Picker Utility
  </h2>
  <p className="text-sm text-white/60 max-w-xl leading-relaxed text-center mx-auto max-w-5xl px-6 space-y-14">
    Convert various shades of your choice and manipulate them the way you want. More features are coming soon!
  </p>
</div>
      {tab === "convert" && (
  <>
    {/* Inputs */}
    <main className="mx-auto mt-20 grid max-w-5xl grid-cols-[1fr_320px] gap-16 px-6">
        {/* Inputs */}
        <section className="
  relative
  rounded-2xl
  border border-white/10
  bg-white/[0.06]
  backdrop-blur-xl
  p-8
  space-y-10
  shadow-[0_20px_50px_rgba(0,0,0,0.45)]
">
          <div className="space-y-2">
  
  <div className="space-y-2">
  <label className="text-sm text-white/70">HEX</label>
  <Input
    value={hex}
    onChange={e => {
      let v = e.target.value
      if (!v.startsWith("#")) v = "#" + v
      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setHex(v)
    }}
    className="
  h-14 rounded-2xl
  bg-white/15 border-white/20
  font-mono text-xl tracking-wider text-white
  shadow-inner
  focus:outline-none focus:ring-0
  focus-visible:ring-2 focus-visible:ring-white/25
"

  />
</div>
<label className="text-sm text-white/70">RGB</label>
<div className="rounded-2xl bg-black/30 p-4 space-y-3">
    <div className="grid grid-cols-3 gap-3">
    {[
      { label: "R", value: r, key: "r" },
      { label: "G", value: g, key: "g" },
      { label: "B", value: b, key: "b" },
    ].map(({ label, value, key }) => (
      <div key={key} className="space-y-1">
        <span className="text-xs text-white/50">{label}</span>
        <Input
          type="number"
          min={0}
          max={255}
          value={value}
          onChange={e => {
            const next = {
              r,
              g,
              b,
              [key]: Number(e.target.value),
            } as { r: number; g: number; b: number }

            setRgb(next)
            setHex(rgbToHex(next.r, next.g, next.b))
          }}
          className="
  h-10 rounded-2xl
  bg-white/10 border-white/10 text-white
  focus:outline-none
  focus:ring-0
  focus-visible:ring-2
  focus-visible:ring-white/20
"
        />
      </div>
    ))}
  </div>
</div>


<div className="space-y-5">
  <label className="text-sm text-white/70">HSL</label>

  {/* Hue */}
  <div className="rounded-lg bg-black/30 px-4 py-3 space-y-1">
    <div className="flex justify-between text-xs text-white/50">
      <span>Hue</span>
      <span>{h}</span>
    </div>
    <input
      type="range"
      min={0}
      max={360}
      value={h}
      onChange={e => {
        const next = { h: Number(e.target.value), s, l }
        setHsl(next)
        const rgb = hslToRgb(next.h, next.s, next.l)
        setRgb(rgb)
        setHex(rgbToHex(rgb.r, rgb.g, rgb.b))
      }}
      className="w-full h-2 rounded-full cursor-pointer"
      style={{
        background:
          "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
      }}
    />
  </div>

  {/* Saturation */}
  <div className="rounded-lg bg-black/30 px-4 py-3 space-y-1">
    <div className="flex justify-between text-xs text-white/50">
      <span>Saturation</span>
      <span>{s}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={s}
      onChange={e => {
        const next = { h, s: Number(e.target.value), l }
        setHsl(next)
        const rgb = hslToRgb(next.h, next.s, next.l)
        setRgb(rgb)
        setHex(rgbToHex(rgb.r, rgb.g, rgb.b))
      }}
      className="w-full h-2 rounded-full cursor-pointer"
      style={{
        background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
      }}
    />
  </div>

  {/* Lightness */}
  <div className="rounded-lg bg-black/30 px-4 py-3 space-y-1">
    <div className="flex justify-between text-xs text-white/50">
      <span>Lightness</span>
      <span>{l}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={l}
      onChange={e => {
        const next = { h, s, l: Number(e.target.value) }
        setHsl(next)
        const rgb = hslToRgb(next.h, next.s, next.l)
        setRgb(rgb)
        setHex(rgbToHex(rgb.r, rgb.g, rgb.b))
      }}
      className="w-full h-2 rounded-full cursor-pointer"
      style={{
        background: `linear-gradient(to right, black, hsl(${h}, ${s}%, 50%), white)`,
      }}
    />
  </div>
</div>


</div>

        </section>

        {/* Preview */}
        <section className="space-y-6">
          <motion.div
  layout
  transition={{ duration: 0.25, ease: "easeOut" }}
  className="
    h-56 w-full
    rounded-3xl
    border border-white/10
    shadow-[0_30px_80px_rgba(0,0,0,0.6)]
  "
  style={{
    backgroundColor: hex,
    boxShadow: `0 30px 80px ${hex}55`,
  }}
/>
<HexColorPicker color={hex} onChange={setHex} />
        </section>
      </main>
  </>
)}
{tab === "palettes" && (
  <div className="col-span-2">
    <Palettes
      h={h}
      s={s}
      l={l}
      onSelect={(hexValue, hsl, rgb) => {
        setHex(hexValue)
        setHsl(hsl)
        setRgb(rgb)
      }}
    />
    
  </div>
)}


    </div>
  )
}
