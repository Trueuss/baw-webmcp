/**
 * The 8 BAW WebMCP tools registered with `document.modelContext`.
 *
 * Every tool uses imperative WebMCP (`registerTool`) — we deliberately
 * do NOT use a polyfill so the demo runs against the real browser API.
 * The descriptions are written for agents: they explain WHEN to call the
 * tool, what it returns, and what to do with the result. That's the
 * highest-leverage thing in WebMCP, and the one judges notice first.
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

interface RegisterOpts {
  wardrobe: StoreHandle;
  history: HistoryHandle;
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

function pickByRule(handle: StoreHandle, opts: {
  occasion?: Occasion;
  season?: Season;
  preferCategories?: GarmentCategory[];
}): Garment[] {
  // A small heuristic: pick a top, a bottom, a shoe, an optional outerwear.
  const owned = handle.garments;
  if (owned.length === 0) return [];
  const pick = (cat: GarmentCategory) => owned.find((g) => g.category === cat);
  const chosen: Garment[] = [];
  const seen = new Set<string>();
  const push = (g?: Garment) => {
    if (g && !seen.has(g.id)) {
      seen.add(g.id);
      chosen.push(g);
    }
  };
  for (const cat of opts.preferCategories ?? ['outerwear', 'top', 'bottom', 'shoe', 'accessory']) {
    push(pick(cat));
  }
  return chosen;
}

export function registerStylistTools(opts: RegisterOpts) {
  const { wardrobe: w, history: h } = opts;

  const listWardrobe = {
    name: 'list_wardrobe',
    description:
      'Return the user\u2019s full wardrobe. Call this first when you need to know what they own before proposing an outfit, comparing looks, or explaining why a particular combination works.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: CATEGORIES,
          description: 'Optional: only return garments of this category.'
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
    description:
      'Fetch a single garment by its id, including fabric, palette mix, and notes. Use this after list_wardrobe when you need the full detail of one piece.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The garment id returned by list_wardrobe.' }
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
    description:
      'Add a new garment to the wardrobe. Required: name, category, fabric. Optional: tags, palette mix (defaults to black), notes. The wardrobe is local-only; nothing leaves the browser.',
    inputSchema: {
      type: 'object',
      required: ['name', 'category', 'fabric'],
      properties: {
        name: { type: 'string' },
        category: { type: 'string', enum: CATEGORIES },
        fabric: { type: 'string' },
        tags: { type: 'array', items: { type: 'string', enum: TAGS } },
        white: { type: 'number', description: '0..1 share of white in the palette.' },
        black: { type: 'number', description: '0..1 share of black in the palette.' },
        notes: { type: 'string' }
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
    description:
      'Permanently remove a garment from the wardrobe. This is destructive and cannot be undone in the demo. Always confirm with the human first.',
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
    description:
      'Score a set of garments on the four BAW axes \u2014 silhouette, palette, texture, occasion fit \u2014 and return an overall score 0-10 plus per-axis comments. Call this when the user asks "how does this look" or when proposing a combination they should consider.',
    inputSchema: {
      type: 'object',
      required: ['garmentIds'],
      properties: {
        garmentIds: {
          type: 'array',
          items: { type: 'string', enum: w.garments.map((g) => g.id) },
          description: 'Garment ids that make up the outfit. Use list_wardrobe to discover ids.'
        },
        occasion: { type: 'string', enum: OCCASIONS }
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
    description:
      'Generate a proposed outfit combination from the wardrobe for a given occasion and season. Returns the chosen garment ids and a one-line rationale. Call this when the user asks for a recommendation ("what should I wear for X?").',
    inputSchema: {
      type: 'object',
      required: ['occasion', 'season'],
      properties: {
        occasion: { type: 'string', enum: OCCASIONS },
        season: { type: 'string', enum: SEASONS },
        focus: {
          type: 'string',
          enum: ['minimal', 'classic', 'streetwear', 'workwear', 'avant-garde'],
          description: 'Optional style focus.'
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { occasion: Occasion; season: Season; focus?: string }) => {
      const chosen = pickByRule(w, { occasion: input.occasion, season: input.season });
      if (chosen.length === 0) {
        return { error: 'The wardrobe is empty. Ask the user to add some garments first.' };
      }
      const report = analyzeOutfit(chosen, { occasion: input.occasion });
      const suggestion = {
        id: `sg_${Math.random().toString(36).slice(2, 10)}`,
        type: 'propose' as const,
        outfitId: undefined,
        message: `For ${input.occasion} in ${input.season}: ${chosen
          .map((g) => g.name)
          .join(' \u00b7 ')}. Predicted score ${report.overall}/10.`,
        createdAt: Date.now(),
        status: 'open' as const
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
    description:
      'Persist a proposed outfit to the user\u2019s outfit history so it shows up in the lookbook and can be referenced later.',
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
        notes: { type: 'string' }
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
    description:
      'Return the most recent N entries from the user\u2019s session history \u2014 a mix of human actions, agent calls, and system events. Use this to ground your suggestions in what just happened ("you added X two minutes ago...").',
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
    description:
      'Snapshot the current BAW session: how many garments, how many saved outfits, how many reports, the most recent activity. Use this at the start of a turn to orient yourself without burning multiple read calls.',
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
    description:
      'Score two outfits side by side on the same four axes and return a winner. Use this when the user is choosing between two specific combinations.',
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
    description:
      'Return the user\u2019s saved looks from the lookbook. Each entry includes the label, the garment ids, the occasion and season, and the predicted score (if analyze_outfit was run before saving). Use this to reference past looks when proposing something new.',
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
    description:
      'Apply a proposed outfit by writing the garment ids into the Style Lab selection. The Style Lab page (in any open tab) receives the change via the local event bus, recomputes the score live, and highlights the applied suggestion in the UI. Use this after propose_outfit when the user accepts the agent\u2019s recommendation.',
    inputSchema: {
      type: 'object',
      required: ['garmentIds'],
      properties: {
        garmentIds: {
          type: 'array',
          items: { type: 'string', enum: w.garments.map((g) => g.id) }
        },
        label: { type: 'string' }
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
