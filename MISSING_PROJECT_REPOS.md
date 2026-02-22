Missing project repositories
============================

Purpose
-------
This file tracks project cards that do not currently have an associated repository URL.
It is intended as a lightweight log during development.

How it works
------------
- The View Repository button uses data attributes on each project card footer:
  - data-repo-url: repository URL if known
  - data-project-name: human-readable project name
- If data-repo-url is omitted for any future project card, the button renders in a
  disabled state with:
  - aria-disabled="true"
  - title "Repository not available"
- During local development, an “Add repo” helper appears next to disabled buttons:
  - It prompts for a temporary URL
  - Stores the entered URL in localStorage under a key derived from the project name

Current status
--------------
- At the time of this change, all Projects section cards have a repository URL.
- No missing project repositories are logged.

Usage guideline
---------------
- When you intentionally add a project card without a repo URL:
  - Append an entry here with:
    - Project title
    - Optional notes on where the code lives or why it is missing

