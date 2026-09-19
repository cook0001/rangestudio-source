export type DragModel = 'G1' | 'G7';

export type TurretUnit = 'MIL' | 'MOA' | 'IPHY';

export type FocalPlane = 'FFP' | 'SFP';

export interface AtmosphereConditions {
  temperature_f: number;
  pressure_in_hg: number;
  altitude_ft: number;
  humidity_pct: number;
  density_altitude_ft?: number;
  speed_of_sound_fps?: number;
  air_density_lb_cu_ft?: number;
}

export interface RifleOpticConfig {
  rifle_name: string;
  optic_name: string;
  sight_height_in: number;
  zero_range_yd: number;
  barrel_twist_in: number;
  twist_direction: 'right' | 'left';
  click_value: number; // e.g. 0.1 for MIL, 0.25 for MOA
  click_unit: TurretUnit;
  focal_plane: FocalPlane;
  reticle_type: 'mil_dot' | 'ebr_7c' | 'tremor_3' | 'bdc';
  min_magnification: number;
  max_magnification: number;
  current_magnification: number;
}

export interface BulletConfig {
  caliber_name: string;
  bullet_name: string;
  weight_grains: number;
  diameter_in: number;
  length_in: number;
  muzzle_velocity_fps: number;
  bc_value: number;
  drag_model: DragModel;
  temp_sensitivity_fps_per_f?: number;
}

export interface TargetParameters {
  range_yd: number;
  incline_deg: number;
  wind_speed_mph: number;
  wind_clock_dir: number; // 1 to 12 o'clock
  target_speed_mph: number; // moving target
  target_direction: 'left_to_right' | 'right_to_left' | 'stationary';
}

export interface TrajectoryStep {
  range_yd: number;
  range_m: number;
  time_s: number;
  velocity_fps: number;
  velocity_ms: number;
  mach: number;
  energy_ft_lbs: number;
  drop_in: number;
  elevation_moa: number;
  elevation_mil: number;
  elevation_clicks: number;
  windage_in: number;
  windage_moa: number;
  windage_mil: number;
  windage_clicks: number;
  lead_in: number;
  lead_mil: number;
  spin_drift_in: number;
  spin_drift_mil: number;
  sg_stability: number;
}

export interface TrajectoryResult {
  steps: TrajectoryStep[];
  zero_range_yd: number;
  mpbr_yd: number; // Maximum point blank range
  transonic_range_yd: number; // range where Mach <= 1.2
  subsonic_range_yd: number; // range where Mach <= 1.0
  density_altitude_ft: number;
}
