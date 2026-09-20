# RangeStudio

[![License](https://img.shields.io/badge/license-Proprietary%20Freeware-blue.svg)](LICENSE)

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

---

## Precision Firearms Ecosystem

RangeStudio is engineered as part of the unified precision ballistics and firearms management ecosystem:

- **[ArmsTrader (armstrader.store)](https://armstrader.store)** — Free web tools and digital utilities suite for firearm owners (Firearm Bill of Sale Generator, Nationwide FFL Finder, Shooting Range Locator, and 50-State Gun Laws Directory). *Note: ArmsTrader is NOT a marketplace, broker, or dealer.*
- **[ArmoryVault](https://github.com/cook0001/armoryvault)** — High-performance desktop firearm inventory, ATF compliance & vault logistics suite.
- **[ArmoryVault Companion](https://github.com/cook0001/armoryvault-companion)** — Offline mobile firearm barcode scanner and encrypted LAN sync for Android.
- **[Wildcat Studio](https://github.com/cook0001/wildcat-studio)** — High-performance cartridge CAD, chamber reamer modeling & internal cutaway telemetry suite.
- **[LoadBench Studio](https://github.com/cook0001/loadbench)** — Industrial interior ballistics simulation, propellant combustion & chamber pressure modeling suite.

---

## License

RangeStudio is proprietary software provided free of charge for personal, non-commercial exterior ballistic modeling and trajectory calculation under the [RangeStudio End User License Agreement](LICENSE). All Rights Reserved. Reverse engineering, decompilation, unauthorized redistribution, or commercial use without prior written authorization is prohibited.

---

*Copyright © 2026 RangeStudio. All rights reserved.*
