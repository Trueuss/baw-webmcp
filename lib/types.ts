// Shared types used by both the UI and the WebMCP tools.

export type GarmentCategory =
  | 'outerwear'
  | 'top'
  | 'bottom'
  | 'shoe'
  | 'accessory'
  | 'dress';

export type StyleTag =
  | 'minimal'
  | 'oversized'
  | 'tailored'
  | 'streetwear'
  | 'classic'
  | 'avant-garde'
  | 'romantic'
  | 'sporty'
  | 'workwear';

export type Occasion =
  | 'casual'
  | 'business-casual'
  | 'formal'
  | 'creative'
  | 'outdoor'
  | 'evening';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  tags: StyleTag[];
  palette: { white: number; black: number; accent?: string };
  fabric: string;
  notes?: string;
  createdAt: number;
}

export interface Outfit {
  id: string;
  label: string;
  garmentIds: string[];
  occasion: Occasion;
  season: Season;
  notes?: string;
  createdAt: number;
}

export type ScoreAxis = 'silhouette' | 'palette' | 'texture' | 'occasion';

export interface AxisScore {
  axis: ScoreAxis;
  score: number; // 0-10
  comment: string;
}

export interface OutfitReport {
  id: string;
  outfitId?: string;
  overall: number; // 0-10
  axes: AxisScore[];
  nextTime?: string;
  generatedAt: number;
  model: string; // e.g. "baw-vl-1.3b (mock)"
}

export interface StylistSuggestion {
  id: string;
  type: 'propose' | 'compare' | 'remind' | 'warn';
  outfitId?: string;
  message: string;
  createdAt: number;
  status: 'open' | 'accepted' | 'rejected';
}

export interface HistoryEntry {
  id: string;
  ts: number;
  source: 'human' | 'agent' | 'system';
  tool?: string;
  message: string;
}
