# Security Policy

## Supported Versions

RangeStudio is actively maintained. Security updates and critical hotfixes are provided for the following versions:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **1.0.x** | :white_check_mark: Yes | Current production release |
| **< 1.0.0** | :x: No | Beta / Pre-release builds (unsupported) |

---

## Reporting a Vulnerability

We take the security and aerodynamic algorithmic integrity of RangeStudio seriously. If you discover a potential security vulnerability, numerical instability, or parsing issue, please disclose it responsibly.

### How to Report

1. **GitHub Private Vulnerability Reporting (Preferred)**:
   - Navigate to the **Security** tab of the repository.
   - Click **Report a vulnerability** to open a confidential advisory draft.
   - This ensures the issue is reviewed in private before public disclosure.

2. **Responsible Disclosure Guidelines**:
   - **Do NOT** open a public issue or discussion thread disclosing the vulnerability details.
   - Provide a detailed description including:
     - The type of vulnerability (e.g., calculation crash, malformed JSON file injection, unhandled exception).
     - The affected environment / browser / platform.
     - Step-by-step reproduction instructions or a minimal `.range` / `.rng` profile file.
     - Expected vs actual behavior.

### Response & Remediation Timelines

- **Initial Acknowledgment**: Within **48 hours** of report receipt.
- **Triage & Impact Assessment**: Within **5 business days**.
- **Remediation & Patch Release**: A hotfix will be deployed via automated GitHub Actions CI.

---

## Scope & Security Architecture

RangeStudio operates strictly as a client-side, zero-telemetry precision ballistics application:

- **Point-Mass Trajectory Safety**: Bounds-checked 4th-order Runge-Kutta (RK4) numerical integrator, drag curve interpolations (G1/G7), Coriolis/Eötvös formulations, and spin drift calculations.
- **Profile File Validation**: Strict validation on imported `.range`, `.rng`, `.loadbench`, and `.wildcat` JSON structures to prevent code injection.
- **Zero-Cloud Architecture**: All DOPE tables, rifle configurations, optic reticles, and custom drop cards are stored locally in the user's browser or desktop storage.

---

*Copyright © 2026 RangeStudio. All rights reserved.*
