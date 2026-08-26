/**
 * Documentation used by the /tools page. Hand-authored so the marketing
 * surface is curated — the runtime tool descriptions in `tools.ts` are the
 * authoritative contract, but the docs here read better.
 */

export interface ToolDoc {
  name: string;
  description: string;
  annotations: Array<'readOnlyHint' | 'destructiveHint' | 'idempotentHint'>;
  inputSchema: Record<string, unknown>;
  example: string;
}

export const TOOL_DOCS: ToolDoc[] = [
  {
    name: 'list_wardrobe',
    description:
      'Return the user\u2019s full wardrobe. Call this first when you need to know what they own before proposing an outfit, comparing looks, or explaining why a particular combination works.',
    annotations: ['readOnlyHint'],
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['outerwear', 'top', 'bottom', 'shoe', 'accessory', 'dress'],
          description: 'Optional: only return garments of this category.'
        }
      }
    },
    example:
`// Call
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
    description:
      'Fetch a single garment by its id, including fabric, palette mix, and notes. Use this after list_wardrobe when you need the full detail of one piece.',
    annotations: ['readOnlyHint'],
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'The garment id returned by list_wardrobe.' }
      }
    },
    example:
`// Call
await document.modelContext.executeTool(tool, '{"id": "g_oversized_blazer"}');

// Response shape
{ id, name, category, tags, palette, fabric, notes }`
  },
  {
    name: 'add_garment',
    description:
      'Add a new garment to the wardrobe. Required: name, category, fabric. Optional: tags, palette mix (defaults to black), notes. The wardrobe is local-only; nothing leaves the browser.',
    annotations: [],
    inputSchema: {
      type: 'object',
      required: ['name', 'category', 'fabric'],
      properties: {
        name: { type: 'string' },
        category: { type: 'string', enum: ['outerwear', 'top', 'bottom', 'shoe', 'accessory', 'dress'] },
        fabric: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        white: { type: 'number', description: '0..1 share of white in the palette.' },
        black: { type: 'number', description: '0..1 share of black in the palette.' },
        notes: { type: 'string' }
      }
    },
    example:
`// Call
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
    description:
      'Permanently remove a garment from the wardrobe. This is destructive and cannot be undone in the demo. Always confirm with the human first.',
    annotations: ['destructiveHint', 'idempotentHint'],
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'string' } }
    },
    example:
`// Call
await document.modelContext.executeTool(tool, '{"id": "g_oversized_blazer"}');

// Response shape
{ ok: true, removed: 'Oversized black blazer' }`
  },
  {
    name: 'analyze_outfit',
    description:
      'Score a set of garments on the four BAW axes \u2014 silhouette, palette, texture, occasion fit \u2014 and return an overall score 0-10 plus per-axis comments. Call this when the user asks "how does this look" or when proposing a combination they should consider.',
    annotations: ['readOnlyHint'],
    inputSchema: {
      type: 'object',
      required: ['garmentIds'],
      properties: {
        garmentIds: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Garment ids that make up the outfit. The enum is rebuilt from the live wardrobe on every call \u2014 you cannot reference a piece the user has removed.'
        },
        occasion: {
          type: 'string',
          enum: ['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening']
        }
      }
    },
    example:
`// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  garmentIds: ['g_oversized_blazer', 'g_white_oxford', 'g_cropped_trouser', 'g_white_leather_sneaker'],
  occasion: 'business-casual'
}));

// Response shape
{ id, overall: 8.6, axes: [{ axis, score, comment }], nextTime, model, generatedAt }`
  },
  {
    name: 'propose_outfit',
    description:
      'Generate a proposed outfit combination from the wardrobe for a given occasion and season. Returns the chosen garment ids and a one-line rationale. Call this when the user asks for a recommendation ("what should I wear for X?").',
    annotations: ['readOnlyHint'],
    inputSchema: {
      type: 'object',
      required: ['occasion', 'season'],
      properties: {
        occasion: { type: 'string', enum: ['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening'] },
        season: { type: 'string', enum: ['spring', 'summer', 'autumn', 'winter'] },
        focus: { type: 'string', enum: ['minimal', 'classic', 'streetwear', 'workwear', 'avant-garde'] }
      }
    },
    example:
`// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  occasion: 'business-casual',
  season: 'autumn'
}));

// Response shape
{ suggestion, garments: [...], preview: { overall, axes, ... } }`
  },
  {
    name: 'save_outfit',
    description:
      'Persist a proposed outfit to the user\u2019s outfit history so it shows up in the lookbook and can be referenced later.',
    annotations: [],
    inputSchema: {
      type: 'object',
      required: ['label', 'garmentIds', 'occasion', 'season'],
      properties: {
        label: { type: 'string' },
        garmentIds: { type: 'array', items: { type: 'string' } },
        occasion: { type: 'string', enum: ['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening'] },
        season: { type: 'string', enum: ['spring', 'summer', 'autumn', 'winter'] },
        notes: { type: 'string' }
      }
    },
    example:
`// Call
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
    description:
      'Return the most recent N entries from the user\u2019s session history \u2014 a mix of human actions, agent calls, and system events. Use this to ground your suggestions in what just happened ("you added X two minutes ago...").',
    annotations: ['readOnlyHint'],
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Default 20, max 100.' }
      }
    },
    example:
`// Call
await document.modelContext.executeTool(tool, '{"limit": 5}');

// Response shape
{ entries: [{ id, ts, source: 'human'|'agent'|'system', tool, message }] }`
  },
  {
    name: 'get_session_state',
    description:
      'Snapshot the current BAW session: how many garments, how many saved outfits, how many reports, the most recent activity. Use this at the start of a turn to orient yourself without burning multiple read calls.',
    annotations: ['readOnlyHint'],
    inputSchema: { type: 'object', properties: {} },
    example:
`// Call
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
    description:
      'Score two outfits side by side on the same four axes and return a winner. Use this when the user is choosing between two specific combinations.',
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
    example:
`// Call
await document.modelContext.executeTool(tool, JSON.stringify({
  a: { label: 'with oxford',     garmentIds: ['g_oversized_blazer', 'g_white_oxford', 'g_cropped_trouser'] },
  b: { label: 'with turtleneck', garmentIds: ['g_oversized_blazer', 'g_black_turtleneck', 'g_cropped_trouser'] }
}));

// Response shape
{ a: { label, report }, b: { label, report }, winner: 'a' | 'b', delta: 0.3 }`
  }
];
