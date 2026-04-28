import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'LeResearch — a small contribution to the silos\'s fall';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 96px',
          background: '#0a0a1a',
          fontFamily: 'Georgia, serif',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 18,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(245, 245, 247, 0.45)',
          }}
        >
          <span>LeResearch</span>
          <span style={{ color: 'rgba(245, 245, 247, 0.2)' }}>·</span>
          <span>501(c)(3) in formation</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 200,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>A small contribution</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              to the silos's fall.
            </span>
          </div>
          <div
            style={{
              fontSize: 24,
              color: 'rgba(245, 245, 247, 0.6)',
              marginTop: 8,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Open, cross-disciplinary research on problems where the
            inherited frame is part of the problem.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 16,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(245, 245, 247, 0.35)',
          }}
        >
          <div>Sibling of LeDesign.ai · Open by default</div>
          <div style={{ color: 'rgba(245, 245, 247, 0.6)' }}>leresearch.org</div>
        </div>
      </div>
    ),
    size,
  );
}
