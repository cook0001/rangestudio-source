import React, { useRef } from 'react';
import { X, Printer, Compass } from 'lucide-react';
import { AtmosphereConditions, BulletConfig, RifleOpticConfig, TrajectoryResult, TurretUnit } from '../types/ballistics';

interface DopeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TrajectoryResult;
  bullet: BulletConfig;
  optic: RifleOpticConfig;
  atmo: AtmosphereConditions;
  turretUnit: TurretUnit;
}

export const DopeCardModal: React.FC<DopeCardModalProps> = ({
  isOpen,
  onClose,
  result,
  bullet,
  optic,
  atmo,
  turretUnit,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '95vw' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} color="var(--accent-green)" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              Printable Armband / Stock DOPE Card (3" &times; 5")
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Physical Printable Card Canvas */}
          <div
            ref={cardRef}
            style={{
              width: '320px',
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #000000',
              fontFamily: 'monospace',
              fontSize: '10px',
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #000000', paddingBottom: '4px', marginBottom: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
                {optic.rifle_name || 'PRECISION RIFLE'}
              </div>
              <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{bullet.caliber_name} &bull; {bullet.weight_grains}gr {bullet.bullet_name}</span>
                <span>{bullet.muzzle_velocity_fps} fps</span>
              </div>
              <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', color: '#444' }}>
                <span>ZERO: {optic.zero_range_yd} yd &bull; DA: {result.density_altitude_ft} ft</span>
                <span>TEMP: {atmo.temperature_f}&deg;F</span>
              </div>
            </div>

            {/* DOPE Table Grid */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', textTransform: 'uppercase', fontSize: '8px' }}>
                  <th style={{ textAlign: 'left', padding: '2px 4px' }}>Range</th>
                  <th style={{ padding: '2px 4px' }}>Elev ({turretUnit})</th>
                  <th style={{ padding: '2px 4px' }}>10mph Wind</th>
                  <th style={{ padding: '2px 4px' }}>V (fps)</th>
                  <th style={{ padding: '2px 4px' }}>TOF</th>
                </tr>
              </thead>
              <tbody>
                {result.steps
                  .filter((s) => s.range_yd >= 100 && s.range_yd <= 1000 && s.range_yd % 50 === 0)
                  .map((s) => (
                    <tr
                      key={s.range_yd}
                      style={{
                        borderBottom: '1px dotted #ccc',
                        backgroundColor: s.range_yd === optic.zero_range_yd ? '#eee' : 'transparent',
                      }}
                    >
                      <td style={{ textAlign: 'left', fontWeight: 700, padding: '2px 4px' }}>
                        {s.range_yd} yd
                      </td>
                      <td style={{ fontWeight: 700, padding: '2px 4px' }}>
                        +{turretUnit === 'MIL' ? s.elevation_mil : s.elevation_moa}
                      </td>
                      <td style={{ padding: '2px 4px' }}>
                        {turretUnit === 'MIL' ? s.windage_mil : s.windage_moa}
                      </td>
                      <td style={{ padding: '2px 4px' }}>{s.velocity_fps}</td>
                      <td style={{ padding: '2px 4px' }}>{s.time_s.toFixed(2)}s</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #000', fontSize: '8px', textAlign: 'center' }}>
              RangeStudio Exterior Ballistics &bull; 100% Offline DOPE
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-action">Close</button>
          <button onClick={handlePrint} className="btn-primary">
            <Printer size={13} />
            <span>Print DOPE Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
