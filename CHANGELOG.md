# Changelog

## 2026-02-20

### Fixed

- **Toolbar Active/Pressed State Consistency**: Ensured all toolbar buttons now show a visible active/pressed indicator when clicked or when their target section is scrolled into view. Previously, only 'Software Tools', 'Certificates', 'Contact' displayed this state consistently.
- **Projects Section - Broken Buttons**: Repaired "View Repository" buttons for Projects B through K. Buttons are now actual links (`<a>`) opening in new tabs, with keyboard accessibility and `aria-label` attributes.
- **Projects Section - Missing Repository Fallback**: Implemented a fallback modal for projects with missing repository URLs, providing a clear message and an option to temporarily paste a link. Missing repositories are documented in `MISSING_PROJECT_REPOS.md`.

### Added

- **Toolbar - Education Button**: Added an "Education" button immediately after the "Home" button in the top toolbar. Clicking it smoothly scrolls to the Education section, and it receives the correct active/pressed visual state. Implemented keyboard focus and `aria-current="true"` equivalent when active.
- **Hover Icon Effect Replication**: Replicated the hover effect (lift and shadow) from existing cards to all elements in Education History and Certificate cards, ensuring visual consistency.
- **Unit/Integration Tests**: Added unit/integration tests using Jest to verify toolbar navigation, scroll-spy behavior, and project repository link functionality. These tests are located in `tests/index.test.js`.
- **Documentation**: Created `ASSUMPTIONS.md`, `MISSING_PROJECT_REPOS.md`, `CHANGELOG.md`, and `TESTING.md` to document assumptions, missing data, changes, and manual acceptance criteria.

### Changed

- **Projects Section Reorganization**: Restructured the Projects section into a consistent, responsive grid of cards. Each card now clearly displays the project name, description, tech tags, and a "View Repository" link. Removed the old tabbed interface and main project card structure.
- **Unified Hover Effects**: Standardized hover effects across `cert-card` and `skill-icon-pill` elements to match the existing `.card:hover` style, ensuring a cohesive visual experience.