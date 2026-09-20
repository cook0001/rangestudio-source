# Changelog

All notable changes to **RangeStudio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Proprietary Freeware License & Distribution Alignment (`package.json`, `README.md`, `LICENSE`)**:
  - Formalized proprietary free-to-use licensing model under the RangeStudio End User License Agreement.
  - Updated `package.json` to `"license": "SEE LICENSE IN LICENSE"`.
  - Added Proprietary Freeware badge and comprehensive License section to `README.md`.
  - Established dedicated public binary release repository at [`cook0001/rangestudio`](https://github.com/cook0001/rangestudio) for pre-compiled standalone installers, SHA-256 checksums, and CI release verification.
  - Clarified in documentation that `armstrader.store` is a free digital utilities suite for firearm owners, not a marketplace.
  - Aligned binary release distribution references to `https://armstrader.store`.
- **4th-Order Runge-Kutta (RK4) Point-Mass Trajectory Solver (`rk4Solver.ts`)**:
  - High-precision numerical point-mass ODE integration at 1 ms timesteps ($dt = 0.001\text{ s}$).
  - G1 and G7 standard supersonic, transonic, and subsonic drag function tables with dynamic Mach interpolation.
  - Miller Rule gyroscopic stability factor ($S_g$) calculation.
  - Bryan Litz spin drift formula ($Z_{\text{spin}} = 1.25 \times (S_g + 1.2) \times t^{1.83}$).
  - Maximum Point Blank Range (MPBR) calculator across a 6-inch vital zone.
- **Atmospheric Physics & Density Altitude Engine (`atmosphereEngine.ts`)**:
  - Full Tetens saturation vapor pressure and virtual temperature modeling.
  - Real-time density altitude (DA) and speed of sound calculations based on station pressure, temperature, and humidity.
- **Interactive Vector Optical Reticle HUD (`ReticleCanvas.tsx`)**:
  - Vector optical scope simulator with FFP (First Focal Plane) and SFP (Second Focal Plane) zoom scaling.
  - Dynamic bullet drop compensation (BDC) and windage holdover dot mapping.
  - Crosswind tick marks and moving target lead stadia.
  - Zero raw emojis across all components and overlays.
- **Precision DOPE Table (`TrajectoryTable.tsx`)**:
  - 1000-yard detailed firing solution chart with 1-click CSV download.
  - Displays yardage, velocity, Mach number, kinetic energy, drop, turret elevation clicks, windage deflection, and spin drift.
- **Native Interchange & Ingestion Bridge (`interchange.ts`, `ImportLoadBenchModal.tsx`)**:
  - Direct ingestion of LoadBench recipes (`.loadbench` / `.ldb`) and Wildcat Studio cartridge specifications (`.wildcat` / `.wcs`).
  - Native `.range` / `.rng` file export matching `application/vnd.rangestudio.ballistics+json`.
- **Printable 3" &times; 5" Field Armband DOPE Card (`DopeCardModal.tsx`)**:
  - High-contrast, printer-friendly wrist-coach and rifle-stock DOPE chart generator with zero emoji placeholders.
