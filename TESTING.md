Manual testing checklist
========================

Tech stack
----------
- Static site: plain HTML + CSS + vanilla JavaScript
- Tests: Jest + jsdom (see package.json)

Commands
--------
- Install dependencies:
  - npm install
- Run tests:
  - npm test
- Open site (static):
  - python -m http.server 8000
  - Visit http://localhost:8000/ in a browser

View Repository button checks
-----------------------------
- Projects section:
  - Each project card shows a pill-shaped “View Repository” button
  - On desktop:
    - Left icon (Git mark), label “View Repository”, right external-arrow icon
    - Hover: slight lift and right icon nudges to the right
    - Active state: slight press down
  - On small screens (≤ 420px width):
    - Label may hide; icons remain visible
    - Tooltip on hover/focus still describes the action
- Behavior:
  - Mouse click on the button opens the matching GitHub repository in a new tab
  - Keyboard:
    - Tab to the button: focus ring is clearly visible
    - Enter or Space on the anchor activates the link (browser default behavior)
- Disabled / fallback behavior:
  - If any future project is rendered without a repository URL:
    - A greyed-out pill appears with “View Repository”
    - Button has aria-disabled="true", disabled, and title “Repository not available”
    - In local development (http://localhost), an “Add repo” helper shows beside it:
      - Clicking it prompts for a temporary URL
      - If provided, the URL is stored in localStorage and opened in a new tab

Automated tests
---------------
- Jest test suite:
  - tests/index.test.js
    - Verifies navigation active state and IntersectionObserver behavior
  - tests/view-repo-button.test.js
    - Asserts:
      - Anchor rendering with icon + label + correct href/target/rel
      - aria-label uses the project name
      - Disabled state renders a button with aria-disabled="true" and tooltip

How to interpret failures
-------------------------
- If npm test fails because dependencies are missing:
  - Run npm install
  - Re-run npm test
- If a View Repository test fails:
  - Check that the markup still uses .view-repo-button placeholders
  - Ensure view-repo-button.js is loaded in index.html

