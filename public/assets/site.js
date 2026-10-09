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

  // Count a "read", not just a view: the end of the post was on screen, and the page was open
  // for at least 30% of its read time (10 s minimum). Sent once per page view as a GoatCounter
  // event at read/<slug>; GoatCounter dedupes visitors, so that path's visitors are unique reads.
  const article = document.querySelector("article[data-read-slug]");
  const body = article && article.querySelector(".prose-body");
  if (body && "IntersectionObserver" in window) {
    const minutes = Number(article.dataset.readMinutes) || 1;
    const minMs = Math.max(10, minutes * 60 * 0.3) * 1000;
    const start = performance.now();
    let reachedEnd = false;
    let sent = false;
    const trySend = () => {
      if (sent || !reachedEnd || document.visibilityState !== "visible") return;
      if (performance.now() - start < minMs) return;
      const gc = window.goatcounter;
      if (!gc || typeof gc.count !== "function") return;
      sent = true;
      gc.count({ path: `read/${article.dataset.readSlug}`, title: `Read: ${document.title}`, event: true });
    };
    const end = document.createElement("div");
    end.setAttribute("aria-hidden", "true");
    end.style.height = "1px";
    body.after(end);
    new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      reachedEnd = true;
      trySend();
      setTimeout(trySend, Math.max(0, minMs - (performance.now() - start)) + 50);
    }).observe(end);
    // A reader who finishes in a background tab is counted when they come back to it.
    document.addEventListener("visibilitychange", trySend);
  }

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
