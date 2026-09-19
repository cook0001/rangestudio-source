import React from 'react';
import { RifleOpticConfig, TrajectoryStep } from '../types/ballistics';

interface ReticleCanvasProps {
  optic: RifleOpticConfig;
  selectedStep: TrajectoryStep;
  targetRangeYd: number;
}

export const ReticleCanvas: React.FC<ReticleCanvasProps> = ({
  optic,
  selectedStep,
  targetRangeYd,
}) => {
  const size = 380;
  const center = size / 2;
  const radius = size / 2 - 16;

  // Zoom magnification scaling
  // FFP: Subtensions scale with magnification; SFP: Subtensions stay constant
  const zoomFactor =
    optic.focal_plane === 'FFP'
      ? optic.current_magnification / optic.min_magnification
      : 1.0;

  // Pixels per MIL on screen
  const basePixelsPerMil = 14;
  const pxPerMil = basePixelsPerMil * (optic.focal_plane === 'FFP' ? Math.min(2.5, Math.max(0.6, zoomFactor)) : 1.0);

  // Impact position on reticle (holdover is negative drop, so hold down)
  const impactY = center + selectedStep.elevation_mil * pxPerMil;
  // Wind drift is right (positive) or left (negative), so hold into the wind
  const impactX = center + selectedStep.windage_mil * pxPerMil;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {/* Scope Header HUD */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div>
          <span>OPTIC: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{optic.optic_name}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--accent-green)' }}>{optic.current_magnification}x</span> ({optic.focal_plane})
        </div>
      </div>

      {/* SVG Reticle HUD */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          backgroundColor: '#05070d',
          borderRadius: '50%',
          border: '4px solid #1f293d',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.6)',
        }}
      >
        <defs>
          <radialGradient id="eyeboxGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b1320" stopOpacity="0" />
            <stop offset="85%" stopColor="#050811" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020408" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* Optical Field Vignette */}
        <circle cx={center} cy={center} r={radius} fill="url(#eyeboxGlow)" />

        {/* Main Crosshairs */}
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#4ade80" strokeWidth="1.2" />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#4ade80" strokeWidth="1.2" />

        {/* MIL Stadia Tick Marks */}
        {[-8, -6, -4, -2, 2, 4, 6, 8].map((mil) => {
          const x = center + mil * pxPerMil;
          const y = center + mil * pxPerMil;
          return (
            <React.Fragment key={mil}>
              {/* Horizontal Stadia */}
              <line x1={x} y1={center - 4} x2={x} y2={center + 4} stroke="#4ade80" strokeWidth="1" />
              <text x={x} y={center - 7} fill="#4ade80" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {Math.abs(mil)}
              </text>

              {/* Vertical Stadia */}
              <line x1={center - 4} y1={y} x2={center + 4} y2={y} stroke="#4ade80" strokeWidth="1" />
              {mil > 0 && (
                <text x={center + 8} y={y + 3} fill="#4ade80" fontSize="8" fontFamily="monospace">
                  {mil}
                </text>
              )}
            </React.Fragment>
          );
        })}

        {/* Sub-MIL Hash Marks */}
        {[-7, -5, -3, -1, 1, 3, 5, 7].map((mil) => {
          const x = center + mil * pxPerMil;
          const y = center + mil * pxPerMil;
          return (
            <React.Fragment key={`sub-${mil}`}>
              <line x1={x} y1={center - 2.5} x2={x} y2={center + 2.5} stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
              <line x1={center - 2.5} y1={y} x2={center + 2.5} y2={y} stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
            </React.Fragment>
          );
        })}

        {/* Christmas Tree / Windage Dots (Horus / EBR style) */}
        {[2, 4, 6, 8, 10].map((dropMil) => {
          const y = center + dropMil * pxPerMil;
          return [-4, -2, 2, 4].map((windMil) => {
            const x = center + windMil * pxPerMil;
            return <circle key={`dot-${dropMil}-${windMil}`} cx={x} cy={y} r="1" fill="#4ade80" opacity="0.5" />;
          });
        })}

        {/* Active Impact Hold Indicator */}
        {impactY <= center + radius && (
          <g>
            {/* Pulsing Holdover Crosshair */}
            <circle cx={impactX} cy={impactY} r="6" stroke="#ef4444" strokeWidth="1.5" fill="rgba(239, 68, 68, 0.2)" />
            <line x1={impactX - 8} y1={impactY} x2={impactX + 8} y2={impactY} stroke="#ef4444" strokeWidth="1" />
            <line x1={impactX} y1={impactY - 8} x2={impactX} y2={impactY + 8} stroke="#ef4444" strokeWidth="1" />
          </g>
        )}
      </svg>

      {/* Scope Footer Readout */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginTop: '10px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          padding: '8px',
          borderRadius: '6px',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>TARGET: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{targetRangeYd} yds</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>ELEVATION: </span>
          <strong style={{ color: 'var(--accent-green)' }}>
            +{selectedStep.elevation_mil} MIL ({selectedStep.elevation_clicks} clk)
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>WINDAGE: </span>
          <strong style={{ color: 'var(--accent-cyan)' }}>
            {selectedStep.windage_mil > 0 ? `+${selectedStep.windage_mil}` : selectedStep.windage_mil} MIL ({selectedStep.windage_clicks} clk)
          </strong>
        </div>
      </div>
    </div>
  );
};
