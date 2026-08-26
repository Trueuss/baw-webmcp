'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useWardrobeStore } from '@/lib/store/wardrobe';
import { useHistoryStore } from '@/lib/store/history';
import { analyzeOutfit } from '@/lib/mock/analyzer';
import { emitToolChange } from '@/lib/webmcp/bus';
import type { Occasion, Season, Garment, OutfitReport, StylistSuggestion } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  toolCall?: { name: string; input: unknown; result?: unknown };
  ts: number;
}

const TOOLS = [
  { name: 'list_wardrobe', annotation: 'readOnly' },
  { name: 'get_garment', annotation: 'readOnly' },
  { name: 'add_garment', annotation: 'write' },
  { name: 'remove_garment', annotation: 'destructive' },
  { name: 'analyze_outfit', annotation: 'readOnly' },
  { name: 'propose_outfit', annotation: 'readOnly' },
  { name: 'save_outfit', annotation: 'write' },
  { name: 'list_history', annotation: 'readOnly' },
  { name: 'get_session_state', annotation: 'readOnly' },
  { name: 'compare_outfits', annotation: 'readOnly' }
];

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function pickByRule(handle: { garments: Garment[] }, opts: { occasion?: Occasion; focus?: string }) {
  const owned = handle.garments;
  if (owned.length === 0) return [];
  const pick = (cat: string) => owned.find((g) => g.category === cat);
  const order = ['outerwear', 'top', 'bottom', 'shoe', 'accessory'];
  const chosen: Garment[] = [];
  const seen = new Set<string>();
  for (const cat of order) {
    const g = pick(cat);
    if (g && !seen.has(g.id)) {
      seen.add(g.id);
      chosen.push(g);
    }
  }
  // Filter by focus if requested
  if (opts.focus) {
    const focused = chosen.filter((g) => g.tags.includes(opts.focus as Garment['tags'][number]));
    return focused.length > 0 ? focused : chosen;
  }
  return chosen;
}

export default function PairStylist() {
  const garments = useWardrobeStore((s) => s.garments);
  const saveOutfit = useHistoryStore((s) => s.saveOutfit);
  const addEntry = useHistoryStore((s) => s.addEntry);
  const entries = useHistoryStore((s) => s.entries);
  const reports = useHistoryStore((s) => s.reports);
  const outfits = useHistoryStore((s) => s.outfits);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed the conversation
    if (messages.length === 0) {
      setMessages([
        {
          id: newId('m'),
          role: 'agent',
          text:
            "Hi. I'm your BAW Pair Stylist. I see your wardrobe the same way you do, and I can call 10 WebMCP tools to act on it. Ask me for an outfit, a comparison, or to add a new piece.",
          ts: Date.now() - 1000
        },
        {
          id: newId('m'),
          role: 'system',
          text: `WebMCP runtime detected. ${TOOLS.length} tools registered on document.modelContext.`,
          ts: Date.now() - 500
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isThinking]);

  function push(m: Omit<ChatMessage, 'id' | 'ts'>) {
    setMessages((cur) => [...cur, { ...m, id: newId('m'), ts: Date.now() }]);
  }

  async function handleSend(text?: string) {
    const userText = (text ?? draft).trim();
    if (!userText) return;
    push({ role: 'user', text: userText });
    setDraft('');
    setIsThinking(true);

    // Simulated routing delay
    await new Promise((r) => setTimeout(r, 600));
    setIsThinking(false);

    const intent = routeIntent(userText);

    if (intent.kind === 'list_wardrobe') {
      const result = { count: garments.length, items: garments.map((g) => ({ id: g.id, name: g.name, category: g.category })) };
      push({
        role: 'agent',
        text: `I called list_wardrobe and got ${result.count} pieces back. Want me to propose an outfit from these, or do a specific filter?`,
        toolCall: { name: 'list_wardrobe', input: intent.input ?? {}, result }
      });
      addEntry({ source: 'agent', tool: 'list_wardrobe', message: `Listed ${garments.length} garments.` });
      return;
    }

    if (intent.kind === 'propose_outfit') {
      const chosen = pickByRule({ garments }, { occasion: intent.occasion, focus: intent.focus });
      if (chosen.length === 0) {
        push({ role: 'agent', text: 'Your wardrobe is empty. Head to the Style Lab to add a piece first.', toolCall: { name: 'propose_outfit', input: { occasion: intent.occasion, season: intent.season }, result: { error: 'empty wardrobe' } } });
        return;
      }
      const report = analyzeOutfit(chosen, { occasion: intent.occasion });
      const msg = `I called propose_outfit for ${intent.occasion} in ${intent.season}. Predicted score: ${report.overall}/10. Pieces: ${chosen.map((g) => g.name).join(' · ')}.`;
      const suggestion: StylistSuggestion = {
        id: newId('sg'),
        type: 'propose',
        message: msg,
        createdAt: Date.now(),
        status: 'open'
      };
      push({ role: 'agent', text: msg, toolCall: { name: 'propose_outfit', input: { occasion: intent.occasion, season: intent.season }, result: { suggestion, preview: report } } });
      addEntry({ source: 'agent', tool: 'propose_outfit', message: msg });
      emitToolChange({ reason: 'suggestion', detail: suggestion });
      return;
    }

    if (intent.kind === 'analyze') {
      const chosen = garments.filter((g) => intent.garmentIds!.includes(g.id));
      if (chosen.length === 0) {
        push({ role: 'agent', text: 'I need garment ids to analyze. Try "analyze the blazer + shirt + trouser".', toolCall: { name: 'analyze_outfit', input: intent, result: { error: 'no garments' } } });
        return;
      }
      const report = analyzeOutfit(chosen, { occasion: intent.occasion });
      const summary = `Predicted ${report.overall}/10. ${report.axes[0].comment}`;
      push({ role: 'agent', text: summary, toolCall: { name: 'analyze_outfit', input: intent, result: report } });
      addEntry({ source: 'agent', tool: 'analyze_outfit', message: `Scored ${chosen.length}-piece outfit at ${report.overall}/10.` });
      emitToolChange({ reason: 'report-generated', detail: { overall: report.overall } });
      return;
    }

    if (intent.kind === 'state') {
      const result = {
        wardrobeCount: garments.length,
        outfitCount: outfits.length,
        reportCount: reports.length,
        lastEntry: entries[0] ?? null
      };
      push({
        role: 'agent',
        text: `Wardrobe: ${result.wardrobeCount} pieces. Outfits: ${result.outfitCount}. Reports: ${result.reportCount}. Last activity: ${result.lastEntry?.message ?? '—'}`,
        toolCall: { name: 'get_session_state', input: {}, result }
      });
      return;
    }

    if (intent.kind === 'history') {
      const recent = entries.slice(0, intent.limit ?? 5);
      push({
        role: 'agent',
        text: `Here are the last ${recent.length} entries:\n` + recent.map((e) => `• [${e.source}] ${e.message}`).join('\n'),
        toolCall: { name: 'list_history', input: { limit: recent.length }, result: { entries: recent } }
      });
      return;
    }

    if (intent.kind === 'save') {
      const chosen = garments.filter((g) => intent.garmentIds!.includes(g.id));
      if (chosen.length === 0) {
        push({ role: 'agent', text: 'Tell me which pieces to save. For example: "save look with the blazer + shirt + trouser".', toolCall: { name: 'save_outfit', input: intent, result: { error: 'no garments' } } });
        return;
      }
      const o = saveOutfit({ label: intent.label ?? `look no. ${String(outfits.length + 1).padStart(3, '0')}`, garmentIds: chosen.map((g) => g.id), occasion: intent.occasion ?? 'casual', season: intent.season ?? 'autumn' });
      push({ role: 'agent', text: `Saved "${o.id}" with ${chosen.length} pieces.`, toolCall: { name: 'save_outfit', input: intent, result: { ok: true, id: o.id } } });
      addEntry({ source: 'agent', tool: 'save_outfit', message: `Saved ${o.id}.` });
      emitToolChange({ reason: 'outfit-saved', detail: { id: o.id } });
      return;
    }

    // Default fallback — context-aware echo
    push({
      role: 'agent',
      text: `I can call 10 WebMCP tools: ${TOOLS.map((t) => t.name).join(', ')}. Try: "propose an outfit for creative monday", "list wardrobe", "analyze blazer + shirt + trouser", "what's the session state", or "show history".`
    });
  }

  return (
    <main className="container-x" style={{ paddingTop: 110, paddingBottom: 80 }}>
      <header style={{ marginBottom: 32 }}>
        <div className="eyebrow">// pair stylist · WebMCP copilot</div>
        <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', marginTop: 16 }}>
          Talk to your <em>wardrobe</em>.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 720, marginTop: 16 }}>
          The Pair Stylist is an agent that lives next to the Style Lab. Every
          sentence below is a <code>document.modelContext</code> tool call,
          executed against your local wardrobe. Open DevTools to watch the
          runtime hand tools to the agent.
        </p>
      </header>

      <div className="stylist-grid">
        {/* ============ LIVE STATE PANEL ============ */}
        <aside className="state-panel">
          <h2 style={{ fontSize: 22 }}>Live session</h2>
          <div className="state-row">
            <div className="row-label">tools registered</div>
            <div className="row-value">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 0 4px rgba(255,59,31,0.18)' }} />
                {TOOLS.length} tools live
              </span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TOOLS.map((t) => (
                <span className="tool-pill" key={t.name}>
                  <span className="dot" /> {t.name}
                </span>
              ))}
            </div>
          </div>
          <div className="state-row">
            <div className="row-label">wardrobe</div>
            <div className="row-value">{garments.length} pieces · {new Set(garments.map((g) => g.category)).size} categories</div>
          </div>
          <div className="state-row">
            <div className="row-label">reports</div>
            <div className="row-value">{reports.length} scored outfits</div>
          </div>
          <div className="state-row">
            <div className="row-label">saved looks</div>
            <div className="row-value">{outfits.length} outfits</div>
          </div>
          <div className="state-row">
            <div className="row-label">last activity</div>
            <div className="row-value" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: 'var(--muted-2)' }}>
              {entries[0]?.message ?? '—'}
            </div>
          </div>
          <div className="state-row">
            <div className="row-label">go to</div>
            <div className="row-value" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/stylelab" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Style Lab</Link>
              <Link href="/lookbook" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Lookbook</Link>
            </div>
          </div>
        </aside>

        {/* ============ CHAT PANEL ============ */}
        <section className="chat-panel">
          <div className="chat-log" ref={logRef}>
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                {m.text}
                {m.toolCall && (
                  <span className="tool-call">
                    ↳ tool: {m.toolCall.name}(
                    {JSON.stringify(m.toolCall.input)})
                    {Boolean(m.toolCall.result) && (
                      <span style={{ opacity: 0.6 }}> → {Object.keys(m.toolCall.result as object).join(', ')}</span>
                    )}
                  </span>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="bubble agent" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: 'var(--muted)' }}>
                thinking… calling tools
              </div>
            )}
          </div>

          <div className="chat-suggestions">
            {[
              'propose an outfit for creative monday',
              'list my wardrobe',
              'what\u2019s the session state',
              'analyze blazer + shirt + trouser',
              'show history'
            ].map((s) => (
              <button key={s} className="chat-suggestion" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask the stylist — e.g. 'propose something for an evening dinner'"
            />
            <button type="submit" className="btn btn-primary" disabled={!draft.trim() || isThinking}>
              Send
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

// =================================================================
// Intent router
// =================================================================
type Intent =
  | { kind: 'list_wardrobe'; input?: { category?: string } }
  | { kind: 'propose_outfit'; occasion: Occasion; season: Season; focus?: string }
  | { kind: 'analyze'; garmentIds: string[]; occasion?: Occasion }
  | { kind: 'state' }
  | { kind: 'history'; limit?: number }
  | { kind: 'save'; label?: string; garmentIds: string[]; occasion?: Occasion; season?: Season };

const OCCASION_KEYWORDS: Record<Occasion, string[]> = {
  'casual': ['casual', 'weekend', 'relaxed', 'lazy', '日常', '休闲'],
  'business-casual': ['business', 'office', 'work', 'workday', 'creative monday', 'meeting', '上班', '通勤', '商务休闲'],
  'formal': ['formal', 'wedding', 'ceremony', 'dress', 'banquet', '正式', '婚礼', '晚宴'],
  'creative': ['creative', 'studio', 'art', 'design week', 'gallery', '创意', '工作室'],
  'outdoor': ['outdoor', 'park', 'hike', 'travel', 'outdoors', '户外', '旅行'],
  'evening': ['evening', 'dinner', 'date', 'night out', '晚上', '约会', '晚宴']
};
const SEASON_KEYWORDS: Record<Season, string[]> = {
  'spring': ['spring', '春'],
  'summer': ['summer', '夏'],
  'autumn': ['autumn', 'fall', '秋'],
  'winter': ['winter', '冬']
};

function findOccasion(text: string): Occasion | undefined {
  for (const [occ, kws] of Object.entries(OCCASION_KEYWORDS)) {
    if (kws.some((k) => text.toLowerCase().includes(k.toLowerCase()))) return occ as Occasion;
  }
  return undefined;
}
function findSeason(text: string): Season {
  for (const [s, kws] of Object.entries(SEASON_KEYWORDS)) {
    if (kws.some((k) => text.toLowerCase().includes(k.toLowerCase()))) return s as Season;
  }
  return 'autumn';
}

function routeIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/^(list|show|see).*(wardrobe|closet|pieces|clothes|衣橱)/.test(t) || /我的衣橱|我的衣服|list wardrobe/.test(t)) {
    return { kind: 'list_wardrobe' };
  }
  if (/state|session status|当前状态|会话状态/.test(t)) return { kind: 'state' };
  if (/history|log|recent|历史|最近/.test(t)) return { kind: 'history', limit: 5 };

  if (/propose|suggest|recommend|今天穿什么|推荐|搭配|穿什么|穿去/.test(t)) {
    return {
      kind: 'propose_outfit',
      occasion: findOccasion(t) ?? 'business-casual',
      season: findSeason(t)
    };
  }

  if (/analyze|score|analyse|analyse|score|评分|分析/.test(t)) {
    return {
      kind: 'analyze',
      garmentIds: extractIds(text),
      occasion: findOccasion(t)
    };
  }

  if (/save|keep|store|保存/.test(t)) {
    return {
      kind: 'save',
      label: undefined,
      garmentIds: extractIds(text),
      occasion: findOccasion(t),
      season: findSeason(t)
    };
  }

  return { kind: 'list_wardrobe' };
}

function extractIds(text: string): string[] {
  // Map known garment names to seed ids
  const map: Record<string, string> = {
    'blazer': 'g_oversized_blazer',
    'oversized': 'g_oversized_blazer',
    'shirt': 'g_white_oxford',
    'oxford': 'g_white_oxford',
    'white shirt': 'g_white_oxford',
    'turtleneck': 'g_black_turtleneck',
    'merino': 'g_black_turtleneck',
    'trouser': 'g_cropped_trouser',
    'cropped': 'g_cropped_trouser',
    'denim': 'g_raw_denim',
    'raw': 'g_raw_denim',
    'sneaker': 'g_white_leather_sneaker',
    'white sneaker': 'g_white_leather_sneaker',
    'chelsea': 'g_black_chelsea',
    'boot': 'g_black_chelsea',
    'chain': 'g_silver_chain',
    'silver': 'g_silver_chain'
  };
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [kw, id] of Object.entries(map)) {
    if (lower.includes(kw) && !found.includes(id)) found.push(id);
  }
  return found;
}
