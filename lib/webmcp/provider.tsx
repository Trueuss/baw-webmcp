'use client';

import { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
 * active `document.modelContext` and re-registers when the user
 * switches locale, so the agent always sees descriptions in the
 * same language the user does. Tool change events are propagated
 * through the in-app bus for the Pair Stylist to react to.
 */
export function WebMCPProvider() {
  const t = useTranslations();
  const locale = useLocale();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!('modelContext' in document) || !document.modelContext) return;
    if (registeredRef.current === locale) return;

    const controller = new AbortController();
    const tools = registerStylistTools({
      wardrobe: useWardrobeStore.getState(),
      history: useHistoryStore.getState(),
      // Bind a translator that always reads the *current* locale's dictionary
      // — not the closure locale — so any future locale switch inside this
      // effect re-resolves correctly.
      t: (key: string) => t(key as Parameters<typeof t>[0])
    });
    const cleanups: Array<() => void> = [];
    for (const tool of tools) {
      document.modelContext!.registerTool(tool.definition, { signal: controller.signal }).catch(() => {});
      if (tool.cleanup) cleanups.push(tool.cleanup);
    }
    registeredRef.current = locale;

    const listener: ToolChangeListener = () => {
      // Pair Stylist reads via the bus directly.
    };
    const unsub = onToolChange(listener);
    cleanups.push(unsub);

    return () => {
      controller.abort();
      for (const fn of cleanups) fn();
      registeredRef.current = null;
    };
  }, [locale, t]);

  return null;
}
