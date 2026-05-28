# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite + React image-splitting app. Application code lives in `src/`, with the main UI in `src/App.tsx` and shared styling in `src/App.css`. Browser entry points are `index.html` and `src/main.tsx`. Image-processing and file-saving helpers live under `src/lib/`, with related tests beside the implementation, such as `src/lib/imageSplit.test.ts`. React component tests live in `src/App.test.tsx`, and test setup is in `src/test/setup.ts`. Design notes and implementation plans are kept in `docs/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Vite development server.
- `npm test`: run the Vitest test suite once.
- `npm run typecheck`: run TypeScript checks without emitting files.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally for verification.

Run `npm test`, `npm run typecheck`, and `npm run build` before handing off changes that affect runtime behavior.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing style: two-space indentation, single quotes, semicolons, and explicit named helpers for non-trivial logic. Keep UI state and event handlers close to the component that owns them. Use `PascalCase` for components, `camelCase` for variables/functions, and descriptive test names that state the behavior being checked.

## Testing Guidelines

Tests use Vitest, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom`. Prefer behavior-focused tests over implementation details: query by accessible label, role, or visible text. Place library tests next to the source file they cover, using the `*.test.ts` or `*.test.tsx` pattern. Mock browser APIs only when jsdom cannot provide the required behavior.

## Commit & Pull Request Guidelines

Recent commits use concise Conventional Commit prefixes, including `feat:` and `fix:`. Keep commit messages imperative and specific, for example `fix: 修复H5图片预览偏移`. Pull requests should include a short summary, testing performed, linked issues when available, and screenshots or screen recordings for UI changes.

## Agent-Specific Instructions

When responding to users in this repository, use Simplified Chinese. Keep generated documentation and code comments in the language that best matches the surrounding file or explicit user request.
