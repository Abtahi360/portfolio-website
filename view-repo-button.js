function initViewRepoButtons() {
  if (typeof document === "undefined") {
    return;
  }
  var nodes = document.querySelectorAll(".view-repo-button");
  if (!nodes.length) {
    return;
  }

  function buildAriaLabel(projectName) {
    if (projectName && projectName.trim().length > 0) {
      return "Open repository for " + projectName.trim();
    }
    return "Open repository";
  }

  function createAnchor(repoUrl, projectName) {
    var link = document.createElement("a");
    link.className = "link-pill link-pill-primary view-repo-btn";
    link.href = repoUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    var ariaLabel = buildAriaLabel(projectName);
    link.setAttribute("aria-label", ariaLabel);
    link.title = ariaLabel;

    var leftIcon = document.createElement("span");
    leftIcon.className = "view-repo-icon-left";
    leftIcon.setAttribute("aria-hidden", "true");
    leftIcon.textContent = "";

    var label = document.createElement("span");
    label.className = "view-repo-label";
    label.textContent = "View Repository";

    var rightIcon = document.createElement("span");
    rightIcon.className = "view-repo-icon-right";
    rightIcon.setAttribute("aria-hidden", "true");
    rightIcon.textContent = "↗";

    link.appendChild(leftIcon);
    link.appendChild(label);
    link.appendChild(rightIcon);

    return link;
  }

  function createDisabled(projectName) {
    var wrapper = document.createElement("div");
    wrapper.className = "view-repo-wrapper";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "link-pill view-repo-btn view-repo-btn-disabled";
    button.setAttribute("aria-disabled", "true");
    button.disabled = true;
    button.title = "Repository not available";

    var leftIcon = document.createElement("span");
    leftIcon.className = "view-repo-icon-left";
    leftIcon.setAttribute("aria-hidden", "true");
    leftIcon.textContent = "";

    var label = document.createElement("span");
    label.className = "view-repo-label";
    label.textContent = "View Repository";

    button.appendChild(leftIcon);
    button.appendChild(label);

    wrapper.appendChild(button);

    var isLocalhost = typeof window !== "undefined" &&
      window.location &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (isLocalhost) {
      var devButton = document.createElement("button");
      devButton.type = "button";
      devButton.className = "view-repo-add-dev";
      devButton.textContent = "Add repo";
      devButton.addEventListener("click", function () {
        var name = projectName || "this project";
        var url = window.prompt("Enter temporary repository URL for " + name);
        if (!url) {
          return;
        }
        try {
          var key = "tempRepoUrl-" + name;
          window.localStorage.setItem(key, url);
        } catch (e) {}
        window.open(url, "_blank", "noopener,noreferrer");
      });
      wrapper.appendChild(devButton);
    }

    return wrapper;
  }

  nodes.forEach(function (node) {
    var projectName = node.getAttribute("data-project-name") || "";
    var repoUrl = node.getAttribute("data-repo-url") || "";

    if (!repoUrl && projectName) {
      try {
        var tempKey = "tempRepoUrl-" + projectName;
        var stored = window.localStorage.getItem(tempKey);
        if (stored) {
          repoUrl = stored;
        }
      } catch (e) {}
    }

    var replacement;
    if (repoUrl) {
      replacement = createAnchor(repoUrl, projectName);
    } else {
      replacement = createDisabled(projectName);
    }

    node.replaceWith(replacement);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initViewRepoButtons);
  } else {
    initViewRepoButtons();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initViewRepoButtons: initViewRepoButtons,
  };
}

