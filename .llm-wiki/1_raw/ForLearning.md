# Learning Log (Error Tracking)

This file tracks technical hurdles, mistakes, and troubleshooting steps for future reference.

## 📅 From QSMS-Rework Project

### 1. Button Refresh Issue
- **Mistake:** Button "คู่มือการใช้งาน" in sidebar caused full page reload.
- **Root Cause:** Buttons inside containers lacking explicit `type` default to submit behavior in some contexts.
- **Solution:** Added `e.preventDefault()` and set `type="button"` on all UI buttons.

### 2. Timezone Mismatch
- **Mistake:** Data created on frontend showed different times than those viewed in the list.
- **Root Cause:** Default browser timezone vs GAS server timezone (UTC).
- **Solution:** Locked formatting to `Asia/Bangkok` using `Intl.DateTimeFormat`.

### 3. Missing Image Preloading in Export
- **Mistake:** Exporting to PDF resulted in blank image areas.
- **Root Cause:** `html2canvas` captures the DOM before remote images are fully loaded.
- **Solution:** Preload all images using a synchronization logic before triggering capture.

### 4. GAS Deployment Confusion
- **Mistake:** Frontend didn't reflect `Code.gs` changes.
- **Root Cause:** GAS Web App requires a *New Version* deployment to update the active code.
- **Solution:** Always deploy as "New Version" after backend changes.

---

## 📅 ImproveFlow Web App Project

### [2026-05-08] JSX Parse Error: Unexpected token `>`
- **Problem:** `[PARSE_ERROR] Error: Unexpected token. Did you mean {'>'} or &gt;?`
- **Location:** `src/App.tsx` (Table header text: `Flow (PDB -> PDF)`)
- **Cause:** JSX parser confused the `>` symbol with a closing tag character.
- **Solution:** Replaced `->` with `&rarr;` or wrap in `{}`.

### [2026-05-08] PostCSS Syntax Error (ESM in CJS)
- **Problem:** `SyntaxError: Unexpected token 'export'` in `postcss.config.js`.
- **Cause:** Mixing ESM (`export default`) with `.js` extension in a non-module environment.
- **Solution:** Set `"type": "module"` in `package.json`.

### [2026-05-08] Tailwind v4 PostCSS Plugin Change
- **Problem:** `tailwindcss` directly as a PostCSS plugin is deprecated in v4.
- **Solution:** Installed `@tailwindcss/postcss` and updated `postcss.config.js`.

---
### [2026-05-15] Severe Git Merge Conflict (QSMS vs ImproveFlow)
- **Problem:** The project became unbuildable with thousands of lines of duplicated code and conflict markers (`<<<<<<<`, `=======`).
- **Cause:** Accidentally merging the `QSMS-Rework` codebase into the `ImproveFlow` repository.
- **Solution:** 
    1. Systematically cleaned configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`).
    2. Rewrote `App.tsx` by extracting the correct HEAD sections and discarding the merged project logic.
    3. Verified the backend `Code.gs` to ensure it belongs to ImproveFlow.
- **Learning:** Always verify branch status before merging, and use `multi_replace_file_content` or full file rewrites for complex conflicts rather than simple regex.

---
*Maintained by Antigravity*
