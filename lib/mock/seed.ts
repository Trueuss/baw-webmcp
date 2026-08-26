import type { Garment, HistoryEntry } from '../types';

export function seedGarments(): Garment[] {
  return [
    {
      id: 'g_oversized_blazer',
      name: 'Oversized black blazer',
      category: 'outerwear',
      tags: ['oversized', 'minimal', 'tailored'],
      palette: { white: 0.05, black: 0.95 },
      fabric: 'Wool 320gsm',
      notes: 'Heavy drape, sharp shoulder. Anchor piece.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12
    },
    {
      id: 'g_white_oxford',
      name: 'White oxford shirt',
      category: 'top',
      tags: ['classic', 'minimal', 'tailored'],
      palette: { white: 0.96, black: 0.04 },
      fabric: 'Cotton 120s',
      notes: 'Crisp collar, slight box pleat.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9
    },
    {
      id: 'g_black_turtleneck',
      name: 'Black merino turtleneck',
      category: 'top',
      tags: ['minimal', 'classic'],
      palette: { white: 0.02, black: 0.98 },
      fabric: 'Merino 18.5μm',
      notes: 'Inverted layering essential.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8
    },
    {
      id: 'g_cropped_trouser',
      name: 'Cropped black trouser',
      category: 'bottom',
      tags: ['tailored', 'minimal'],
      palette: { white: 0.0, black: 1.0 },
      fabric: 'Wool blend, 7/8 length',
      notes: 'High waist, sharp break.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6
    },
    {
      id: 'g_raw_denim',
      name: 'Raw selvedge denim',
      category: 'bottom',
      tags: ['streetwear', 'workwear'],
      palette: { white: 0.0, black: 0.85 },
      fabric: '14oz selvedge',
      notes: 'Mid-rise, straight leg.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
    },
    {
      id: 'g_white_leather_sneaker',
      name: 'White leather sneaker',
      category: 'shoe',
      tags: ['minimal', 'classic', 'sporty'],
      palette: { white: 0.9, black: 0.1 },
      fabric: 'Italian leather, Margom sole',
      notes: 'Low top, gum sole.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
    },
    {
      id: 'g_black_chelsea',
      name: 'Black Chelsea boot',
      category: 'shoe',
      tags: ['classic', 'minimal'],
      palette: { white: 0.0, black: 1.0 },
      fabric: 'Box calf leather',
      notes: 'Elastic side, leather sole.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
    },
    {
      id: 'g_silver_chain',
      name: 'Silver chain',
      category: 'accessory',
      tags: ['minimal'],
      palette: { white: 0.7, black: 0.3 },
      fabric: '925 silver, 2mm',
      notes: 'The 5% pop the lookbook keeps promising.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
    },
    {
      id: 'g_cream_cardigan',
      name: 'Cream cashmere cardigan',
      category: 'top',
      tags: ['minimal', 'classic', 'romantic'],
      palette: { white: 0.93, black: 0.07 },
      fabric: 'Cashmere 12gg',
      notes: 'Soft drape. Layering essential for cool spring days.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18
    },
    {
      id: 'g_wool_overcoat',
      name: 'Charcoal wool overcoat',
      category: 'outerwear',
      tags: ['minimal', 'classic', 'tailored'],
      palette: { white: 0.1, black: 0.9 },
      fabric: 'Wool 480gsm, half-canvas',
      notes: 'Single-breasted. The silhouette anchor of winter.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
    },
    {
      id: 'g_stripe_blazer',
      name: 'Stripe contrast blazer',
      category: 'outerwear',
      tags: ['tailored', 'avant-garde', 'classic'],
      palette: { white: 0.5, black: 0.5 },
      fabric: 'Wool 280gsm, chalk stripe',
      notes: 'The 5% rule, woven in. Save for the evening edit.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45
    }
  ];
}

export function seedHistory(): HistoryEntry[] {
  return [
    {
      id: 'h_seed_1',
      ts: Date.now() - 1000 * 60 * 60 * 24 * 2,
      source: 'system',
      message: 'Welcome to BAW. Your wardrobe is now an agent-accessible surface.'
    },
    {
      id: 'h_seed_2',
      ts: Date.now() - 1000 * 60 * 60 * 6,
      source: 'human',
      message: 'Added "Black merino turtleneck" to wardrobe.'
    }
  ];
}
