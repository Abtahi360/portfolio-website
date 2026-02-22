const { JSDOM } = require("jsdom");
const { initViewRepoButtons } = require("../view-repo-button.js");

describe("ViewRepoButton", () => {
  function setupDom(html) {
    const dom = new JSDOM(html, { url: "http://localhost/" });
    global.window = dom.window;
    global.document = dom.window.document;
    return dom;
  }

  afterEach(() => {
    delete global.window;
    delete global.document;
    jest.resetModules();
  });

  test("renders anchor with icons and label when repoUrl is present", () => {
    setupDom(`
      <div class="card-footer">
        <div
          class="view-repo-button"
          data-repo-url="https://github.com/example/repo"
          data-project-name="Example Project"
        ></div>
      </div>
    `);

    initViewRepoButtons();

    const btn = document.querySelector(".view-repo-btn");
    expect(btn).not.toBeNull();
    expect(btn.tagName.toLowerCase()).toBe("a");
    expect(btn.getAttribute("href")).toBe("https://github.com/example/repo");
    expect(btn.getAttribute("target")).toBe("_blank");
    expect(btn.getAttribute("rel")).toBe("noopener noreferrer");

    const label = btn.querySelector(".view-repo-label");
    const leftIcon = btn.querySelector(".view-repo-icon-left");
    const rightIcon = btn.querySelector(".view-repo-icon-right");

    expect(label).not.toBeNull();
    expect(label.textContent).toBe("View Repository");
    expect(leftIcon).not.toBeNull();
    expect(rightIcon).not.toBeNull();
  });

  test("sets aria-label based on project name", () => {
    setupDom(`
      <div
        class="view-repo-button"
        data-repo-url="https://github.com/example/repo"
        data-project-name="Example Project"
      ></div>
    `);

    initViewRepoButtons();

    const btn = document.querySelector(".view-repo-btn");
    expect(btn.getAttribute("aria-label")).toBe(
      "Open repository for Example Project"
    );
  });

  test("disabled state is rendered when repoUrl is missing", () => {
    setupDom(`
      <div
        class="view-repo-button"
        data-project-name="Missing Repo Project"
      ></div>
    `);

    initViewRepoButtons();

    const disabledBtn = document.querySelector(
      ".view-repo-btn.view-repo-btn-disabled"
    );
    expect(disabledBtn).not.toBeNull();
    expect(disabledBtn.getAttribute("aria-disabled")).toBe("true");
    expect(disabledBtn.disabled).toBe(true);
    expect(disabledBtn.title).toBe("Repository not available");
  });
});

