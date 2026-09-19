import { AtmosphereConditions } from '../types/ballistics';

/**
 * Standard ICAO constants
 */
export const ICAO_STANDARD_TEMP_F = 59.0;
export const ICAO_STANDARD_PRESSURE_IN_HG = 29.921;
export const ICAO_AIR_DENSITY_STD = 0.076474; // lb/cu ft at standard STP

/**
 * Computes air density (lb/cu ft), density altitude (ft), and speed of sound (fps)
 */
export function calculateAtmosphericProperties(conditions: AtmosphereConditions): {
  air_density_lb_cu_ft: number;
  density_ratio: number;
  density_altitude_ft: number;
  speed_of_sound_fps: number;
} {
  const tempF = conditions.temperature_f;
  const tempK = ((tempF - 32) * 5) / 9 + 273.15;
  const pressureInHg = conditions.pressure_in_hg;
  const humidity = Math.max(0, Math.min(100, conditions.humidity_pct)) / 100;

  // Saturation vapor pressure (inHg) via Tetens equation
  const tempC = ((tempF - 32) * 5) / 9;
  const satVaporPressureHPa = 6.1078 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC));
  const satVaporPressureInHg = satVaporPressureHPa * 0.02952998;
  const vaporPressureInHg = satVaporPressureInHg * humidity;

  // Dry air partial pressure
  const dryAirPressureInHg = Math.max(1, pressureInHg - 0.3783 * vaporPressureInHg);

  // Density using ideal gas law (lb / ft³)
  // rho = P / (R_specific * T)
  const pDryPascals = dryAirPressureInHg * 3386.389;
  const pVaporPascals = vaporPressureInHg * 3386.389;
  const rDry = 287.058; // J/(kg·K)
  const rVapor = 461.495; // J/(kg·K)

  const densityKgM3 = pDryPascals / (rDry * tempK) + pVaporPascals / (rVapor * tempK);
  const densityLbFt3 = densityKgM3 * 0.06242796;
  const densityRatio = densityLbFt3 / ICAO_AIR_DENSITY_STD;

  // Density Altitude Approximation (ft)
  // DA = 145366 * (1 - (densityRatio)^0.235)
  const densityAltitudeFt = Math.round(145366 * (1 - Math.pow(Math.max(0.01, densityRatio), 0.234969)));

  // Speed of sound in humid air (fps)
  // a = sqrt(gamma * R * T)
  const speedOfSoundFps = Math.round(Math.sqrt(1.4 * 287.058 * tempK) * 3.28084);

  return {
    air_density_lb_cu_ft: Number(densityLbFt3.toFixed(5)),
    density_ratio: Number(densityRatio.toFixed(4)),
    density_altitude_ft: densityAltitudeFt,
    speed_of_sound_fps: speedOfSoundFps,
  };
}
