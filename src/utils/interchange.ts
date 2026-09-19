import { BulletConfig, RifleOpticConfig } from '../types/ballistics';

export interface IngestedRecipe {
  bullet: Partial<BulletConfig>;
  optic: Partial<RifleOpticConfig>;
  source_format: 'loadbench' | 'wildcat' | 'generic_json';
  raw_title: string;
}

/**
 * Ingests a native LoadBench recipe (.loadbench / .ldb) or Wildcat Studio profile (.wildcat / .wcs)
 */
export function ingestBallisticsPayload(jsonContent: string): IngestedRecipe | null {
  try {
    const data = JSON.parse(jsonContent);
    if (!data || typeof data !== 'object') return null;

    // 1. LoadBench recipe (.loadbench / .ldb)
    if (data.format === 'loadbench_recipe' || (data.cartridge && data.projectile && data.performance)) {
      const proj = data.projectile || {};
      const cart = data.cartridge || {};
      const perf = data.performance || {};
      const dims = data.dimensions || {};
      const meta = data.metadata || {};

      const hasG7 = typeof proj.bc_g7 === 'number' && proj.bc_g7 > 0;
      const bc = hasG7 ? proj.bc_g7 : (proj.bc_g1 || 0.500);
      const dragModel = hasG7 ? 'G7' : 'G1';

      return {
        source_format: 'loadbench',
        raw_title: meta.recipe_title || `${cart.name} Load`,
        bullet: {
          caliber_name: cart.name || '6.5 Creedmoor',
          bullet_name: proj.name || 'Match Projectile',
          weight_grains: proj.weight_grains || 140,
          diameter_in: cart.bullet_diameter_in || proj.caliber_in || 0.2644,
          length_in: proj.length_in || 1.35,
          muzzle_velocity_fps: perf.muzzle_velocity_fps || 2700,
          bc_value: bc,
          drag_model: dragModel,
        },
        optic: {
          rifle_name: meta.target_firearm || 'Precision Bolt Action',
          barrel_twist_in: dims.barrel_twist_in || 8.0,
        },
      };
    }

    // 2. Wildcat Studio Cartridge (.wildcat / .wcs)
    if (data.format === 'wildcat_cartridge_specification' || (data.dimensions && data.volumetrics)) {
      const meta = data.metadata || {};
      const dims = data.dimensions || {};
      const vol = data.volumetrics || {};

      return {
        source_format: 'wildcat',
        raw_title: meta.name || 'Custom Wildcat',
        bullet: {
          caliber_name: meta.name || 'Custom Wildcat',
          bullet_name: 'Engineered Projectile',
          weight_grains: dims.bullet_weight_grains || 140,
          diameter_in: dims.bullet_diameter_in || dims.bullet_diameter || 0.264,
          length_in: dims.bullet_length_in || dims.bullet_length || 1.30,
          muzzle_velocity_fps: 2750, // nominal baseline
          bc_value: vol.g1_bc_est || 0.500,
          drag_model: 'G1',
        },
        optic: {
          rifle_name: `${meta.name} Custom Rifle`,
          barrel_twist_in: 8.0,
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}
