'use client';

import { useEffect, useState } from 'react';

export function WebMCPBanner() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [toolCount, setToolCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const check = () => {
      if (typeof document === 'undefined') return;
      const mc = (document as unknown as { modelContext?: { getTools?: () => Promise<unknown[]> } })
        .modelContext;
      if (mc && typeof mc.getTools === 'function') {
        mc
          .getTools()
          .then((tools) => mounted && setToolCount(tools.length))
          .catch(() => mounted && setToolCount(0));
        setAvailable(true);
      } else {
        setAvailable(false);
      }
    };
    check();
    const id = window.setInterval(check, 1500);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  if (available === false) {
    return (
      <div className="webmcp-banner">
        <em>WebMCP</em> not detected in this browser.{' '}
        <a
          href="https://developer.chrome.com/docs/ai/webmcp"
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'underline' }}
        >
          Enable it in Chrome 149+
        </a>{' '}
        or open in{' '}
        <a
          href="https://chatgpt.com"
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'underline' }}
        >
          ChatGPT
        </a>
        .
      </div>
    );
  }
  if (available === null) return null;
  return (
    <div className="webmcp-banner">
      <span className="pulse" />
      <em>WebMCP</em> is live — {toolCount} tool{toolCount === 1 ? '' : 's'} registered for any
      agent to call.
    </div>
  );
}
