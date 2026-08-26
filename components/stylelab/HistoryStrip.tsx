'use client';

import type { OutfitReport } from '@/lib/types';

interface Props {
  reports: OutfitReport[];
}

export function HistoryStrip({ reports }: Props) {
  if (reports.length === 0) {
    return (
      <div className="history-strip" data-empty="true">
        Score an outfit to start the diary.
      </div>
    );
  }
  return (
    <div className="history-grid">
      {reports.map((r) => (
        <div className="history-card" key={r.id}>
          <div className="history-num mono">
            {(r.overall ?? 0).toFixed(1)}
          </div>
          <div className="history-time mono">
            {new Date(r.generatedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="history-comment">
            {r.axes.find((a) => a.score === Math.max(...r.axes.map((x) => x.score)))?.comment ??
              r.axes[0].comment}
          </div>
        </div>
      ))}
    </div>
  );
}
