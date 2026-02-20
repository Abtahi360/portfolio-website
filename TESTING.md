# Manual Acceptance Test Checklist

This document outlines the step-by-step manual acceptance checks to verify the implemented changes.

## Setup

1.  Ensure you have a local web server running to serve the `index.html` file (e.g., using `python -m http.server` or `npm install -g http-server` then `http-server`).
2.  Open the `index.html` file in a modern web browser.
3.  Open the browser's developer console to observe any log messages.

## Checklist

### 1. Education Toolbar Button Functionality

-   **Test:** Open site, Tab to toolbar, press Enter on "Education".
-   **Expected:**
    -   The page scrolls smoothly to the "Educational History" section.
    -   The "Education" button in the toolbar is clearly marked as active (e.g., with an underline/indicator).

### 2. Toolbar Active Mark Consistency on Click

-   **Test:** Click each toolbar button individually (Home, Education, Projects, Research, Skills, Software Tools, Certificates, Contact).
-   **Expected:**
    -   Each clicked item clearly shows the pressed/active mark (e.g., with an underline/indicator) immediately upon clicking.
    -   The page smoothly scrolls to the corresponding section.

### 3. Scroll-Spy Functionality

-   **Test:** Scroll through the page slowly, observing the toolbar.
-   **Expected:**
    -   The toolbar's active item changes correctly as different sections enter and leave the viewport. The currently viewed section's corresponding toolbar button should be marked active.

### 4. Hover Icon Effect Replication

-   **Test:** Hover over each item in the "Educational History" section.
-   **Expected:** All items in the "Educational History" section exhibit the consistent lift and shadow hover effect.
-   **Test:** Hover over each certificate card in the "Certificates" section.
-   **Expected:** All certificate cards exhibit the consistent lift and shadow hover effect.
-   **Test:** Hover over each skill pill in the "Skills" section.
-   **Expected:** All skill pills exhibit the consistent lift and shadow hover effect.

### 5. Projects Section - "View Repository" Buttons & Missing Repos

-   **Test:** For each Project card (A..K) in the "Projects" section, click the "View Repository" button.
-   **Expected:**
    -   **For Projects B, I, J, K:** A new browser tab opens, navigating to the correct GitHub repository URL.
    -   **For Projects C, D, E, F, G, H:** A modal dialog appears, stating that the repository could not be found for the specific project. The browser's developer console should show a `SUGGESTION` log message for the missing repository.
    -   **Inside the modal:** Enter a URL into the "Paste repository URL here" input field and click "Open Link". A new browser tab should open with the provided URL. Close the modal by clicking the 'x' or outside the modal.

### 6. Projects Section Visual Reorganization

-   **Test:** Observe the "Projects" section on various screen sizes (desktop, tablet, mobile widths – by resizing your browser window).
-   **Expected:**
    -   The projects are organized into a neat, responsive grid of consistent card styles.
    -   Spacing, text alignment, and action buttons are consistent across all project cards.
    -   The grid layout adapts appropriately for mobile-first breakpoints (e.g., fewer columns on smaller screens).

### 7. Keyboard Accessibility

-   **Test:** Navigate the entire page using only the Tab key. Use Enter/Space to activate elements.
-   **Expected:**
    -   All toolbar items are reachable and operable with the keyboard.
    -   All "View Repository" buttons (and any other interactive elements in project cards) are reachable and operable with the keyboard.
    -   When the modal is open, focus should ideally remain within the modal until closed (though a full trap is beyond the current scope, basic keyboard interaction should work).

---

## Running Tests Locally (Automated)

As noted in `ASSUMPTIONS.md`, automated tests were written but not executed by the agent due to system limitations. To run them:

1.  **Initialize npm (if not already done):**
    ```bash
    npm init -y
    ```
2.  **Install Jest and dependencies:**
    ```bash
    npm install --save-dev jest jsdom @testing-library/jest-dom
    ```
3.  **Run tests:**
    ```bash
    npm test
    ```
-   **Expected:** All tests pass, indicating core functionality is working as expected.