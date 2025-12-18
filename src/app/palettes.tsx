// app/components/palettes.tsx
"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
type HSL = { h: number; s: number; l: number }
type RGB = { r: number; g: number; b: number }

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v))
}

function generateShades(h: number, s: number, l: number): HSL[] {
  return Array.from({ length: 5 }, (_, i) => ({
    h,
    s,
    l: clamp(l - i * 10),
  }))
}

function generateTints(h: number, s: number, l: number): HSL[] {
  return Array.from({ length: 5 }, (_, i) => ({
    h,
    s,
    l: clamp(l + i * 10),
  }))
}

function generateComplementary(h: number, s: number, l: number): HSL[] {
  return [
    { h, s, l },
    { h: (h + 180) % 360, s, l },
  ]
}

function generateAnalogous(h: number, s: number, l: number): HSL[] {
  return [-30, -15, 0, 15, 30].map(offset => ({
    h: (h + offset + 360) % 360,
    s,
    l,
  }))
}

function hslToRgb(h: number, s: number, l: number): RGB {
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

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  )
}

type PalettesProps = {
  h: number
  s: number
  l: number
  onSelect: (hex: string, hsl: HSL, rgb: RGB) => void
}

export function Palettes({ h, s, l, onSelect }: PalettesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const groups = [
    { title: "Shades", colors: generateShades(h, s, l) },
    { title: "Tints", colors: generateTints(h, s, l) },
    { title: "Complementary", colors: generateComplementary(h, s, l) },
    { title: "Analogous", colors: generateAnalogous(h, s, l) },
  ]

  return (
  <section className="mx-auto max-w-5xl px-6 space-y-14">
    {/* Header */}
    <div className="space-y-3">
  <h2 className="text-2xl pt-20 font-semibold tracking-tight">
    Generated Palettes
  </h2>
  <p className="text-sm text-white/60 max-w-xl leading-relaxed">
    Explore color relationships derived from your current selection.
    Click any swatch to apply it.
  </p>
</div>
      {groups.map(group => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="
    rounded-2xl
    border border-white/10
    bg-white/[0.04]
    backdrop-blur-xl
    p-6
    space-y-4
  "
        >
          <div className="space-y-1">
  <h3 className="text-sm font-medium text-white">
    {group.title}
  </h3>
  <p className="text-xs text-white/50">
    {group.title === "Shades" && "Darker variations of the same hue"}
    {group.title === "Tints" && "Lighter variations of the same hue"}
    {group.title === "Complementary" && "High-contrast opposing colors"}
    {group.title === "Analogous" && "Harmonious neighboring hues"}
  </p>
</div>


          <div className="grid grid-cols-5 gap-4">
            {group.colors.map((c, i) => {
              const rgb = hslToRgb(c.h, c.s, c.l)
              const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

              return (
                // biome-ignore lint/a11y/useButtonType: <explanation>
<button
  key={i}
  onClick={async () => {
    onSelect(hex, c, rgb)

    try {
      await navigator.clipboard.writeText(hex)
      setCopiedIndex(i)
      setTimeout(() => setCopiedIndex(null), 800)
    } catch {}
  }}
  className="group relative h-24 rounded-xl border border-white/10 overflow-hidden transition hover:scale-[1.04] hover:-translate-y-0.5"
  style={{
    backgroundColor: hex,
    boxShadow: `0 12px 30px ${hex}55`,
  }}
>
  {/* Hover gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

  {/* HEX label */}
  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
    {hex}
  </span>

  {/* Copied feedback */}
  {copiedIndex === i && (
    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white bg-black/40 backdrop-blur-sm">
      Copied
    </span>
  )}
</button>



              );
            })}
          </div>
        </motion.div>
      ))}
    </section>
  )
}
