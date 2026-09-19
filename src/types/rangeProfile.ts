import { AtmosphereConditions, BulletConfig, RifleOpticConfig, TargetParameters } from './ballistics';

export interface RangeStudioProfile {
  $schema: string;
  format: 'rangestudio_profile';
  version: '1.0.0';
  metadata: {
    profile_name: string;
    shooter: string;
    created_at: string;
    updated_at: string;
    notes?: string;
  };
  rifle_optic: RifleOpticConfig;
  bullet: BulletConfig;
  atmosphere: AtmosphereConditions;
  target_defaults: TargetParameters;
}
