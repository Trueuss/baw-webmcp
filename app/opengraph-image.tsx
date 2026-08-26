import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BAW — A privacy-first AI stylist with WebMCP tools for any agent.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          padding: 72,
          fontFamily: 'serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 24,
            color: '#9a9a9a',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: '#ff3b1f'
            }}
          />
          WebMCP Challenge · 2026
        </div>

        <div
          style={{
            marginTop: 64,
            fontSize: 140,
            lineHeight: 0.95,
            letterSpacing: -4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <span>Black. White.</span>
          <span style={{ fontStyle: 'italic' }}>You.</span>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: '#b4b4b4',
            maxWidth: 880,
            lineHeight: 1.4
          }}
        >
          A privacy-first AI stylist that lives in your browser. 10 WebMCP
          tools. One wardrobe. Both human and agent in the loop.
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#9a9a9a'
          }}
        >
          <span>baw-webmcp.vercel.app</span>
          <span>·</span>
          <span>document.modelContext</span>
          <span>·</span>
          <span style={{ color: '#ff3b1f' }}>10 tools live</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
