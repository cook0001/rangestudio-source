# RangeStudio

> **Modern Exterior Ballistics, Precision Trajectory Engine & Optical Reticle Simulator**

Part of the ArmoryVault precision ballistics and cartridge development suite:
- **Wildcat Studio** — Cartridge CAD & Chamber Dimensions (`.wildcat`)
- **LoadBench** — Interior Ballistics, Propellant Combustion & Chamber Dynamics (`.loadbench`)
- **RangeStudio** — Exterior Ballistics, Atmospheric Physics, Optical Reticles & Field DOPE (`.range`)
- **ArmoryVault** — Firearm & Component Logistics, ATF Compliance & Vault Inventory

---

## Capabilities

1. **Precision Trajectory Solver**: 4th-order Runge-Kutta (RK4) point-mass differential equations solver supporting $G_1$, $G_7$, and custom drag curves.
2. **Comprehensive 3D Aerodynamics**:
   - Gyroscopic stability factor ($S_g$) using Miller twist formulation
   - Bryan Litz gyroscopic spin drift modeling
   - Aerodynamic jump from crosswinds
   - Coriolis acceleration and Eötvös effect calculated from shooter latitude and firing azimuth
   - Maximum Point Blank Range (MPBR) calculator with customizable vital zone diameter
   - Incline shooting (Rifleman's Rule and Sierra/Litz Improved Cosine methods)
3. **Atmospheric Modeling**:
   - ICAO and Army Standard Metro models
   - Real-time Density Altitude (DA) engine calculating station pressure, temperature, vapor pressure, and speed of sound
   - Propellant thermal sensitivity velocity corrections ($\Delta \text{fps} / ^\circ\text{F}$)
4. **Interactive Optical Reticle HUD**:
   - Vector scope simulator with First Focal Plane (FFP) and Second Focal Plane (SFP) zoom scaling
   - Reticle library: Mil-Dot, Horus Tremor3 / H59, Vortex EBR-7C, BDC
   - Turret click solutions in 1/4 MOA, 1/2 MOA, 0.1 MIL / MRAD
   - Moving target leads with crossing angles
5. **Printable Field DOPE Cards**:
   - Wrist Coach / Armband Cards (3" × 5")
   - Rifle Stock Drop Cards
   - Benchrest Multi-Wind Matrix (5, 10, 15, 20 mph)
   - Temperature Ladder Matrix

---

## File Format: `.range` / `.rng`

RangeStudio uses the open, structured JSON format with MIME type `application/vnd.rangestudio.ballistics+json`:

```json
{
  "format": "rangestudio_profile",
  "version": "1.0.0",
  "metadata": {
    "name": "6.5 Creedmoor PRS Match Load",
    "shooter": "Daniel C.",
    "rifle_name": "Tikka T3x TAC A1",
    "optic_name": "Vortex Razor HD Gen II 4.5-27x56"
  }
}
```

Natively ingests `.loadbench` / `.ldb` recipes from LoadBench and `.wildcat` / `.wcs` profiles from Wildcat Studio.
