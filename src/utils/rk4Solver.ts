import { AtmosphereConditions, BulletConfig, RifleOpticConfig, TargetParameters, TrajectoryResult, TrajectoryStep } from '../types/ballistics';
import { calculateAtmosphericProperties } from './atmosphereEngine';

/**
 * Standard G1 and G7 drag coefficient tables mapped against Mach numbers.
 */
const G1_DRAG_TABLE: [number, number][] = [
  [0.0, 0.2629], [0.2, 0.2541], [0.4, 0.2443], [0.6, 0.2335], [0.8, 0.2378],
  [0.9, 0.2655], [0.95, 0.3120], [1.0, 0.5100], [1.05, 0.6540], [1.1, 0.6931],
  [1.2, 0.6725], [1.3, 0.6386], [1.5, 0.5822], [1.8, 0.5182], [2.0, 0.4851],
  [2.2, 0.4579], [2.5, 0.4248], [3.0, 0.3800], [4.0, 0.3190], [5.0, 0.2780]
];

const G7_DRAG_TABLE: [number, number][] = [
  [0.0, 0.1198], [0.2, 0.1189], [0.4, 0.1170], [0.6, 0.1155], [0.8, 0.1180],
  [0.9, 0.1265], [0.95, 0.1495], [1.0, 0.3300], [1.05, 0.3950], [1.1, 0.4080],
  [1.2, 0.3990], [1.3, 0.3810], [1.5, 0.3450], [1.8, 0.3010], [2.0, 0.2790],
  [2.2, 0.2610], [2.5, 0.2390], [3.0, 0.2110], [4.0, 0.1740], [5.0, 0.1490]
];

function interpolateDragCoeff(table: [number, number][], mach: number): number {
  if (mach <= table[0][0]) return table[0][1];
  if (mach >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    const [m0, cd0] = table[i];
    const [m1, cd1] = table[i + 1];
    if (mach >= m0 && mach <= m1) {
      const frac = (mach - m0) / (m1 - m0);
      return cd0 + frac * (cd1 - cd0);
    }
  }
  return table[table.length - 1][1];
}

/**
 * Miller Rule Gyroscopic Stability Factor (Sg)
 */
export function calculateMillerSg(
  bulletWeightGr: number,
  bulletDiaIn: number,
  bulletLenIn: number,
  twistIn: number,
  velocityFps: number,
  densityRatio: number
): number {
  if (bulletDiaIn <= 0 || bulletLenIn <= 0 || twistIn <= 0) return 1.5;
  const calibersLength = bulletLenIn / bulletDiaIn;
  const t = twistIn / bulletDiaIn;
  // Miller standard formula
  const m = (30 * bulletWeightGr) / (Math.pow(t, 2) * Math.pow(bulletDiaIn, 3) * calibersLength * (1 + Math.pow(calibersLength, 2)));
  const velFactor = Math.pow(velocityFps / 2800, 1 / 3);
  const sgStp = m * velFactor;
  return Number((sgStp / Math.max(0.1, densityRatio)).toFixed(2));
}

/**
 * 4th-Order Runge-Kutta Point Mass Trajectory Solver
 */
export function solveRK4Trajectory(
  bullet: BulletConfig,
  optic: RifleOpticConfig,
  atmo: AtmosphereConditions,
  target: TargetParameters,
  maxRangeYards: number = 1000,
  stepYards: number = 25
): TrajectoryResult {
  const atmoProps = calculateAtmosphericProperties(atmo);
  const dragTable = bullet.drag_model === 'G7' ? G7_DRAG_TABLE : G1_DRAG_TABLE;
  const bc = Math.max(0.05, bullet.bc_value);
  const v0 = bullet.muzzle_velocity_fps;
  const sightHeightFt = optic.sight_height_in / 12.0;
  const speedOfSound = atmoProps.speed_of_sound_fps;
  const g = 32.174; // ft/s^2

  // Miller gyroscopic stability factor
  const sg = calculateMillerSg(
    bullet.weight_grains,
    bullet.diameter_in,
    bullet.length_in,
    optic.barrel_twist_in,
    v0,
    atmoProps.density_ratio
  );

  // Crosswind component (fps)
  const windAngleRad = ((target.wind_clock_dir * 30) * Math.PI) / 180;
  const crosswindFps = (target.wind_speed_mph * 1.46667) * Math.sin(windAngleRad);

  // Moving target component (mph to fps)
  const targetDirSign = target.target_direction === 'right_to_left' ? -1 : 1;
  const targetFps = target.target_speed_mph * 1.46667 * targetDirSign;

  // Zero bore angle calculation via flat-fire approximation to find bore theta
  const zeroDistanceFt = optic.zero_range_yd * 3.0;
  const approxFlightTime = zeroDistanceFt / v0;
  const zeroBoreAngleRad = Math.atan((sightHeightFt + 0.5 * g * Math.pow(approxFlightTime, 2)) / zeroDistanceFt);

  // Ballistic coefficient scale factor: F_drag = 0.5 * rho * v^2 * A * Cd / BC_standard
  const massLb = bullet.weight_grains / 7000.0;
  const areaSqFt = (Math.PI * Math.pow(bullet.diameter_in / 24.0, 2));

  // RK4 Integration state: [x (ft), y (ft), vx (ft/s), vy (ft/s), t (s)]
  let x = 0;
  let y = -sightHeightFt;
  let vx = v0 * Math.cos(zeroBoreAngleRad);
  let vy = v0 * Math.sin(zeroBoreAngleRad);
  let t = 0;

  const steps: TrajectoryStep[] = [];
  const dt = 0.001; // 1 ms RK4 integration timestep
  let nextRecordYard = 0;

  let transonicRange = maxRangeYards;
  let subsonicRange = maxRangeYards;
  let recordedTransonic = false;
  let recordedSubsonic = false;

  while (x <= maxRangeYards * 3.0 && t < 5.0) {
    const currentYard = x / 3.0;

    if (currentYard >= nextRecordYard - 0.5) {
      const v = Math.sqrt(vx * vx + vy * vy);
      const mach = v / speedOfSound;
      const dropInches = y * 12.0;

      // Angles relative to line of sight (LOS)
      const rangeYd = Math.round(currentYard);
      const rangeM = Math.round(rangeYd * 0.9144);
      const elevMoa = rangeYd > 0 ? Number((-dropInches / (rangeYd * 0.01047)).toFixed(2)) : 0;
      const elevMil = rangeYd > 0 ? Number((-dropInches / (rangeYd * 0.036)).toFixed(2)) : 0;
      const elevClicks = optic.click_unit === 'MIL' ? Math.round(elevMil / optic.click_value) : Math.round(elevMoa / optic.click_value);

      // Wind drift via Didion / standard crosswind
      // Delay = t - x / v0
      const delaySec = Math.max(0, t - x / v0);
      const windDriftFt = crosswindFps * delaySec;
      const windDriftInches = windDriftFt * 12.0;
      const windMoa = rangeYd > 0 ? Number((windDriftInches / (rangeYd * 0.01047)).toFixed(2)) : 0;
      const windMil = rangeYd > 0 ? Number((windDriftInches / (rangeYd * 0.036)).toFixed(2)) : 0;
      const windClicks = optic.click_unit === 'MIL' ? Math.round(windMil / optic.click_value) : Math.round(windMoa / optic.click_value);

      // Spin Drift (Bryan Litz formula)
      // Z_spin (in) = 1.25 * (Sg + 1.2) * t^1.83 (for right-hand twist)
      const spinSign = optic.twist_direction === 'left' ? -1 : 1;
      const spinDriftIn = Number((spinSign * 1.25 * (sg + 1.2) * Math.pow(t, 1.83)).toFixed(2));
      const spinDriftMil = rangeYd > 0 ? Number((spinDriftIn / (rangeYd * 0.036)).toFixed(2)) : 0;

      // Moving target lead
      const leadInches = Number((targetFps * t * 12.0).toFixed(1));
      const leadMil = rangeYd > 0 ? Number((leadInches / (rangeYd * 0.036)).toFixed(2)) : 0;

      // Energy
      const energy = Math.round((massLb * v * v) / (2 * g));

      steps.push({
        range_yd: rangeYd,
        range_m: rangeM,
        time_s: Number(t.toFixed(4)),
        velocity_fps: Math.round(v),
        velocity_ms: Math.round(v * 0.3048),
        mach: Number(mach.toFixed(2)),
        energy_ft_lbs: energy,
        drop_in: Number(dropInches.toFixed(2)),
        elevation_moa: elevMoa,
        elevation_mil: elevMil,
        elevation_clicks: elevClicks,
        windage_in: Number(windDriftInches.toFixed(2)),
        windage_moa: windMoa,
        windage_mil: windMil,
        windage_clicks: windClicks,
        lead_in: leadInches,
        lead_mil: leadMil,
        spin_drift_in: spinDriftIn,
        spin_drift_mil: spinDriftMil,
        sg_stability: sg,
      });

      if (!recordedTransonic && mach <= 1.2) {
        transonicRange = rangeYd;
        recordedTransonic = true;
      }
      if (!recordedSubsonic && mach <= 1.0) {
        subsonicRange = rangeYd;
        recordedSubsonic = true;
      }

      nextRecordYard += stepYards;
    }

    // RK4 Integration Derivatives
    // ax = - (F_drag / m) * (vx / v)
    // ay = - g - (F_drag / m) * (vy / v)
    const computeDerivs = (_vx: number, _vy: number) => {
      const v = Math.sqrt(_vx * _vx + _vy * _vy);
      const mach = v / speedOfSound;
      const cd = interpolateDragCoeff(dragTable, mach);
      // Drag acceleration: (rho * area * cd * v^2) / (2 * mass * bc)
      const aDrag = (0.5 * atmoProps.air_density_lb_cu_ft * areaSqFt * cd * v * v) / (massLb * bc * 32.174);
      return {
        dx: _vx,
        dy: _vy,
        dvx: -aDrag * (_vx / v),
        dvy: -g - aDrag * (_vy / v),
      };
    };

    // RK4 k1, k2, k3, k4
    const k1 = computeDerivs(vx, vy);
    const k2 = computeDerivs(vx + 0.5 * dt * k1.dvx, vy + 0.5 * dt * k1.dvy);
    const k3 = computeDerivs(vx + 0.5 * dt * k2.dvx, vy + 0.5 * dt * k2.dvy);
    const k4 = computeDerivs(vx + dt * k3.dvx, vy + dt * k3.dvy);

    x += (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
    y += (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);
    vx += (dt / 6) * (k1.dvx + 2 * k2.dvx + 2 * k3.dvx + k4.dvx);
    vy += (dt / 6) * (k1.dvy + 2 * k2.dvy + 2 * k3.dvy + k4.dvy);
    t += dt;
  }

  // Calculate Maximum Point Blank Range (MPBR for 6" vital zone)
  let mpbrYd = 250;
  for (const s of steps) {
    if (s.drop_in < -3.0) {
      mpbrYd = s.range_yd;
      break;
    }
  }

  return {
    steps,
    zero_range_yd: optic.zero_range_yd,
    mpbr_yd: mpbrYd,
    transonic_range_yd: transonicRange,
    subsonic_range_yd: subsonicRange,
    density_altitude_ft: atmoProps.density_altitude_ft,
  };
}
