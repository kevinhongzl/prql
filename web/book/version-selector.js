// Adds a selector between the latest release's book, at `/book/`, and the
// book for `main`, at `/book/main/`, which `build-web` builds alongside it.

(function () {
  const VERSIONS = [
    { name: "Latest release", path: "/book/" },
    { name: "main", path: "/book/main/" },
  ];
  const [latest, main] = VERSIONS;

  const path = window.location.pathname;
  // Not on the website, e.g. under `mdbook serve`.
  if (!path.startsWith(latest.path)) return;
  const current = path.startsWith(main.path) ? main : latest;

  const style = document.createElement("style");
  style.textContent = `
    #prql-version-select {
      margin: 0 6px;
      padding: 2px 4px;
      font-size: 1.4rem;
      color: var(--icons);
      background: var(--bg);
      border: 1px solid var(--theme-popup-border);
      border-radius: 4px;
      cursor: pointer;
    }
    #prql-version-select:hover { color: var(--icons-hover); }
    .prql-version-banner {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-inline-start: 4px solid var(--warning-border);
      background: var(--quote-bg);
    }
  `;
  document.head.appendChild(style);

  // Go to the same page in the other version, or to its index if it doesn't
  // have the page.
  async function switchTo(target) {
    const url = target.path + path.slice(current.path.length);
    try {
      const response = await fetch(url, { method: "HEAD" });
      window.location.href =
        (response.ok ? url : target.path) + window.location.hash;
    } catch {
      window.location.href = target.path;
    }
  }

  const buttons = document.querySelector(".menu-bar .right-buttons");
  if (buttons) {
    const select = document.createElement("select");
    select.id = "prql-version-select";
    select.title = "Book version";
    select.setAttribute("aria-label", "Book version");
    for (const v of VERSIONS) {
      const option = document.createElement("option");
      option.value = v.path;
      option.textContent = v.name;
      option.selected = v === current;
      select.appendChild(option);
    }
    select.addEventListener("change", () =>
      switchTo(VERSIONS.find((v) => v.path === select.value)),
    );
    buttons.prepend(select);

    // Written by `task web:build`.
    fetch(`${latest.path}version.txt`)
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        const version = text.trim();
        if (/^\d+\.\d+\.\d+$/.test(version))
          select.options[0].textContent = `${version} (latest)`;
      })
      .catch(() => {});
  }

  const content = document.querySelector("main");
  if (current === main && content) {
    const banner = document.createElement("div");
    banner.className = "prql-version-banner";
    banner.setAttribute("role", "note");
    banner.append(
      "This is the book for the main branch, which may describe unreleased changes. ",
    );
    const link = document.createElement("a");
    link.href = latest.path;
    link.textContent = "Read the book for the latest release.";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      switchTo(latest);
    });
    banner.append(link);
    content.prepend(banner);
  }
})();
