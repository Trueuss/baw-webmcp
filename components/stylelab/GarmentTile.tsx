'use client';

import type { Garment } from '@/lib/types';

interface Props {
  garment: Garment;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

function swatch(palette: Garment['palette']): string {
  if (palette.white >= 0.7) return 'linear-gradient(135deg, #f5f5f3 0%, #ffffff 60%, #c8c8c5 100%)';
  if (palette.black >= 0.9) return 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)';
  if (palette.accent) return `linear-gradient(135deg, ${palette.accent} 0%, #1a1a1a 100%)`;
  return 'linear-gradient(135deg, #b8b8b5 0%, #6a6a6a 100%)';
}

export function GarmentTile({ garment, selected, onToggle, onRemove }: Props) {
  return (
    <div
      className="garment-tile"
      data-selected={selected ? 'true' : 'false'}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        className="garment-swatch"
        style={{ background: swatch(garment.palette) }}
        aria-hidden
      />
      <div className="garment-body">
        <div className="garment-name">{garment.name}</div>
        <div className="garment-meta">
          <span>{garment.category}</span>
          <span>·</span>
          <span>{garment.fabric}</span>
        </div>
        <div className="garment-tags">
          {garment.tags.slice(0, 3).map((t) => (
            <span key={t} className="garment-tag">{t}</span>
          ))}
        </div>
      </div>
      {selected && <div className="garment-check">✓</div>}
      <button
        className="garment-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${garment.name}`}
        title="Remove (destructive WebMCP call)"
      >
        ×
      </button>
    </div>
  );
}
