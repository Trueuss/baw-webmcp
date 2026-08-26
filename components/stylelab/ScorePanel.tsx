'use client';

import { AXIS_LABELS } from '@/lib/mock/analyzer';
import type { OutfitReport } from '@/lib/types';

interface Props {
  report: OutfitReport | null;
  loading: boolean;
  garmentCount: number;
}

export function ScorePanel({ report, loading, garmentCount }: Props) {
  if (loading) {
    return (
      <div className="score-panel" data-loading="true">
        <div className="score-loading">thinking on device…</div>
      </div>
    );
  }
  if (!report || report.overall === 0) {
    return (
      <div className="score-panel" data-empty="true">
        <div className="score-empty">
          {garmentCount === 0
            ? 'Select at least one piece to score an outfit.'
            : 'Press "Analyze" to run the four-axis model.'}
        </div>
      </div>
    );
  }
  return (
    <div className="score-panel">
      <div className="score-overall">
        <div className="score-num">
          {report.overall.toFixed(1)}
          <small>/10</small>
        </div>
        <div className="score-model mono">
          model · {report.model} · {new Date(report.generatedAt).toLocaleTimeString()}
        </div>
      </div>
      <div className="score-axes">
        {report.axes.map((axis) => (
          <div className="score-axis" key={axis.axis}>
            <div className="score-axis-head">
              <span className="score-axis-label">{AXIS_LABELS[axis.axis]}</span>
              <span className="score-axis-num mono">{axis.score.toFixed(1)}</span>
            </div>
            <div className="score-axis-bar">
              <div className="score-axis-fill" style={{ width: `${(axis.score / 10) * 100}%` }} />
            </div>
            <p className="score-axis-comment">{axis.comment}</p>
          </div>
        ))}
      </div>
      {report.nextTime && (
        <div className="score-next">
          <strong>Next time.</strong> {report.nextTime}
        </div>
      )}
    </div>
  );
}
