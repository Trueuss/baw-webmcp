/**
 * Server-side helper that returns the 12 BAW tool docs in the current
 * locale, ready for the `/tools` page. Annotations and enum values
 * stay English (they are the public WebMCP API contract), but
 * description / inputSchema descriptions / example prose all switch
 * with the locale. Examples themselves stay in code (English) on
 * purpose — they are JSON-RPC call shapes, not human prose.
 */

export interface ToolDoc {
  name: string;
  description: string;
  annotations: Array<'readOnlyHint' | 'destructiveHint' | 'idempotentHint'>;
  inputSchema: Record<string, unknown>;
  example: string;
}

export type DocsTranslator = (key: string) => string;

const ENUMS = {
  category: ['outerwear', 'top', 'bottom', 'shoe', 'accessory', 'dress'],
  occasion: ['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening'],
  season: ['spring', 'summer', 'autumn', 'winter'],
  focus: ['minimal', 'classic', 'streetwear', 'workwear', 'avant-garde']
} as const;

export function getToolDocs(t: DocsTranslator): ToolDoc[] {
  return [
    {
      name: 'list_wardrobe',
      description: t('tools_defs.list_wardrobe.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ENUMS.category as unknown as string[],
            description: t('tools_defs.list_wardrobe.cat_desc')
          }
        }
      },
      example: `// Call
await document.modelContext.executeTool(
  await document.modelContext.getTools()
    .then(ts => ts.find(t => t.name === 'list_wardrobe')),
  '{"category": "outerwear"}'
);

// Response shape
{ count: 1, items: [{ id, name, category, tags, palette, fabric, notes }] }`
    },
    {
      name: 'get_garment',
      description: t('tools_defs.get_garment.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: t('tools_defs.list_wardrobe.id_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"id": "g_oversized_blazer"}');

// Response shape
{ id, name, category, tags, palette, fabric, notes }`
    },
    {
      name: 'add_garment',
      description: t('tools_defs.add_garment.desc'),
      annotations: [],
      inputSchema: {
        type: 'object',
        required: ['name', 'category', 'fabric'],
        properties: {
          name: { type: 'string' },
          category: { type: 'string', enum: ENUMS.category as unknown as string[] },
          fabric: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          white: { type: 'number', description: t('tools_defs.add_garment.white_desc') },
          black: { type: 'number', description: t('tools_defs.add_garment.black_desc') },
          notes: { type: 'string', description: t('tools_defs.add_garment.notes_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  name: 'Cream cashmere cardigan',
  category: 'top',
  fabric: 'Cashmere 12gg',
  tags: ['minimal', 'classic'],
  white: 0.95,
  black: 0.05,
  notes: 'Soft drape. Layering essential.'
}));

// Response shape
{ ok: true, garment: { id, name, category, ... } }`
    },
    {
      name: 'remove_garment',
      description: t('tools_defs.remove_garment.desc'),
      annotations: ['destructiveHint', 'idempotentHint'],
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"id": "g_oversized_blazer"}');

// Response shape
{ ok: true, removed: 'Oversized black blazer' }`
    },
    {
      name: 'analyze_outfit',
      description: t('tools_defs.analyze_outfit.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        required: ['garmentIds'],
        properties: {
          garmentIds: {
            type: 'array',
            items: { type: 'string' },
            description: t('tools_defs.analyze_outfit.ids_desc')
          },
          occasion: {
            type: 'string',
            enum: ENUMS.occasion as unknown as string[],
            description: t('tools_defs.analyze_outfit.occasion_desc')
          }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  garmentIds: ['g_oversized_blazer', 'g_white_oxford', 'g_cropped_trouser', 'g_white_leather_sneaker'],
  occasion: 'business-casual'
}));

// Response shape
{ id, overall: 8.6, axes: [{ axis, score, comment }], nextTime, model, generatedAt }`
    },
    {
      name: 'propose_outfit',
      description: t('tools_defs.propose_outfit.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        required: ['occasion', 'season'],
        properties: {
          occasion: { type: 'string', enum: ENUMS.occasion as unknown as string[] },
          season: { type: 'string', enum: ENUMS.season as unknown as string[] },
          focus: {
            type: 'string',
            enum: ENUMS.focus as unknown as string[],
            description: t('tools_defs.propose_outfit.focus_desc')
          }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  occasion: 'business-casual',
  season: 'autumn'
}));

// Response shape
{ suggestion, garments: [...], preview: { overall, axes, ... } }`
    },
    {
      name: 'save_outfit',
      description: t('tools_defs.save_outfit.desc'),
      annotations: [],
      inputSchema: {
        type: 'object',
        required: ['label', 'garmentIds', 'occasion', 'season'],
        properties: {
          label: { type: 'string' },
          garmentIds: { type: 'array', items: { type: 'string' } },
          occasion: { type: 'string', enum: ENUMS.occasion as unknown as string[] },
          season: { type: 'string', enum: ENUMS.season as unknown as string[] },
          notes: { type: 'string', description: t('tools_defs.save_outfit.notes_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  label: 'look no. 043',
  garmentIds: ['g_oversized_blazer', 'g_black_turtleneck', 'g_cropped_trouser', 'g_white_leather_sneaker'],
  occasion: 'business-casual',
  season: 'autumn'
}));

// Response shape
{ ok: true, id: 'o_xxxxxxxx' }`
    },
    {
      name: 'list_history',
      description: t('tools_defs.list_history.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Default 20, max 100.' }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"limit": 5}');

// Response shape
{ entries: [{ id, ts, source: 'human'|'agent'|'system', tool, message }] }`
    },
    {
      name: 'get_session_state',
      description: t('tools_defs.get_session_state.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: { type: 'object', properties: {} },
      example: `// Call
await document.modelContext.executeTool(tool, '{}');

// Response shape
{
  wardrobeCount: 9,
  outfitCount: 3,
  reportCount: 12,
  lastEntry: { source, tool, message, ts },
  topTags: [{ tag, count }],
  generatedAt: 1234567890
}`
    },
    {
      name: 'compare_outfits',
      description: t('tools_defs.compare_outfits.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        required: ['a', 'b'],
        properties: {
          a: {
            type: 'object',
            required: ['label', 'garmentIds'],
            properties: {
              label: { type: 'string' },
              garmentIds: { type: 'array', items: { type: 'string' } }
            }
          },
          b: {
            type: 'object',
            required: ['label', 'garmentIds'],
            properties: {
              label: { type: 'string' },
              garmentIds: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  a: { label: 'with oxford',     garmentIds: ['g_oversized_blazer', 'g_white_oxford', 'g_cropped_trouser'] },
  b: { label: 'with turtleneck', garmentIds: ['g_oversized_blazer', 'g_black_turtleneck', 'g_cropped_trouser'] }
}));

// Response shape
{ a: { label, report }, b: { label, report }, winner: 'a' | 'b', delta: 0.3 }`
    },
    {
      name: 'get_lookbook',
      description: t('tools_defs.get_lookbook.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Default 10, max 50.' }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"limit": 5}');

// Response shape
{ count, entries: [{ id, label, occasion, season, garmentIds, predictedScore, createdAt }] }`
    },
    {
      name: 'apply_suggestion',
      description: t('tools_defs.apply_suggestion.desc'),
      annotations: [],
      inputSchema: {
        type: 'object',
        required: ['garmentIds'],
        properties: {
          garmentIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Garment ids to apply. Built from the live wardrobe.'
          },
          label: { type: 'string', description: t('tools_defs.apply_suggestion.label_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  garmentIds: ['g_oversized_blazer', 'g_black_turtleneck', 'g_cropped_trouser', 'g_white_leather_sneaker'],
  label: 'with merino turtleneck'
}));

// Response shape
{ ok, suggestion, garments, preview: { overall, axes, ... } }`
    },
    {
      name: 'summarize_wardrobe',
      description: t('tools_defs.summarize_wardrobe.desc'),
      annotations: ['readOnlyHint'],
      inputSchema: {
        type: 'object',
        properties: {
          topN: { type: 'number', description: t('tools_defs.summarize_wardrobe.n_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"topN": 5}');

// Response shape
{
  generatedAt: 1234567890,
  total: 9,
  categories: [{ category: 'outerwear', count: 1 }, ...],
  palette: { greyscale: 8, coloured: 1, topAccents: [{ color: '#ff3b1f', count: 1 }] },
  topTags: [{ tag: 'minimal', count: 5 }, ...],
  averageRecentScore: 7.8,
  utilisationHint: '9 piece(s) tracked across 12 score(s)...'
}`
    },
    {
      name: 'export_wardrobe',
      description: t('tools_defs.export_wardrobe.desc'),
      annotations: ['destructiveHint', 'idempotentHint'],
      inputSchema: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json'], description: t('tools_defs.export_wardrobe.format_desc') }
        }
      },
      example: `// Call
await document.modelContext.executeTool(tool, '{"format": "json"}');

// Response shape
{
  ok: true,
  format: 'json',
  filename: 'baw-wardrobe-2026-08-26.json',
  size: 8421,
  base64: 'eyJ2ZXJzaW9uIjoxLCJ3YXJkcm9iZSI6W119',   // <- offer this as a download URL
  inline: '{\\n  "version": 1, ... }'              // <- or use the inline JSON if size ≤ 8KB
}`
    },
    {
      name: 'import_wardrobe',
      description: t('tools_defs.import_wardrobe.desc'),
      annotations: [],
      inputSchema: {
        type: 'object',
        required: ['data'],
        properties: {
          dry_run: { type: 'boolean', description: t('tools_defs.import_wardrobe.dry_run_desc') },
          data: { type: 'string', description: t('tools_defs.import_wardrobe.data_desc') }
        }
      },
      example: `// Step 1: dry run
await document.modelContext.executeTool(tool, JSON.stringify({
  dry_run: true,
  data: exportPayloadBase64
}));

// Response (dry run)
{ ok: true, dryRun: true, wouldAdd: 4, wouldReplace: 1, currentCount: 8 }

// Step 2: commit
await document.modelContext.executeTool(tool, JSON.stringify({
  dry_run: false,
  data: exportPayloadBase64
}));

// Response (commit)
{ ok: true, added: 4, replaced: 1, totalAfter: 12 }`
    }
  ];
}
