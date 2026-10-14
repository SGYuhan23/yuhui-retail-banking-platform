# Current GitHub Release Verification

Engineering verification for the local synthetic demo, dated 2026-10-14.

| Check | Result | Evidence |
|---|---|---|
| Backend Build | PASS | [build](github-final/backend-build.txt) |
| Backend Unit Tests | 22/22 PASS, 0 skipped | [unit](github-final/backend-unit.txt) |
| Final Patch | 22/22 PASS | [acceptance](github-final/final-patch-acceptance.txt) |
| Full V3 / Fixed Seed Reproducibility | 48/48 PASS | [V3](github-final/v3-acceptance.txt) |
| Legacy Regression | 10/10 groups PASS | [regression](github-final/legacy-regression.txt) |
| Frontend TypeCheck | PASS | [types](github-final/frontend-typecheck.txt) |
| Frontend Build | PASS | [build](github-final/frontend-build.txt) |
| Public Hygiene Scan | PASS | [scan](github-final/public-scan.json), [strict verification](github-final/public-verify.txt) |

Fixed seed: 2166 → 1563 → 964 → 500 → 275 → 224. Budget: 6000 / committed 3300 / released 2700; merchant contribution 2200. Target achievement: 224 / 150 = 149.3%, synthetic demo only.

[Frozen browser flow](final-patch/browser-flow.json) and seven product screenshots remain unchanged. Other [final-patch evidence](final-patch) is historical engineering evidence; before-fix/startup-retry records are not counted as current passing builds. Current build evidence is linked above.

These are project engineering checks, not third-party certification, bank production validation or security certification. Runtime integration samples are skipped by the default Maven configuration and are not included in the 22 independent tests. GitHub Actions has verified dependency installation with the frozen lockfile, type checking and frontend build using Node 22 / pnpm 10. The backend-unit, frontend and public-hygiene jobs all passed in [Repository quality run 38585107051](https://github.com/SGYuhan23/yuhui-retail-banking-platform/actions/runs/38585107051).

See [local run](../docs/local-run.md) for setup. Acceptance resets synthetic data and is intended only for the local demo.
