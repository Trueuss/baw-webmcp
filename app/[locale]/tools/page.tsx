import Link from 'next/link';
import { TOOL_DOCS } from '@/lib/webmcp/docs';

export const metadata = {
  title: 'Tools for agents',
  description: 'The 10 WebMCP tools BAW exposes to any agent, with their full JSON Schema input and runtime annotations.'
};

export default function ToolsPage() {
  return (
    <main className="container-x" style={{ paddingTop: 140, paddingBottom: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 24 }}>// tools · for agents</div>
      <h1 style={{ fontSize: 'clamp(56px, 9vw, 120px)', maxWidth: 900 }}>
        Ten tools. <em>One wardrobe.</em> Both human and agent in the loop.
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 18, maxWidth: 720, marginTop: 24 }}>
        When you load any BAW page in a WebMCP-aware browser (Chrome 149+ with
        the flag, or ChatGPT&rsquo;s in-app browser), these ten tools are
        registered on <code>document.modelContext</code>. Below is what the
        agent actually sees: name, description, JSON Schema input, and the
        annotation that drives the trust boundary in the UI.
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
        <span style={{ color: 'var(--accent)' }}>$</span>{' '}
        await document.modelContext.getTools() <br />
        <span style={{ opacity: 0.5 }}>→ </span>
        <span style={{ color: '#6ed27e' }}>[ 10 tools · all with descriptions and JSON Schema ]</span>
      </div>

      <div style={{ marginTop: 64, display: 'grid', gap: 32 }}>
        {TOOL_DOCS.map((doc) => (
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
          How to drive them from a real agent
        </h2>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--muted-2)' }}>From Chrome 149+</div>
            <p style={{ marginTop: 12, color: '#cfcfcf', lineHeight: 1.7 }}>
              Open <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>chrome://flags/#enable-webmcp-testing</code>,
              enable the flag, and reload. Open any BAW page; the tools are
              now visible to the in-browser Gemini. The Inspector extension
              lets you watch calls live.
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--muted-2)' }}>From ChatGPT</div>
            <p style={{ marginTop: 12, color: '#cfcfcf', lineHeight: 1.7 }}>
              Open any BAW page from inside <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>chatgpt.com</code>.
              WebMCP is on by default. Ask the model: &ldquo;Propose an outfit
              from my BAW wardrobe for a creative Monday&rdquo; — it will
              call the right tool.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/stylelab" className="btn btn-accent">Try the Style Lab →</Link>
          <Link href="/stylist" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: '#3a3a3a' }}>
            Open the Pair Stylist
          </Link>
        </div>
      </section>
    </main>
  );
}
