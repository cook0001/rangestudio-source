import React from 'react';
import { TrajectoryResult, TurretUnit } from '../types/ballistics';
import { Download } from 'lucide-react';

interface TrajectoryTableProps {
  result: TrajectoryResult;
  selectedRangeYd: number;
  onSelectRange: (range: number) => void;
  turretUnit: TurretUnit;
  isMetric: boolean;
}

export const TrajectoryTable: React.FC<TrajectoryTableProps> = ({
  result,
  selectedRangeYd,
  onSelectRange,
  turretUnit,
  isMetric,
}) => {
  const handleExportCSV = () => {
    const headers = [
      'Range_yd',
      'Range_m',
      'Time_s',
      'Velocity_fps',
      'Mach',
      'Energy_ft_lbs',
      'Drop_in',
      'Elevation_MOA',
      'Elevation_MIL',
      'Elevation_Clicks',
      'Windage_in',
      'Windage_MIL',
      'Windage_Clicks',
      'Lead_in',
      'SpinDrift_in',
      'Sg',
    ];

    const rows = result.steps.map((s) => [
      s.range_yd,
      s.range_m,
      s.time_s.toFixed(4),
      s.velocity_fps,
      s.mach.toFixed(2),
      s.energy_ft_lbs,
      s.drop_in.toFixed(2),
      s.elevation_moa.toFixed(2),
      s.elevation_mil.toFixed(2),
      s.elevation_clicks,
      s.windage_in.toFixed(2),
      s.windage_mil.toFixed(2),
      s.windage_clicks,
      s.lead_in.toFixed(1),
      s.spin_drift_in.toFixed(2),
      s.sg_stability.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RangeStudio_DOPE_${result.zero_range_yd}yd_Zero.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-green)' }}>
            Downrange Trajectory &amp; DOPE Table
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Zero: <strong>{result.zero_range_yd} yds</strong> &bull; Transonic: <strong>{result.transonic_range_yd} yds</strong>
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-action"
          style={{ fontSize: '11px', cursor: 'pointer' }}
        >
          <Download size={13} />
          <span>Export DOPE CSV</span>
        </button>
      </div>

      {/* Table Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'right',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <thead>
            <tr
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '10px',
                textTransform: 'uppercase',
              }}
            >
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Range</th>
              <th style={{ padding: '8px 10px' }}>Velocity</th>
              <th style={{ padding: '8px 10px' }}>Mach</th>
              <th style={{ padding: '8px 10px' }}>Energy</th>
              <th style={{ padding: '8px 10px' }}>Drop (in)</th>
              <th style={{ padding: '8px 10px', color: 'var(--accent-green)' }}>
                Elev ({turretUnit})
              </th>
              <th style={{ padding: '8px 10px' }}>Clicks</th>
              <th style={{ padding: '8px 10px', color: 'var(--accent-cyan)' }}>
                Wind ({turretUnit})
              </th>
              <th style={{ padding: '8px 10px' }}>Lead</th>
              <th style={{ padding: '8px 10px' }}>Spin</th>
              <th style={{ padding: '8px 10px' }}>TOF</th>
            </tr>
          </thead>
          <tbody>
            {result.steps.map((step) => {
              const isSelected = step.range_yd === selectedRangeYd;
              const isZero = step.range_yd === result.zero_range_yd;
              const isTransonic = step.mach <= 1.2 && step.mach > 1.0;
              const isSubsonic = step.mach <= 1.0;

              return (
                <tr
                  key={step.range_yd}
                  onClick={() => onSelectRange(step.range_yd)}
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isZero
                      ? 'rgba(6, 182, 212, 0.08)'
                      : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <td style={{ padding: '6px 10px', textAlign: 'left', fontWeight: isSelected || isZero ? 700 : 400 }}>
                    {isMetric ? `${step.range_m} m` : `${step.range_yd} yd`}
                    {isZero && <span style={{ color: 'var(--accent-cyan)', fontSize: '9px', marginLeft: '4px' }}>[ZERO]</span>}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    {isMetric ? `${step.velocity_ms} m/s` : `${step.velocity_fps} fps`}
                  </td>
                  <td style={{ padding: '6px 10px', color: isSubsonic ? 'var(--accent-red)' : isTransonic ? 'var(--accent-amber)' : 'inherit' }}>
                    M {step.mach}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    {step.energy_ft_lbs} ft-lb
                  </td>
                  <td style={{ padding: '6px 10px', color: step.drop_in < 0 ? 'var(--text-secondary)' : 'inherit' }}>
                    {step.drop_in > 0 ? `+${step.drop_in}` : step.drop_in}"
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {turretUnit === 'MIL' ? `+${step.elevation_mil}` : `+${step.elevation_moa}`}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    {step.elevation_clicks}
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--accent-cyan)' }}>
                    {turretUnit === 'MIL' ? step.windage_mil : step.windage_moa}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    {step.lead_mil} MIL
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                    {step.spin_drift_in}"
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                    {step.time_s}s
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
