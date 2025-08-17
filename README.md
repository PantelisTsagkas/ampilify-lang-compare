# Language Comparison Mini‑Project (No installs, Hosting‑only)

This project allows learners to compare different language versions of the same project.
You will build the same small CRUD app twice — once in JavaScript and once in TypeScript — and compare the developer experience.
Data is stored client‑side (localStorage), so there is no backend to deploy. We will still use AWS Amplify **Hosting** to deploy from GitHub.

## Learning aims (Level 6)
- Compare language ergonomics: type safety, refactoring confidence, and runtime vs compile‑time errors.
- Apply basic architectural separation (state, storage, UI) in a small app.
- Evidence testing and documentation suitable for professional practice.

## What you will produce
- A JavaScript version (apps/js) and a TypeScript version (apps/ts) of a Notes app with create, list, toggle, delete, and filter.

## How to run this project (no installs)
1. Fork this repository on GitHub.
2. In AWS Amplify → Host web app → connect your fork.
3. Deploy the JavaScript app: App root `apps/js`, build `npm install && npm run build`, output `dist`.
4. Deploy the TypeScript app: either a second environment from the same repo, with App root `apps/ts`, or a separate app.
5. Use the deployed URLs for testing and for your submission.

## Stretch (optional)
- Add search, sort, and a simple stats panel.
- Add minimal unit tests for the storage module (e.g., pure functions).
- Accessibility improvements (keyboard support, focus styles, aria‑labels).
