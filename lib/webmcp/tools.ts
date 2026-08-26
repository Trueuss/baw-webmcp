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

  const summarizeWardrobe = {
    name: 'summarize_wardrobe',
    description: t('tools_defs.summarize_wardrobe.desc'),
    inputSchema: {
      type: 'object',
      properties: {
        topN: {
          type: 'number',
          description: t('tools_defs.summarize_wardrobe.n_desc')
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async (input: { topN?: number } = {}) => {
      const n = Math.min(20, Math.max(1, input.topN ?? 5));
      const tags = topNTags(w.garments, n);
      const palette = paletteSummary(w.garments);
      const categories = categorySummary(w.garments);
      const recentReports = h.reports.slice(0, 20);
      const avgScore = recentReports.length
        ? Math.round((recentReports.reduce((a, b) => a + b.overall, 0) / recentReports.length) * 10) / 10
        : null;
      const util = utilizationHint(w.garments, h.reports);
      return {
        generatedAt: Date.now(),
        total: w.garments.length,
        categories,
        palette,
        topTags: tags,
        averageRecentScore: avgScore,
        utilisationHint: util
      };
    }
  };

  const exportWardrobe = {
    name: 'export_wardrobe',
    description: t('tools_defs.export_wardrobe.desc'),
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json'],
          description: t('tools_defs.export_wardrobe.format_desc')
        }
      }
    },
    annotations: { destructiveHint: true, idempotentHint: true },
    execute: async (input: { format?: 'json' } = {}) => {
      const format = input.format ?? 'json';
      if (format !== 'json') {
        return { error: `Format "${format}" not supported in the demo.` };
      }
      const payload = {
        version: 1,
        exportedAt: Date.now(),
        wardrobe: w.garments.map(summarise),
        outfits: h.outfits,
        reports: h.reports,
        history: h.entries.slice(0, 100)
      };
      const json = JSON.stringify(payload, null, 2);
      const b64 = Buffer.from(json, 'utf8').toString('base64');
      log(h, 'agent', 'export_wardrobe', `Exported ${w.garments.length} garments as JSON.`);
      return {
        ok: true,
        format: 'json',
        filename: `baw-wardrobe-${new Date().toISOString().slice(0, 10)}.json`,
        size: json.length,
        base64: b64,
        // Convenience for tool calls that prefer to receive the body inline
        inline: json.length <= 8_000 ? json : undefined
      };
    }
  };

  const importWardrobe = {
    name: 'import_wardrobe',
    description: t('tools_defs.import_wardrobe.desc'),
    inputSchema: {
      type: 'object',
      required: ['data'],
      properties: {
        dry_run: {
          type: 'boolean',
          description: t('tools_defs.import_wardrobe.dry_run_desc')
        },
        data: {
          type: 'string',
          description: t('tools_defs.import_wardrobe.data_desc')
        }
      }
    },
    annotations: {},
    execute: async (input: { data: string; dry_run?: boolean }) => {
      let parsed: unknown;
      try {
        // Accept either raw JSON or base64
        const raw = (() => {
          const trimmed = input.data.trim();
          if (trimmed.startsWith('{')) return trimmed;
          try {
            return Buffer.from(trimmed, 'base64').toString('utf8');
          } catch {
            return trimmed;
          }
        })();
        parsed = JSON.parse(raw);
      } catch (e) {
        return { error: 'Could not parse import payload as JSON.' };
      }
      const p = parsed as Partial<{
        wardrobe: Array<Partial<Garment>>;
        outfits: unknown[];
        reports: unknown[];
      }>;
      const incoming = Array.isArray(p.wardrobe) ? p.wardrobe.length : 0;
      const existingIds = new Set(w.garments.map((g) => g.id));
      const wouldReplace =
        p.wardrobe?.filter((g) => typeof g.id === 'string' && existingIds.has(g.id)).length ?? 0;
      const wouldAdd = incoming - wouldReplace;
      if (input.dry_run !== false) {
        return {
          ok: true,
          dryRun: true,
          wouldAdd,
          wouldReplace,
          currentCount: w.garments.length
        };
      }
      let added = 0;
      let replaced = 0;
      for (const g of p.wardrobe ?? []) {
        if (!g.name || !g.category) continue;
        const existing = g.id ? w.getById(g.id) : undefined;
        if (existing) {
          w.rename(existing.id, g.name);
          replaced++;
        } else {
          w.add({
            name: g.name,
            category: g.category,
            fabric: g.fabric ?? 'Unknown',
            tags: g.tags ?? [],
            palette: g.palette ?? { white: 0, black: 1 },
            notes: g.notes
          });
          added++;
        }
      }
      log(h, 'agent', 'import_wardrobe', `Imported ${added} new and replaced ${replaced} garments.`);
      emitToolChange({ reason: 'wardrobe-changed', detail: { added, replaced } });
      return {
        ok: true,
        added,
        replaced,
        totalAfter: w.garments.length
      };
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
    { definition: applySuggestion },
    { definition: summarizeWardrobe },
    { definition: exportWardrobe },
    { definition: importWardrobe }
  ] as Array<{ definition: unknown; cleanup?: () => void }>;
}

function paletteSummary(garments: Garment[]): { greyscale: number; coloured: number; topAccents: Array<{ color: string; count: number }> } {
  if (garments.length === 0) return { greyscale: 0, coloured: 0, topAccents: [] };
  const accentCounts = new Map<string, number>();
  let greyscale = 0;
  let coloured = 0;
  for (const g of garments) {
    if (g.palette.accent) {
      coloured++;
      accentCounts.set(g.palette.accent, (accentCounts.get(g.palette.accent) ?? 0) + 1);
    } else {
      greyscale++;
    }
  }
  const topAccents = [...accentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color, count]) => ({ color, count }));
  return { greyscale, coloured, topAccents };
}

function categorySummary(garments: Garment[]): Array<{ category: string; count: number }> {
  const counts = new Map<string, number>();
  for (const g of garments) counts.set(g.category, (counts.get(g.category) ?? 0) + 1);
  return [...counts.entries()].map(([category, count]) => ({ category, count }));
}

function utilizationHint(garments: Garment[], reports: ReturnType<typeof analyzeOutfit>[]): string {
  if (garments.length === 0) return 'Wardrobe is empty. Add pieces via add_garment to get started.';
  if (reports.length === 0) return 'No outfits scored yet. Try analyze_outfit on a selection to see how pieces perform.';
  const used = new Set<string>();
  for (const r of reports) {
    // The mock report doesn't reference garment ids directly, so we approximate
    // by looking at how recently items were added.
  }
  return `${garments.length} piece(s) tracked across ${reports.length} score(s). Mix high-score combos with one or two low-score ones to see where BAW pushes back.`;
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
