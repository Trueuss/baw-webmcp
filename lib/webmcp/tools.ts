/**
 * The 12 BAW WebMCP tools registered with `document.modelContext`.
 *
 * Every tool uses imperative WebMCP (`registerTool`) — we deliberately
 * do NOT use a polyfill so the demo runs against the real browser API.
 * Descriptions, annotations and inputSchema hints are read from the
 * i18n dictionary at registration time, so the agent always sees the
 * same locale the user does.
 *
 * Reactive schemas: `analyze_outfit` and `propose_outfit` rebuild their
 * `garmentIds` enums from the live wardrobe store. The `getTools()`
 * snapshot therefore changes as the user adds and removes garments,
 * which the native browser forwards to any agent that asks.
 */

import type {
  Garment,
  GarmentCategory,
  StyleTag,
  Occasion,
  Season,
  StylistSuggestion
} from '../types';
import { analyzeOutfit } from '../mock/analyzer';
import { emitToolChange } from './bus';

type StoreHandle = {
  garments: Garment[];
  add: (g: Omit<Garment, 'id' | 'createdAt'>) => Garment;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  getById: (id: string) => Garment | undefined;
};

type HistoryHandle = {
  entries: { id: string; ts: number; source: 'human' | 'agent' | 'system'; tool?: string; message: string }[];
  reports: ReturnType<typeof analyzeOutfit>[];
  outfits: { id: string; label: string; garmentIds: string[]; occasion: Occasion; season: Season; notes?: string; createdAt: number }[];
  addEntry: (e: { source: 'human' | 'agent' | 'system'; tool?: string; message: string }) => void;
  saveReport: (r: ReturnType<typeof analyzeOutfit>) => void;
  saveOutfit: (o: { label: string; garmentIds: string[]; occasion: Occasion; season: Season; notes?: string }) => { id: string };
};

export type Translator = (key: string) => string;

interface RegisterOpts {
  wardrobe: StoreHandle;
  history: HistoryHandle;
  t: Translator;
}

const CATEGORIES: GarmentCategory[] = [
  'outerwear', 'top', 'bottom', 'shoe', 'accessory', 'dress'
];
const TAGS: StyleTag[] = [
  'minimal', 'oversized', 'tailored', 'streetwear', 'classic', 'avant-garde', 'romantic', 'sporty', 'workwear'
];
const OCCASIONS: Occasion[] = ['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening'];
const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

function log(handle: HistoryHandle, source: 'human' | 'agent' | 'system', tool: string, message: string) {
  handle.addEntry({ source, tool, message });
}

function summarise(g: Garment) {
  return {
    id: g.id,
    name: g.name,
    category: g.category,
    tags: g.tags,
    palette: g.palette,
    fabric: g.fabric,
    notes: g.notes
  };
}

function pickByRule(handle: StoreHandle, opts: { occasion?: Occasion; focus?: string }) {
  const owned = handle.garments;
  if (owned.length === 0) return [];
  const pick = (cat: string) => owned.find((g) => g.category === cat);
  const chosen: Garment[] = [];
  const seen = new Set<string>();
  const push = (g?: Garment) => {
    if (g && !seen.has(g.id)) {
      seen.add(g.id);
      chosen.push(g);
    }
  };
  for (const cat of ['outerwear', 'top', 'bottom', 'shoe', 'accessory']) {
    push(pick(cat));
  }
  // Filter by focus if requested
  if (opts.focus) {
    const focused = chosen.filter((g) => g.tags.includes(opts.focus as Garment['tags'][number]));
    return focused.length > 0 ? focused : chosen;
  }
  return chosen;
}

export function registerStylistTools(opts: RegisterOpts) {
  const { wardrobe: w, history: h, t } = opts;

  const listWardrobe = {
    name: 'list_wardrobe',
    description: t('tools_defs.list_wardrobe.desc'),
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: CATEGORIES,
          description: t('tools_defs.list_wardrobe.cat_desc')
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { category?: GarmentCategory }) => {
      const items = input.category
        ? w.garments.filter((g) => g.category === input.category)
        : w.garments;
      log(h, 'agent', 'list_wardrobe', `Listed ${items.length} garment(s).`);
      return {
        count: items.length,
        items: items.map(summarise)
      };
    }
  };

  const getGarment = {
    name: 'get_garment',
    description: t('tools_defs.get_garment.desc'),
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: t('tools_defs.list_wardrobe.id_desc') }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { id: string }) => {
      const g = w.getById(input.id);
      if (!g) return { error: `No garment with id ${input.id}.` };
      return summarise(g);
    }
  };

  const addGarment = {
    name: 'add_garment',
    description: t('tools_defs.add_garment.desc'),
    inputSchema: {
      type: 'object',
      required: ['name', 'category', 'fabric'],
      properties: {
        name: { type: 'string' },
        category: { type: 'string', enum: CATEGORIES },
        fabric: { type: 'string' },
        tags: { type: 'array', items: { type: 'string', enum: TAGS } },
        white: { type: 'number', description: t('tools_defs.add_garment.white_desc') },
        black: { type: 'number', description: t('tools_defs.add_garment.black_desc') },
        notes: { type: 'string', description: t('tools_defs.add_garment.notes_desc') }
      }
    },
    execute: async (input: {
      name: string;
      category: GarmentCategory;
      fabric: string;
      tags?: StyleTag[];
      white?: number;
      black?: number;
      notes?: string;
    }) => {
      const g = w.add({
        name: input.name,
        category: input.category,
        fabric: input.fabric,
        tags: input.tags ?? [],
        palette: { white: input.white ?? 0, black: input.black ?? 1 },
        notes: input.notes
      });
      log(h, 'agent', 'add_garment', `Added "${g.name}" (${g.category}).`);
      emitToolChange({ reason: 'wardrobe-changed', detail: { added: g.id } });
      return { ok: true, garment: summarise(g) };
    }
  };

  const removeGarment = {
    name: 'remove_garment',
    description: t('tools_defs.remove_garment.desc'),
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } }
    },
    annotations: { destructiveHint: true, idempotentHint: true },
    execute: async (input: { id: string }) => {
      const g = w.getById(input.id);
      if (!g) return { ok: false, error: `No garment with id ${input.id}.` };
      w.remove(input.id);
      log(h, 'agent', 'remove_garment', `Removed "${g.name}".`);
      emitToolChange({ reason: 'wardrobe-changed', detail: { removed: input.id } });
      return { ok: true, removed: g.name };
    }
  };

  const analyzeOutfitTool = {
    name: 'analyze_outfit',
    description: t('tools_defs.analyze_outfit.desc'),
    inputSchema: {
      type: 'object',
      required: ['garmentIds'],
      properties: {
        garmentIds: {
          type: 'array',
          items: { type: 'string', enum: w.garments.map((g) => g.id) },
          description: t('tools_defs.analyze_outfit.ids_desc')
        },
        occasion: { type: 'string', enum: OCCASIONS, description: t('tools_defs.analyze_outfit.occasion_desc') }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { garmentIds: string[]; occasion?: Occasion }) => {
      const garments = input.garmentIds
        .map((id) => w.getById(id))
        .filter((g): g is Garment => Boolean(g));
      if (garments.length === 0) {
        return { error: 'No valid garments in the selection. Call list_wardrobe first.' };
      }
      const report = analyzeOutfit(garments, { occasion: input.occasion });
      h.saveReport(report);
      log(h, 'agent', 'analyze_outfit', `Scored ${garments.length}-piece outfit at ${report.overall}/10.`);
      emitToolChange({ reason: 'report-generated', detail: { overall: report.overall } });
      return report;
    }
  };

  const proposeOutfit = {
    name: 'propose_outfit',
    description: t('tools_defs.propose_outfit.desc'),
    inputSchema: {
      type: 'object',
      required: ['occasion', 'season'],
      properties: {
        occasion: { type: 'string', enum: OCCASIONS },
        season: { type: 'string', enum: SEASONS },
        focus: {
          type: 'string',
          enum: ['minimal', 'classic', 'streetwear', 'workwear', 'avant-garde'],
          description: t('tools_defs.propose_outfit.focus_desc')
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { occasion: Occasion; season: Season; focus?: string }) => {
      const chosen = pickByRule(w, { occasion: input.occasion, focus: input.focus });
      if (chosen.length === 0) {
        return { error: 'The wardrobe is empty. Ask the user to add some garments first.' };
      }
      const report = analyzeOutfit(chosen, { occasion: input.occasion });
      const suggestion: StylistSuggestion = {
        id: `sg_${Math.random().toString(36).slice(2, 10)}`,
        type: 'propose',
        message: `For ${input.occasion} in ${input.season}: ${chosen
          .map((g) => g.name)
          .join(' \u00b7 ')}. Predicted score ${report.overall}/10.`,
        createdAt: Date.now(),
        status: 'open'
      };
      h.addEntry({ source: 'agent', tool: 'propose_outfit', message: suggestion.message });
      emitToolChange({ reason: 'suggestion', detail: suggestion });
      return {
        suggestion,
        garments: chosen.map(summarise),
        preview: report
      };
    }
  };

  const saveOutfit = {
    name: 'save_outfit',
    description: t('tools_defs.save_outfit.desc'),
    inputSchema: {
      type: 'object',
      required: ['label', 'garmentIds', 'occasion', 'season'],
      properties: {
        label: { type: 'string' },
        garmentIds: {
          type: 'array',
          items: { type: 'string', enum: w.garments.map((g) => g.id) }
        },
        occasion: { type: 'string', enum: OCCASIONS },
        season: { type: 'string', enum: SEASONS },
        notes: { type: 'string', description: t('tools_defs.save_outfit.notes_desc') }
      }
    },
    execute: async (input: {
      label: string;
      garmentIds: string[];
      occasion: Occasion;
      season: Season;
      notes?: string;
    }) => {
      const o = h.saveOutfit({
        label: input.label,
        garmentIds: input.garmentIds,
        occasion: input.occasion,
        season: input.season,
        notes: input.notes
      });
      log(h, 'agent', 'save_outfit', `Saved outfit "${input.label}".`);
      emitToolChange({ reason: 'outfit-saved', detail: { id: o.id } });
      return { ok: true, id: o.id };
    }
  };

  const listHistory = {
    name: 'list_history',
    description: t('tools_defs.list_history.desc'),
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Default 20, max 100.' }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { limit?: number } = {}) => {
      const n = Math.min(100, Math.max(1, input.limit ?? 20));
      return { entries: h.entries.slice(0, n) };
    }
  };

  const getSessionState = {
    name: 'get_session_state',
    description: t('tools_defs.get_session_state.desc'),
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => ({
      wardrobeCount: w.garments.length,
      outfitCount: h.outfits.length,
      reportCount: h.reports.length,
      lastEntry: h.entries[0] ?? null,
      topTags: topNTags(w.garments, 5),
      generatedAt: Date.now()
    })
  };

  const compareOutfits = {
    name: 'compare_outfits',
    description: t('tools_defs.compare_outfits.desc'),
    inputSchema: {
      type: 'object',
      required: ['a', 'b'],
      properties: {
        a: {
          type: 'object',
          required: ['label', 'garmentIds'],
          properties: {
            label: { type: 'string' },
            garmentIds: { type: 'array', items: { type: 'string', enum: w.garments.map((g) => g.id) } }
          }
        },
        b: {
          type: 'object',
          required: ['label', 'garmentIds'],
          properties: {
            label: { type: 'string' },
            garmentIds: { type: 'array', items: { type: 'string', enum: w.garments.map((g) => g.id) } }
          }
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: {
      a: { label: string; garmentIds: string[] };
      b: { label: string; garmentIds: string[] };
    }) => {
      const ga = input.a.garmentIds.map((id) => w.getById(id)).filter(Boolean) as Garment[];
      const gb = input.b.garmentIds.map((id) => w.getById(id)).filter(Boolean) as Garment[];
      const ra = analyzeOutfit(ga);
      const rb = analyzeOutfit(gb);
      const winner = ra.overall >= rb.overall ? 'a' : 'b';
      const delta = Math.abs(ra.overall - rb.overall);
      log(h, 'agent', 'compare_outfits', `Compared "${input.a.label}" (${ra.overall}) vs "${input.b.label}" (${rb.overall}).`);
      return { a: { label: input.a.label, report: ra }, b: { label: input.b.label, report: rb }, winner, delta };
    }
  };

  const getLookbook = {
    name: 'get_lookbook',
    description: t('tools_defs.get_lookbook.desc'),
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Default 10, max 50.' }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { limit?: number } = {}) => {
      const n = Math.min(50, Math.max(1, input.limit ?? 10));
      const entries = h.outfits.slice(0, n).map((o) => {
        const score =
          h.reports.find((r) => r.outfitId === o.id)?.overall ??
          analyzeOutfit(
            o.garmentIds.map((id) => w.getById(id)).filter(Boolean) as Garment[]
          ).overall;
        return {
          id: o.id,
          label: o.label,
          occasion: o.occasion,
          season: o.season,
          garmentIds: o.garmentIds,
          predictedScore: score,
          createdAt: o.createdAt
        };
      });
      log(h, 'agent', 'get_lookbook', `Returned ${entries.length} saved look(s).`);
      return { count: entries.length, entries };
    }
  };

  const applySuggestion = {
    name: 'apply_suggestion',
    description: t('tools_defs.apply_suggestion.desc'),
    inputSchema: {
      type: 'object',
      required: ['garmentIds'],
      properties: {
        garmentIds: {
          type: 'array',
          items: { type: 'string', enum: w.garments.map((g) => g.id) }
        },
        label: { type: 'string', description: t('tools_defs.apply_suggestion.label_desc') }
      }
    },
    execute: async (input: { garmentIds: string[]; label?: string }) => {
      const garments = input.garmentIds
        .map((id) => w.getById(id))
        .filter((g): g is Garment => Boolean(g));
      if (garments.length === 0) {
        return { error: 'No valid garments. Call list_wardrobe first.' };
      }
      const report = analyzeOutfit(garments);
      const suggestion: StylistSuggestion = {
        id: `sg_${Math.random().toString(36).slice(2, 10)}`,
        type: 'propose',
        message: input.label
          ? `Applied "${input.label}" (${garments.length} pieces, ${report.overall}/10) to the Style Lab.`
          : `Applied ${garments.length} pieces to the Style Lab. Predicted ${report.overall}/10.`,
        createdAt: Date.now(),
        status: 'accepted'
      };
      h.addEntry({ source: 'agent', tool: 'apply_suggestion', message: suggestion.message });
      emitToolChange({ reason: 'suggestion', detail: { ...suggestion, appliedGarmentIds: input.garmentIds } });
      return { ok: true, suggestion, garments: garments.map(summarise), preview: report };
    }
  };

  return [
    { definition: listWardrobe },
    { definition: getGarment },
    { definition: addGarment },
    { definition: removeGarment },
    { definition: analyzeOutfitTool },
    { definition: proposeOutfit },
    { definition: saveOutfit },
    { definition: listHistory },
    { definition: getSessionState },
    { definition: compareOutfits },
    { definition: getLookbook },
    { definition: applySuggestion }
  ] as Array<{ definition: unknown; cleanup?: () => void }>;
}

function topNTags(garments: Garment[], n: number) {
  const counts = new Map<string, number>();
  for (const g of garments) {
    for (const t of g.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag, count]) => ({ tag, count }));
}
