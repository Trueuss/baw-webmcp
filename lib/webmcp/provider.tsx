'use client';

import { useEffect, useRef } from 'react';
import { useWardrobeStore } from '@/lib/store/wardrobe';
import { useHistoryStore } from '@/lib/store/history';
import { registerStylistTools } from './tools';
import { onToolChange, type ToolChangeListener } from './bus';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: unknown,
        options?: { signal?: AbortSignal; exposedTo?: string[] }
      ) => Promise<unknown>;
      getTools: (opts?: { fromOrigins?: string[] }) => Promise<unknown[]>;
      executeTool: (tool: unknown, args: string, opts?: { signal?: AbortSignal }) => Promise<unknown>;
      addEventListener?: (type: string, listener: EventListener) => void;
    };
  }
}

/**
 * Mounts once at the root. Registers all BAW WebMCP tools on the
 * active `document.modelContext` and wires up `toolchange` event
 * propagation through the app.
 */
export function WebMCPProvider() {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (registeredRef.current) return;
    if (!('modelContext' in document) || !document.modelContext) {
      // No WebMCP runtime in this browser yet (Chrome 149+ / ChatGPT in-app).
      // Tools are still discoverable through the in-app UI for agents.
      return;
    }
    registeredRef.current = true;
    const controller = new AbortController();
    const tools = registerStylistTools({
      wardrobe: useWardrobeStore.getState(),
      history: useHistoryStore.getState()
    });
    const cleanups: Array<() => void> = [];
    for (const t of tools) {
      document.modelContext!.registerTool(t.definition, { signal: controller.signal }).catch(() => {});
      if (t.cleanup) cleanups.push(t.cleanup);
    }

    // Wire toolchange to local bus
    const listener: ToolChangeListener = () => {
      // For now this is a no-op stub — richer reactive UI lives in /stylist.
    };
    const unsub = onToolChange(listener);
    cleanups.push(unsub);

    return () => {
      controller.abort();
      for (const fn of cleanups) fn();
    };
  }, []);

  return null;
}
