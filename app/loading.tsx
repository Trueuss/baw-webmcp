export default function Loading() {
  return (
    <main
      className="container-x"
      style={{
        paddingTop: 140,
        paddingBottom: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 32
      }}
    >
      <div>
        <div
          className="skeleton"
          style={{ height: 12, width: 120, marginBottom: 24 }}
        />
        <div className="skeleton" style={{ height: 96, width: '70%' }} />
      </div>
      <div className="skeleton" style={{ height: 220, width: '100%', borderRadius: 22 }} />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />
        ))}
      </div>
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, var(--paper-2) 0%, var(--paper-3) 50%, var(--paper-2) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.4s linear infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 880px) { .skeleton-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
