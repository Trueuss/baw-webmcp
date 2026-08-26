'use client';

import { useState } from 'react';
import type { Garment, GarmentCategory, StyleTag } from '@/lib/types';

const CATS: GarmentCategory[] = ['outerwear', 'top', 'bottom', 'shoe', 'accessory', 'dress'];
const TAGS: StyleTag[] = ['minimal', 'oversized', 'tailored', 'streetwear', 'classic', 'avant-garde', 'romantic', 'sporty', 'workwear'];

interface Props {
  onSubmit: (g: { name: string; category: GarmentCategory; fabric: string; tags: StyleTag[]; white: number; black: number; notes?: string }) => void;
}

export function AddGarmentForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('top');
  const [fabric, setFabric] = useState('Cotton');
  const [tags, setTags] = useState<StyleTag[]>([]);
  const [white, setWhite] = useState(0);
  const [black, setBlack] = useState(1);
  const [notes, setNotes] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, fabric: fabric.trim(), tags, white, black, notes: notes.trim() || undefined });
    setName('');
    setNotes('');
    setTags([]);
  }

  return (
    <form onSubmit={submit} className="add-form">
      <div className="add-form-row">
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cream wool cardigan" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as GarmentCategory)}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span>Fabric</span>
          <input value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="e.g. Cotton 200gsm" />
        </label>
      </div>
      <div className="add-form-row">
        <label>
          <span>White share ({Math.round(white * 100)}%)</span>
          <input type="range" min={0} max={1} step={0.05} value={white} onChange={(e) => setWhite(parseFloat(e.target.value))} />
        </label>
        <label>
          <span>Black share ({Math.round(black * 100)}%)</span>
          <input type="range" min={0} max={1} step={0.05} value={black} onChange={(e) => setBlack(parseFloat(e.target.value))} />
        </label>
      </div>
      <div className="add-form-row">
        <label style={{ flex: 1 }}>
          <span>Tags</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTags((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])}
                className="add-tag"
                data-on={tags.includes(t) ? 'true' : 'false'}
              >
                {t}
              </button>
            ))}
          </div>
        </label>
      </div>
      <label className="full">
        <span>Notes (optional)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why does this piece matter?" />
      </label>
      <div className="add-form-actions">
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }} disabled={!name.trim()}>
          Add to wardrobe →
        </button>
      </div>
    </form>
  );
}
