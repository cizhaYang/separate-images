# Image Splitter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React frontend app that uploads one image, previews a draggable split line, and exports two split images.

**Architecture:** Keep image math and export helpers in testable utility modules, with React owning file input, preview state, drag interaction, and user feedback. Canvas handles the actual crop/export work; saving uses File System Access API first and falls back to browser downloads.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, Canvas browser APIs.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite entry HTML.
- Create `vite.config.ts`: Vite + React + Vitest configuration.
- Create `tsconfig.json`, `tsconfig.node.json`: TypeScript configuration.
- Create `src/main.tsx`: React bootstrap.
- Create `src/App.tsx`: upload, preview, dragging, controls, export orchestration.
- Create `src/App.css`: complete page styling.
- Create `src/lib/imageSplit.ts`: split math, file naming, canvas crop/export.
- Create `src/lib/saveFiles.ts`: directory save and download fallback.
- Create `src/lib/imageSplit.test.ts`: unit tests for pure split behavior.

## Tasks

### Task 1: Project Scaffold

- [ ] Create Vite React TypeScript project files.
- [ ] Install dependencies with `npm install`.
- [ ] Run `npm test -- --run`; expect Vitest to start after tests are added.

### Task 2: Split Utilities With TDD

- [ ] Write failing tests for split rectangle calculation.
- [ ] Implement `getSplitRects`.
- [ ] Write failing tests for export file naming.
- [ ] Implement `buildSplitFileNames`.
- [ ] Write failing tests for MIME type fallback.
- [ ] Implement `getExportMime`.
- [ ] Run `npm test -- --run`; expect all utility tests to pass.

### Task 3: Canvas Export

- [ ] Add `splitImageToBlobs` that draws source image regions into canvases.
- [ ] Keep crop coordinates based on original image dimensions and split ratio.
- [ ] Return two blobs and generated file names.
- [ ] Add defensive errors for missing or failed blob output.

### Task 4: Save Strategy

- [ ] Add File System Access API save path.
- [ ] Add `<a download>` fallback for unsupported browsers or declined directory selection.
- [ ] Keep fallback non-blocking and trigger both file downloads.

### Task 5: React UI

- [ ] Build upload/drop zone.
- [ ] Build direction segmented control.
- [ ] Build image preview with visible draggable split line.
- [ ] Map pointer coordinates from displayed image bounds to split ratio.
- [ ] Add export button, progress state, success state, and error state.

### Task 6: Styling And Verification

- [ ] Style the app as a compact single-page tool.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev` and provide the local URL.

