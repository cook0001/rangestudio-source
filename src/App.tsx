import React, { useState, useMemo } from 'react';
import { 
  Crosshair, 
  Thermometer, 
  Sliders, 
  Compass, 
  FileUp, 
  Save, 
  Printer, 
  Target 
} from 'lucide-react';
import { 
  AtmosphereConditions, 
  BulletConfig, 
  RifleOpticConfig, 
  TargetParameters, 
  TurretUnit 
} from './types/ballistics';
import { solveRK4Trajectory } from './utils/rk4Solver';
import { calculateAtmosphericProperties } from './utils/atmosphereEngine';
import { ReticleCanvas } from './components/ReticleCanvas';
import { TrajectoryTable } from './components/TrajectoryTable';
import { ImportLoadBenchModal } from './components/ImportLoadBenchModal';
import { DopeCardModal } from './components/DopeCardModal';
import { IngestedRecipe } from './utils/interchange';

export const App: React.FC = () => {
  // 1. Bullet & Ballistics State
  const [bullet, setBullet] = useState<BulletConfig>({
    caliber_name: '6.5 Creedmoor',
    bullet_name: '140 gr ELD-Match',
    weight_grains: 140,
    diameter_in: 0.2644,
    length_in: 1.38,
    muzzle_velocity_fps: 2710,
    bc_value: 0.326,
    drag_model: 'G7',
    temp_sensitivity_fps_per_f: 0.5,
  });

  // 2. Rifle & Optic State
  const [optic, setOptic] = useState<RifleOpticConfig>({
    rifle_name: 'Tikka T3x TAC A1',
    optic_name: 'Razor HD Gen II 4.5-27x56',
    sight_height_in: 1.75,
    zero_range_yd: 100,
    barrel_twist_in: 8.0,
    twist_direction: 'right',
    click_value: 0.1,
    click_unit: 'MIL',
    focal_plane: 'FFP',
    reticle_type: 'ebr_7c',
    min_magnification: 4.5,
    max_magnification: 27.0,
    current_magnification: 15.0,
  });

  // 3. Atmosphere State
  const [atmo, setAtmo] = useState<AtmosphereConditions>({
    temperature_f: 59,
    pressure_in_hg: 29.92,
    altitude_ft: 1000,
    humidity_pct: 50,
  });

  // 4. Target & Engagement Parameters
  const [target, setTarget] = useState<TargetParameters>({
    range_yd: 500,
    incline_deg: 0,
    wind_speed_mph: 10,
    wind_clock_dir: 9, // 9 o'clock full crosswind from left
    target_speed_mph: 0,
    target_direction: 'stationary',
  });

  const [turretUnit, setTurretUnit] = useState<TurretUnit>('MIL');
  const [isMetric, setIsMetric] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isDopeCardOpen, setIsDopeCardOpen] = useState<boolean>(false);

  // Trajectory Simulation via 4th-Order Runge-Kutta
  const trajectoryResult = useMemo(() => {
    return solveRK4Trajectory(bullet, optic, atmo, target, 1000, 25);
  }, [bullet, optic, atmo, target]);

  // Selected trajectory point for reticle HUD
  const selectedStep = useMemo(() => {
    return (
      trajectoryResult.steps.find((s) => s.range_yd === target.range_yd) ||
      trajectoryResult.steps[trajectoryResult.steps.length - 1]
    );
  }, [trajectoryResult, target.range_yd]);

  // Live atmosphere properties
  const atmoProps = useMemo(() => {
    return calculateAtmosphericProperties(atmo);
  }, [atmo]);

  // Handle LoadBench recipe ingestion
  const handleIngestRecipe = (recipe: IngestedRecipe) => {
    setBullet((prev) => ({ ...prev, ...recipe.bullet }));
    setOptic((prev) => ({ ...prev, ...recipe.optic }));
  };

  // Export .range profile
  const handleSaveProfile = () => {
    const payload = {
      $schema: 'https://armstrader.store/schemas/rangestudio-profile-v1.json',
      format: 'rangestudio_profile',
      version: '1.0.0',
      metadata: {
        profile_name: `${bullet.caliber_name} - ${bullet.weight_grains}gr DOPE`,
        shooter: 'Range Ballistician',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      rifle_optic: optic,
      bullet,
      atmosphere: atmo,
      target_defaults: target,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/vnd.rangestudio.ballistics+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bullet.caliber_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${bullet.weight_grains}gr.range`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crosshair size={22} color="var(--accent-green)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.5px' }}>
              Range<span style={{ color: 'var(--accent-green)' }}>Studio</span>
            </div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Exterior Ballistics &amp; Optical HUD
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn-action"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <FileUp size={13} />
            <span>Import Recipe (.loadbench)</span>
          </button>

          <button
            onClick={() => setIsDopeCardOpen(true)}
            className="btn-action"
            style={{ color: 'var(--accent-green)' }}
          >
            <Printer size={13} />
            <span>Print DOPE Card (3"&times;5")</span>
          </button>

          <button onClick={handleSaveProfile} className="btn-action">
            <Save size={13} />
            <span>Save Profile (.range)</span>
          </button>

          <button
            onClick={() => {
              setTurretUnit((prev) => (prev === 'MIL' ? 'MOA' : 'MIL'));
              setOptic((prev) => ({
                ...prev,
                click_unit: prev.click_unit === 'MIL' ? 'MOA' : 'MIL',
                click_value: prev.click_unit === 'MIL' ? 0.25 : 0.1,
              }));
            }}
            className="btn-action"
          >
            <span>Unit: {turretUnit}</span>
          </button>

          <button
            onClick={() => setIsMetric((prev) => !prev)}
            className="btn-action"
          >
            <span>{isMetric ? 'Metric (m)' : 'Imperial (yd)'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="app-main">
        {/* Left Side: Parameters Panel */}
        <section className="left-panel">
          {/* Deck 1: Target & Wind Engagement */}
          <div className="deck-card">
            <div className="deck-header">
              <span className="deck-title">
                <Target size={14} /> Engagement Target &amp; Wind
              </span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700 }}>
                {target.range_yd} yds
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label">Target Range (yds)</label>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{target.range_yd} yd</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={target.range_yd}
                  onChange={(e) => setTarget({ ...target, range_yd: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', accentColor: 'var(--accent-green)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="input-label">Crosswind Speed (mph)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={target.wind_speed_mph}
                    onChange={(e) => setTarget({ ...target, wind_speed_mph: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="input-label">Wind Direction (Clock)</label>
                  <select
                    className="input-control"
                    value={target.wind_clock_dir}
                    onChange={(e) => setTarget({ ...target, wind_clock_dir: parseInt(e.target.value, 10) })}
                  >
                    <option value="12">12 o'clock (Headwind)</option>
                    <option value="1">1 o'clock</option>
                    <option value="2">2 o'clock</option>
                    <option value="3">3 o'clock (Full Crosswind R&rarr;L)</option>
                    <option value="6">6 o'clock (Tailwind)</option>
                    <option value="9">9 o'clock (Full Crosswind L&rarr;R)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="input-label">Incline Angle (&deg;)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={target.incline_deg}
                    onChange={(e) => setTarget({ ...target, incline_deg: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="input-label">Target Speed (mph)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={target.target_speed_mph}
                    onChange={(e) => setTarget({ ...target, target_speed_mph: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deck 2: Bullet & Ballistics */}
          <div className="deck-card">
            <div className="deck-header">
              <span className="deck-title">
                <Compass size={14} /> Projectile &amp; Aerodynamics
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Sg: <strong style={{ color: selectedStep.sg_stability >= 1.4 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{selectedStep.sg_stability}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                <div>
                  <label className="input-label">Caliber / Cartridge</label>
                  <input
                    type="text"
                    className="input-control"
                    value={bullet.caliber_name}
                    onChange={(e) => setBullet({ ...bullet, caliber_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Muzzle Velocity (fps)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={bullet.muzzle_velocity_fps}
                    onChange={(e) => setBullet({ ...bullet, muzzle_velocity_fps: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: '8px' }}>
                <div>
                  <label className="input-label">Bullet Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={bullet.bullet_name}
                    onChange={(e) => setBullet({ ...bullet, bullet_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Weight (gr)</label>
                  <input
                    type="number"
                    className="input-control"
                    value={bullet.weight_grains}
                    onChange={(e) => setBullet({ ...bullet, weight_grains: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="input-label">Diameter (in)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="input-control"
                    value={bullet.diameter_in}
                    onChange={(e) => setBullet({ ...bullet, diameter_in: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="input-label">Drag Model</label>
                  <select
                    className="input-control"
                    value={bullet.drag_model}
                    onChange={(e) => setBullet({ ...bullet, drag_model: e.target.value as 'G1' | 'G7' })}
                  >
                    <option value="G7">G7 (Boat-tail Match)</option>
                    <option value="G1">G1 (Flat Base / Standard)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Ballistic Coeff (BC)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="input-control"
                    value={bullet.bc_value}
                    onChange={(e) => setBullet({ ...bullet, bc_value: parseFloat(e.target.value) || 0.1 })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deck 3: Optic & Rifle */}
          <div className="deck-card">
            <div className="deck-header">
              <span className="deck-title">
                <Sliders size={14} /> Rifle &amp; Optic Setup
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Zero: <strong>{optic.zero_range_yd} yd</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <label className="input-label">Sight Height (in)</label>
                <input
                  type="number"
                  step="0.05"
                  className="input-control"
                  value={optic.sight_height_in}
                  onChange={(e) => setOptic({ ...optic, sight_height_in: parseFloat(e.target.value) || 1.5 })}
                />
              </div>

              <div>
                <label className="input-label">Zero Range (yd)</label>
                <input
                  type="number"
                  className="input-control"
                  value={optic.zero_range_yd}
                  onChange={(e) => setOptic({ ...optic, zero_range_yd: parseInt(e.target.value, 10) || 100 })}
                />
              </div>

              <div>
                <label className="input-label">Twist Rate (1:X")</label>
                <input
                  type="number"
                  step="0.5"
                  className="input-control"
                  value={optic.barrel_twist_in}
                  onChange={(e) => setOptic({ ...optic, barrel_twist_in: parseFloat(e.target.value) || 8.0 })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '10px' }}>
              <div>
                <label className="input-label">Focal Plane</label>
                <select
                  className="input-control"
                  value={optic.focal_plane}
                  onChange={(e) => setOptic({ ...optic, focal_plane: e.target.value as 'FFP' | 'SFP' })}
                >
                  <option value="FFP">FFP (First Focal Plane)</option>
                  <option value="SFP">SFP (Second Focal Plane)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Zoom Power ({optic.current_magnification}x)</label>
                <input
                  type="range"
                  min={optic.min_magnification}
                  max={optic.max_magnification}
                  step="0.5"
                  value={optic.current_magnification}
                  onChange={(e) => setOptic({ ...optic, current_magnification: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-green)', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Deck 4: Atmospheric Environment */}
          <div className="deck-card">
            <div className="deck-header">
              <span className="deck-title">
                <Thermometer size={14} /> Atmosphere &amp; Density Altitude
              </span>
              <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                DA: {atmoProps.density_altitude_ft} ft
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div>
                <label className="input-label">Temp (&deg;F)</label>
                <input
                  type="number"
                  className="input-control"
                  value={atmo.temperature_f}
                  onChange={(e) => setAtmo({ ...atmo, temperature_f: parseFloat(e.target.value) || 59 })}
                />
              </div>

              <div>
                <label className="input-label">Baro (inHg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-control"
                  value={atmo.pressure_in_hg}
                  onChange={(e) => setAtmo({ ...atmo, pressure_in_hg: parseFloat(e.target.value) || 29.92 })}
                />
              </div>

              <div>
                <label className="input-label">Humidity (%)</label>
                <input
                  type="number"
                  className="input-control"
                  value={atmo.humidity_pct}
                  onChange={(e) => setAtmo({ ...atmo, humidity_pct: parseInt(e.target.value, 10) || 50 })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Visual Reticle HUD & Trajectory DOPE Chart */}
        <section className="right-panel">
          <div style={{ padding: '12px 16px', display: 'flex', gap: '14px', flex: 1, overflow: 'hidden' }}>
            {/* Reticle HUD Scope */}
            <ReticleCanvas
              optic={optic}
              selectedStep={selectedStep}
              targetRangeYd={target.range_yd}
            />

            {/* Trajectory Table */}
            <TrajectoryTable
              result={trajectoryResult}
              selectedRangeYd={target.range_yd}
              onSelectRange={(range) => setTarget((prev) => ({ ...prev, range_yd: range }))}
              turretUnit={turretUnit}
              isMetric={isMetric}
            />
          </div>
        </section>
      </main>

      {/* Modals */}
      <ImportLoadBenchModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onIngest={handleIngestRecipe}
      />

      <DopeCardModal
        isOpen={isDopeCardOpen}
        onClose={() => setIsDopeCardOpen(false)}
        result={trajectoryResult}
        bullet={bullet}
        optic={optic}
        atmo={atmo}
        turretUnit={turretUnit}
      />
    </div>
  );
};
