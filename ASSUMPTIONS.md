# Assumptions and Limitations

This document outlines the assumptions made and limitations encountered during the implementation of the requested tasks.

## 1. Test Environment Setup

**Assumption:** The project can be set up to run JavaScript tests using Jest.

**Limitation:** Due to PowerShell execution policies on the user's system preventing `npm` commands, the agent was unable to automatically install Jest or run the tests.

**Instructions for User:**
To run the tests, please perform the following steps in your terminal:

1.  **Initialize npm (if not already done):**
    ```bash
    npm init -y
    ```
2.  **Install Jest:**
    ```bash
    npm install --save-dev jest jsdom @testing-library/jest-dom
    ```
3.  **Add test script to `package.json`:**
    Open `package.json` and add the following line under the `"scripts"` section:
    ```json
    "test": "jest"
    ```
    Your `package.json` scripts section should look something like this:
    ```json
    "scripts": {
      "test": "jest",
      "start": "echo \"Error: no start specified\" && exit 1"
    },
    ```
4.  **Run tests:**
    ```bash
    npm test
    ```

## 2. Missing Project Repository URLs

**Assumption:** For projects where a GitHub repository URL could not be found under the `Abtahi360` profile, a fallback modal mechanism was implemented.

**Details:** A file named `MISSING_PROJECT_REPOS.md` has been generated, listing the projects for which repository links were missing. When clicking "View Repository" for these projects, a modal will appear instead of navigating to a GitHub page. This modal provides a temporary input field for a URL (stored locally in the browser) and logs a suggestion to the console for adding the link.

## 3. Hover Icon Effect Interpretation

**Assumption:** The "mouse/hover icon effect" mentioned in the task referred to the visual transformation (lift, shadow, border change) applied to card-like elements on hover, rather than an actual icon appearing.

**Details:** The hover effect from the `.card:hover` CSS rule (transform, box-shadow, border-color, background changes) was replicated for `cert-card` elements by adding the `card` class, and the `.skill-icon-pill:hover` effect was unified to match `.card:hover` for consistency. The Education History elements already possessed the `.card` class and thus the desired hover effect.

## 4. Project Card Content

**Assumption:** When restructuring the Project section, the descriptive text and tech tags for each project were extracted and simplified from the existing compact card content. The "Live Demo" optional link was not implemented as no data for it was provided.

```