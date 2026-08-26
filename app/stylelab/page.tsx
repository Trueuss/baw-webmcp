'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWardrobeStore } from '@/lib/store/wardrobe';
import { useHistoryStore } from '@/lib/store/history';
import { analyzeOutfit, AXIS_LABELS } from '@/lib/mock/analyzer';
import { emitToolChange } from '@/lib/webmcp/bus';
import { GarmentTile } from '@/components/stylelab/GarmentTile';
import { ScorePanel } from '@/components/stylelab/ScorePanel';
import { HistoryStrip } from '@/components/stylelab/HistoryStrip';
import { AddGarmentForm } from '@/components/stylelab/AddGarmentForm';
import type { Occasion, Season, OutfitReport, Garment } from '@/lib/types';

export default function StyleLab() {
  const garments = useWardrobeStore((s) => s.garments);
  const addGarment = useWardrobeStore((s) => s.add);
  const removeGarment = useWardrobeStore((s) => s.remove);
  const saveOutfit = useHistoryStore((s) => s.saveOutfit);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const saveReport = useHistoryStore((s) => s.saveReport);
  const reports = useHistoryStore((s) => s.reports);
  const outfits = useHistoryStore((s) => s.outfits);

  const [selected, setSelected] = useState<string[]>([
    'g_oversized_blazer',
    'g_white_oxford',
    'g_cropped_trouser',
    'g_white_leather_sneaker'
  ]);
  const [occasion, setOccasion] = useState<Occasion>('business-casual');
  const [season, setSeason] = useState<Season>('autumn');
  const [report, setReport] = useState<OutfitReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'outerwear' | 'top' | 'bottom' | 'shoe' | 'accessory'>('all');

  const filteredGarments = useMemo(
    () => (filter === 'all' ? garments : garments.filter((g) => g.category === filter)),
    [garments, filter]
  );

  // Initial report for the pre-selected outfit
  useEffect(() => {
    if (report === null) {
      const sel = garments.filter((g) => selected.includes(g.id));
      setReport(analyzeOutfit(sel, { occasion }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garments]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setReport(null);
  }

  function analyze() {
    const sel = garments.filter((g) => selected.includes(g.id));
    if (sel.length === 0) {
      setReport(null);
      return;
    }
    setIsAnalyzing(true);
    // Simulate the on-device model's "thinking" delay
    window.setTimeout(() => {
      const r = analyzeOutfit(sel, { occasion });
      setReport(r);
      saveReport(r);
      addEntry({
        source: 'human',
        tool: 'analyze_outfit',
        message: `Scored ${sel.length}-piece outfit at ${r.overall}/10 for ${occasion}.`
      });
      emitToolChange({ reason: 'report-generated', detail: { overall: r.overall } });
      setIsAnalyzing(false);
    }, 350);
  }

  function saveCurrent() {
    const sel = garments.filter((g) => selected.includes(g.id));
    if (sel.length === 0) return;
    const label = `look no. ${String(outfits.length + 1).padStart(3, '0')}`;
    const o = saveOutfit({ label, garmentIds: sel.map((g) => g.id), occasion, season });
    addEntry({
      source: 'human',
      tool: 'save_outfit',
      message: `Saved ${label} (${sel.length} pieces) for ${occasion} in ${season}.`
    });
    emitToolChange({ reason: 'outfit-saved', detail: { id: o.id } });
  }

  function clearSelection() {
    setSelected([]);
    setReport(null);
  }

  function onAddGarment(input: { name: string; category: Garment['category']; fabric: string; tags: Garment['tags']; white: number; black: number; notes?: string }) {
    const g = addGarment({
      name: input.name,
      category: input.category,
      fabric: input.fabric,
      tags: input.tags,
      palette: { white: input.white, black: input.black },
      notes: input.notes
    });
    addEntry({ source: 'human', tool: 'add_garment', message: `Added "${g.name}" (${g.category}).` });
    emitToolChange({ reason: 'wardrobe-changed', detail: { added: g.id } });
    setAdding(false);
    setSelected((s) => [...s, g.id]);
  }

  function onRemoveGarment(id: string) {
    const g = garments.find((x) => x.id === id);
    if (!g) return;
    if (!window.confirm(`Remove "${g.name}" from the wardrobe? This is a destructive WebMCP call.`)) return;
    removeGarment(id);
    setSelected((s) => s.filter((x) => x !== id));
    addEntry({ source: 'human', tool: 'remove_garment', message: `Removed "${g.name}".` });
    emitToolChange({ reason: 'wardrobe-changed', detail: { removed: id } });
  }

  return (
    <main className="container-x" style={{ paddingTop: 110, paddingBottom: 80 }}>
      <header style={{ marginBottom: 32 }}>
        <div className="eyebrow">// stylelab · private</div>
        <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', marginTop: 16 }}>
          The <em>wardrobe</em> is the surface.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 720, marginTop: 16 }}>
          Pick pieces, score the combination, and let any agent (or the built-in
          Pair Stylist) call <code>analyze_outfit</code>,{' '}
          <code>propose_outfit</code> and friends through WebMCP. Everything
          below is local — open DevTools to verify.
        </p>
      </header>

      <div className="lab-grid">
        {/* ============ WARDROBE COLUMN ============ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 28 }}>Wardrobe <em>· {garments.length}</em></h2>
            <button onClick={() => setAdding((v) => !v)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
              {adding ? 'Cancel' : '+ Add piece'}
            </button>
          </div>
          {adding && (
            <div style={{ marginBottom: 18 }}>
              <AddGarmentForm onSubmit={onAddGarment} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {(['all', 'outerwear', 'top', 'bottom', 'shoe', 'accessory'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  background: filter === f ? 'var(--ink)' : 'transparent',
                  color: filter === f ? 'var(--paper)' : 'var(--ink)',
                  border: '1px solid',
                  borderColor: filter === f ? 'var(--ink)' : 'var(--line)'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="garment-grid">
            {filteredGarments.map((g) => (
              <GarmentTile
                key={g.id}
                garment={g}
                selected={selected.includes(g.id)}
                onToggle={() => toggle(g.id)}
                onRemove={() => onRemoveGarment(g.id)}
              />
            ))}
          </div>
        </section>

        {/* ============ OUTFIT + SCORE COLUMN ============ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 28 }}>Outfit <em>· {selected.length} pieces</em></h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={clearSelection} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                Clear
              </button>
              <button onClick={saveCurrent} disabled={selected.length === 0} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
                Save look
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
              Occasion
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as Occasion)}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--paper)', fontSize: 14, color: 'var(--ink)' }}
              >
                {['casual', 'business-casual', 'formal', 'creative', 'outdoor', 'evening'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
              Season
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as Season)}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--paper)', fontSize: 14, color: 'var(--ink)' }}
              >
                {['spring', 'summer', 'autumn', 'winter'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <button
              onClick={analyze}
              disabled={selected.length === 0 || isAnalyzing}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', opacity: selected.length === 0 ? 0.5 : 1 }}
            >
              {isAnalyzing ? 'Thinking…' : 'Analyze →'}
            </button>
          </div>

          <ScorePanel report={report} loading={isAnalyzing} garmentCount={selected.length} />
        </section>
      </div>

      <div style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 28, marginBottom: 18 }}>History <em>· last {Math.min(reports.length, 12)} reports</em></h2>
        <HistoryStrip reports={reports.slice(0, 12)} />
      </div>
    </main>
  );
}
