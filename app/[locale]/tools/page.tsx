import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getToolDocs, type ToolDoc } from '@/lib/webmcp/docs';

export const metadata = {
  title: 'Tools for agents',
  description: 'The 12 WebMCP tools BAW exposes to any agent, with their full JSON Schema input and runtime annotations.'
};

type T = Awaited<ReturnType<typeof getTranslations>>;

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const tBind = (key: string) => t(key as Parameters<typeof t>[0]);
  const docs = getToolDocs(tBind);
  return <ToolsPageInner docs={docs} t={t} tBind={tBind} />;
}

function ToolsPageInner({ docs, t, tBind }: { docs: ToolDoc[]; t: T; tBind: (key: string) => string }) {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>{tBind('tools.eyebrow')}</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        {tBind('tools.title')}{' '}
        <em>{tBind('tools.title_emph')}</em>{' '}
        {tBind('tools.title_suffix')}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 720, marginTop: 24 }}>
        {tBind('tools.lead')}
      </p>

      <div
        style={{
          marginTop: 40,
          padding: '14px 18px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderRadius: 12,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: 13
        }}
      >
        <span style={{ color: 'var(--accent)' }}>$</span> {tBind('tools.snippet')}
      </div>

      <div style={{ marginTop: 64, display: 'grid', gap: 32 }}>
        {docs.map((doc) => (
          <article
            key={doc.name}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--paper-2)',
              padding: 28,
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 18
            }}
          >
            <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <code
                style={{
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  background: 'var(--paper)',
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--line-2)'
                }}
              >
                {doc.name}
              </code>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {doc.annotations.map((a) => (
                  <span
                    key={a}
                    style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: a === 'readOnlyHint' ? '#eaf5ec' : a === 'destructiveHint' ? '#fde8e3' : 'var(--paper)',
                      color: a === 'readOnlyHint' ? '#1c6b34' : a === 'destructiveHint' ? 'var(--accent)' : 'var(--muted)',
                      border: '1px solid',
                      borderColor: a === 'readOnlyHint' ? '#cfe5d5' : a === 'destructiveHint' ? '#f8c4b8' : 'var(--line)'
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </header>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', maxWidth: 760 }}>
              {doc.description}
            </p>
            <details
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '10px 16px'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 12,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Input schema
              </summary>
              <pre
                style={{
                  marginTop: 12,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                  whiteSpace: 'pre',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(doc.inputSchema, null, 2)}
              </pre>
            </details>
            <details
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '10px 16px'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 12,
                  color: 'var(--muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Example call
              </summary>
              <pre
                style={{
                  marginTop: 12,
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                  whiteSpace: 'pre',
                  overflowX: 'auto'
                }}
              >
                {doc.example}
              </pre>
            </details>
          </article>
        ))}
      </div>

      <section
        style={{
          marginTop: 96,
          padding: 40,
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderRadius: 22
        }}
      >
        <h2 style={{ color: 'var(--paper)', fontSize: 'clamp(36px, 5vw, 64px)' }}>
          {tBind('tools.driver_title')}
        </h2>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--muted-2)' }}>{tBind('tools.driver_chrome_label')}</div>
            <p style={{ marginTop: 12, color: '#cfcfcf', lineHeight: 1.7 }}>
              {tBind('tools.driver_chrome_body')}
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--muted-2)' }}>{tBind('tools.driver_chatgpt_label')}</div>
            <p style={{ marginTop: 12, color: '#cfcfcf', lineHeight: 1.7 }}>
              {tBind('tools.driver_chatgpt_body')}
            </p>
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-accent">{tBind('tools.cta_lab')}</Link>
          <Link href="/stylist" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: '#3a3a3a' }}>
            {tBind('tools.cta_stylist')}
          </Link>
        </div>
      </section>
    </main>
  );
}
