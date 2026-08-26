/**
 * Mock analyzer: pretends to be a 1.3B-parameter on-device vision-language
 * model that scores an outfit on four axes — silhouette, palette, texture,
 * and occasion fit. The numbers are deterministic from a hash of the
 * garment set so the same outfit always scores the same way. Real BAW
 * would replace this with a WebGPU/WASM model running locally.
 */

import type { AxisScore, Garment, OutfitReport, ScoreAxis } from '../types';

const AXES: ScoreAxis[] = ['silhouette', 'palette', 'texture', 'occasion'];

const FALLBACK_COMMENTS: Record<ScoreAxis, (ctx: { count: number; tone: string }) => string> = {
  silhouette: ({ count }) =>
    count >= 3
      ? 'Three-piece stacking reads structured. Shoulder and hem proportions look intentional.'
      : 'Two-piece minimal — consider a third layer to anchor the vertical line.',
  palette: ({ tone }) =>
    tone === 'mono'
      ? 'Monochrome discipline. The 5% rule (one accent) earns its keep here.'
      : 'Mostly neutral. Check that any non-greyscale pieces keep a low chroma.',
  texture: ({ count }) =>
    count >= 2
      ? 'Mixed surface weights are doing the work — matte against sheen reads expensive.'
      : 'Single fabric risk. A texture contrast would lift the whole frame.',
  occasion: ({ count }) =>
    count >= 3
      ? 'Layer count fits a smart-casual register. Works for studio, dinner, weekend.'
      : 'Reads casual — add a structured layer for a smarter occasion.'
};

function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return (h >>> 0) / 4294967295; // 0..1
}

function clamp(n: number, min = 5.5, max = 9.6) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function silhouetteScore(garments: Garment[]): number {
  const hasOuter = garments.some((g) => g.category === 'outerwear');
  const tops = garments.filter((g) => g.category === 'top').length;
  const bottoms = garments.filter((g) => g.category === 'bottom').length;
  const hasShoe = garments.some((g) => g.category === 'shoe');
  let s = 6.5;
  if (hasOuter) s += 1.0;
  if (tops >= 1 && bottoms >= 1) s += 1.2;
  if (hasShoe) s += 0.5;
  s += (hashSeed('sil', garments.length) - 0.5) * 0.6;
  return clamp(round(s));
}

function paletteScore(garments: Garment[]): number {
  const avgWhite = garments.reduce((a, g) => a + g.palette.white, 0) / Math.max(1, garments.length);
  const avgBlack = garments.reduce((a, g) => a + g.palette.black, 0) / Math.max(1, garments.length);
  const greyscale = avgWhite + avgBlack;
  const mono = greyscale > 1.6 ? 'mono' : 'mixed';
  let s = 7.0;
  if (mono === 'mono') s += 1.4;
  else s += 0.4;
  // Reward the 5% accent rule
  const hasAccent = garments.some((g) => g.palette.accent);
  if (hasAccent) s += 0.5;
  s += (hashSeed('pal', greyscale) - 0.5) * 0.5;
  return clamp(round(s));
}

function textureScore(garments: Garment[]): number {
  const fabrics = new Set(garments.map((g) => g.fabric.split(' ')[0].toLowerCase()));
  let s = 6.6 + Math.min(2.0, fabrics.size * 0.6);
  s += (hashSeed('tex', [...fabrics].sort().join('|')) - 0.5) * 0.4;
  return clamp(round(s));
}

function occasionScore(garments: Garment[]): number {
  const formal = garments.filter((g) =>
    g.tags.some((t) => t === 'tailored' || t === 'classic')
  ).length;
  let s = 6.4;
  if (formal >= 2) s += 1.6;
  else if (formal === 1) s += 0.7;
  s += (hashSeed('occ', formal) - 0.5) * 0.5;
  return clamp(round(s));
}

function commentsFor(garments: Garment[]): Record<ScoreAxis, string> {
  const tone = (() => {
    const greyscaleAvg =
      garments.reduce((a, g) => a + g.palette.white + g.palette.black, 0) / Math.max(1, garments.length);
    return greyscaleAvg > 1.6 ? 'mono' : 'mixed';
  })();
  const ctx = { count: garments.length, tone };
  return {
    silhouette: FALLBACK_COMMENTS.silhouette(ctx),
    palette: FALLBACK_COMMENTS.palette(ctx),
    texture: FALLBACK_COMMENTS.texture(ctx),
    occasion: FALLBACK_COMMENTS.occasion(ctx)
  };
}

export function analyzeOutfit(
  garments: Garment[],
  opts?: { occasion?: string; seed?: number }
): OutfitReport {
  if (garments.length === 0) {
    return {
      id: 'r_empty',
      overall: 0,
      axes: AXES.map((axis) => ({
        axis,
        score: 0,
        comment: 'No garments to evaluate.'
      })),
      generatedAt: Date.now(),
      model: 'baw-vl-1.3b (mock)'
    };
  }
  const comments = commentsFor(garments);
  const axes: AxisScore[] = [
    { axis: 'silhouette', score: silhouetteScore(garments), comment: comments.silhouette },
    { axis: 'palette', score: paletteScore(garments), comment: comments.palette },
    { axis: 'texture', score: textureScore(garments), comment: comments.texture },
    { axis: 'occasion', score: occasionScore(garments), comment: comments.occasion }
  ];
  const overall = round(axes.reduce((a, b) => a + b.score, 0) / axes.length);
  const nextTime =
    overall >= 8.5
      ? 'This is a 9/10 frame. Repeat the structure next week, just rotate the inner layer.'
      : overall >= 7.5
        ? 'Solid 7-8. Try inverting one element (e.g. black inner + white outer) for contrast.'
        : 'Read the palette axis above — bringing palette score above 7 usually moves the overall above 8.';
  return {
    id: `r_${Math.random().toString(36).slice(2, 10)}`,
    outfitId: opts?.seed ? String(opts.seed) : undefined,
    overall,
    axes,
    nextTime,
    generatedAt: Date.now(),
    model: 'baw-vl-1.3b (mock)'
  };
}

export const AXIS_LABELS: Record<ScoreAxis, string> = {
  silhouette: 'silhouette',
  palette: 'palette',
  texture: 'texture',
  occasion: 'occasion fit'
};
