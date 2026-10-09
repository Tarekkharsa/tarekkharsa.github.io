// Small progressive enhancements: theme toggle, header border, copy buttons, heading anchors.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  if (toggle) {
    root.dataset.theme = current();
    toggle.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch {}
    });
  }

  const bar = document.querySelector(".topbar");
  if (bar) {
    const onScroll = () => bar.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const copy = async (text, button, label) => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    button.textContent = "copied ✓";
    setTimeout(() => { button.textContent = label; }, 1400);
  };

  document.querySelectorAll(".prose pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "code";
    pre.replaceWith(wrap);
    wrap.append(pre);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code";
    button.textContent = "copy";
    button.addEventListener("click", () => copy(pre.innerText, button, "copy"));
    wrap.append(button);
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    const label = button.textContent;
    button.addEventListener("click", () => copy(location.href.split("#")[0], button, label));
  });

  const slug = (s) => s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  document.querySelectorAll(".prose h2, .prose h3").forEach((h) => {
    if (!h.id) h.id = slug(h.textContent);
    const a = document.createElement("a");
    a.className = "anchor";
    a.href = `#${h.id}`;
    a.setAttribute("aria-label", `Link to ${h.textContent}`);
    a.textContent = "#";
    h.prepend(a);
  });
})();
