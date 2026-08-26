'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function WebMCPBanner() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [toolCount, setToolCount] = useState(0);
  const t = useTranslations('webmcp_banner');

  useEffect(() => {
    let mounted = true;
    const check = () => {
      if (typeof document === 'undefined') return;
      const mc = (document as unknown as { modelContext?: { getTools?: () => Promise<unknown[]> } })
        .modelContext;
      if (mc && typeof mc.getTools === 'function') {
        mc.getTools()
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
        {t('not_detected')}{' '}
        <a
          href="https://developer.chrome.com/docs/ai/webmcp"
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'underline' }}
        >
          {t('enable_chrome')}
        </a>{' '}
        or open in{' '}
        <a
          href="https://chatgpt.com"
          target="_blank"
          rel="noopener"
          style={{ textDecoration: 'underline' }}
        >
          {t('open_chatgpt')}
        </a>
        .
      </div>
    );
  }
  if (available === null) return null;
  return (
    <div className="webmcp-banner">
      <span className="pulse" />
      {t('live', { count: toolCount })}
    </div>
  );
}
