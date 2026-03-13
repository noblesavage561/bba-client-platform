# System Scan and Calibration Report

Date: 2026-03-12
Workspace: /workspaces/bba-client-platform

## Scope
- Lint scan
- Production build scan
- Type diagnostics scan
- Test runtime scan
- Runtime calibration for test stability

## Results

### Lint
Command:
- npm run lint

Outcome:
- Passed with no ESLint warnings or errors.
- Note: `next lint` deprecation warning (Next.js recommends ESLint CLI migration before Next 16).

### Build
Command:
- npm run build

Outcome:
- Passed.
- Next.js build completed successfully, including lint and type validation.
- App routes generated successfully.

### Type/Editor Diagnostics
Command:
- VS Code diagnostics scan (all files)

Outcome:
- No diagnostics errors found.

### Tests (Pre-calibration)
Command:
- npm run test --workspace=apps/web -- --runInBand

Outcome:
- Failed with Node.js heap out-of-memory during Jest run.
- Error signature: "Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory".

### Calibration Applied
Change:
- Updated test script to allocate larger Node heap for Jest.
- File changed: apps/web/package.json
- Script changed from:
  - "test": "jest"
- To:
  - "test": "NODE_OPTIONS=--max-old-space-size=6144 jest"

### Tests (Post-calibration)
Command:
- npm run test --workspace=apps/web -- --runInBand

Outcome:
- Passed.
- 1 test suite passed, 33 tests passed.

## Summary
- System health: GREEN
- Compile/lint/type status: PASS
- Runtime test stability: PASS after memory calibration
- Saved calibration is now persistent in npm test script.

## Follow-up Recommendation
- Migrate from `next lint` to direct ESLint CLI before upgrading to Next.js 16.
