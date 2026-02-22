Assumptions
===========

Tech and architecture
---------------------
- The portfolio is a static site built with:
  - Plain HTML for structure
  - CSS in a single inline <style> block for layout and theming
  - Vanilla JavaScript loaded via simple <script src="..."> tags
- No framework (React, Vue, Next, Svelte) or bundler is in use.
- Jest + jsdom are used only for unit tests; application code runs directly in the browser.

View Repository button
----------------------
- A single visual style is desired for all project “View Repository” actions.
- Existing design tokens and classes (link-pill, link-pill-primary, etc.) should be reused.
- Git icon and external-tab icon are represented using plain text glyphs and styled via CSS.
- Keyboard interaction for anchors (Enter/Space activation) is delegated to the browser’s
  native behavior; no custom key handling is added.

Data model
----------
- Project cards in the Projects section are the only consumers of the View Repository button.
- Each card exposes its repository information via:
  - data-repo-url
  - data-project-name
- These attributes are treated as the single source of truth for repository URLs and labels.

Missing repositories
--------------------
- The site is static and cannot modify markdown files at runtime in the browser.
- Because of that, missing repository entries are tracked via:
  - A disabled button state with aria-disabled="true" and tooltip
  - An optional “Add repo” helper in local development that stores temporary URLs
    in localStorage
  - Manual updates to MISSING_PROJECT_REPOS.md when needed
- At the time of this change, all project cards have repository URLs.

Testing and commands
--------------------
- npm is the expected package manager for running tests (no pnpm/yarn configuration).
- npm test runs Jest; there are no dev or build scripts defined in package.json.
- For local visual verification, the site is served with:
  - python -m http.server 8000
  - Then visiting http://localhost:8000/ in a browser.

