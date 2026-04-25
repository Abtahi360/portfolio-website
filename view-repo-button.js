function initViewRepoButtons() {
  if (typeof document === "undefined") {
    return;
  }
  var nodes = document.querySelectorAll(".view-repo-button");
  if (!nodes.length) {
    return;
  }

  function buildAriaLabel(projectName, isLive) {
    var prefix = isLive ? "Open live version of " : "Open repository for ";
    if (projectName && projectName.trim().length > 0) {
      return prefix + projectName.trim();
    }
    return isLive ? "Open live project" : "Open repository";
  }

  function createAnchor(repoUrl, projectName, isLive) {
    var link = document.createElement("a");
    link.className = "link-pill view-repo-btn";
    
    if (isLive) {
      link.classList.add("link-pill-live");
      link.href = repoUrl; // repoUrl is actually liveLink here
    } else {
      link.classList.add("link-pill-primary");
      link.href = repoUrl;
    }

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    var ariaLabel = buildAriaLabel(projectName, isLive);
    link.setAttribute("aria-label", ariaLabel);
    link.title = ariaLabel;

    var label = document.createElement("span");
    label.className = "view-repo-label";
    label.textContent = isLive ? "Live Project" : "View Repository";

    var rightIcon = document.createElement("span");
    rightIcon.className = "view-repo-icon-right";
    rightIcon.setAttribute("aria-hidden", "true");
    rightIcon.textContent = isLive ? "▶" : "↗";

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



    var label = document.createElement("span");
    label.className = "view-repo-label";
    label.textContent = "View Repository";

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
    var liveLink = node.getAttribute("data-live-link") || "";

    if (!repoUrl && !liveLink && projectName) {
      try {
        var tempKey = "tempRepoUrl-" + projectName;
        var stored = window.localStorage.getItem(tempKey);
        if (stored) {
          repoUrl = stored;
        }
      } catch (e) {}
    }

    var replacement;
    if (liveLink) {
      replacement = createAnchor(liveLink, projectName, true);
    } else if (repoUrl) {
      replacement = createAnchor(repoUrl, projectName, false);
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

