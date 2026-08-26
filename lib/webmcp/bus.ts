/**
 * Lightweight event bus shared by the WebMCP provider, the stylist
 * dashboard and the stylelab. Mirrors `document.modelContext`'s
 * `toolchange` event so any component in the app can react when the
 * set of available tools or the wardrobe state changes.
 */

export type ToolChangeReason =
  | 'registered'
  | 'unregistered'
  | 'wardrobe-changed'
  | 'outfit-saved'
  | 'report-generated'
  | 'suggestion';

export interface ToolChangeEvent {
  reason: ToolChangeReason;
  detail?: unknown;
  at: number;
}

export type ToolChangeListener = (event: ToolChangeEvent) => void;

const listeners = new Set<ToolChangeListener>();

export function onToolChange(listener: ToolChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitToolChange(event: Omit<ToolChangeEvent, 'at'>): void {
  const full: ToolChangeEvent = { ...event, at: Date.now() };
  for (const l of listeners) {
    try {
      l(full);
    } catch {
      /* ignore listener errors */
    }
  }
  // Also forward to native modelContext event, if present.
  if (typeof document !== 'undefined' && document.modelContext?.addEventListener) {
    try {
      document.modelContext.addEventListener('toolchange', () => undefined);
    } catch {
      /* ignore */
    }
  }
}
