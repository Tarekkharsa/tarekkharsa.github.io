// Interactive lesson demos. Loaded by site.js only on pages with a [data-demo] element.
// Each demo replaces a static fallback, so lessons still read fine without JavaScript.
(() => {
  const h = (tag, props = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === "class") el.className = value;
      else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
      else if (value !== false && value != null) el.setAttribute(key, value === true ? "" : value);
    }
    el.append(...children.flat().filter((child) => child != null && child !== false));
    return el;
  };
  const button = (label, onclick, primary = false) =>
    h("button", { type: "button", class: primary ? "btn btn-primary" : "btn", onclick }, label);

  /**
   * The prompt inbox: prompts are admitted to a durable inbox, then promoted into the
   * conversation at a turn boundary. Steer promotes while the agent works; queue waits
   * until it would go idle. A crash loses the running work, never the inbox.
   */
  function inbox(root) {
    const texts = ["fix the login bug", "also add a test", "then update the docs", "rename it to Session", "ship it"];
    let state;
    const reset = () => {
      state = { next: 1, inbox: [], history: [], agent: "idle", last: null, flash: null };
      say("Send a prompt. While the agent is <strong>working</strong>, try <strong>steer</strong> vs <strong>queue</strong>, then crash it.");
    };
    const status = h("p", { class: "demo-status", "aria-live": "polite" });
    const say = (html) => { status.innerHTML = html; };
    const inboxList = h("ul");
    const historyList = h("ul");
    const agent = h("span", { class: "agent" });

    const send = (mode) => {
      const prompt = { id: state.next++, text: texts[(state.next - 2) % texts.length], mode };
      state.inbox.push(prompt);
      state.last = prompt;
      if (state.agent !== "working") {
        // Idle: admitting a prompt wakes the runner, which promotes it right away.
        state.agent = "working";
        promote((p) => p === prompt);
        say(`Prompt <strong>#${prompt.id}</strong> admitted, then promoted: the agent is idle, so it starts now.`);
      } else {
        say(mode === "steer"
          ? `<strong>#${prompt.id}</strong> is in the inbox. Steer: it joins at the <strong>next turn boundary</strong>, mid-task.`
          : `<strong>#${prompt.id}</strong> is in the inbox. Queue: it waits until the agent would otherwise go <strong>idle</strong>.`);
      }
      render();
    };
    const promote = (pick) => {
      const moving = state.inbox.filter(pick);
      state.inbox = state.inbox.filter((p) => !moving.includes(p));
      state.history.push(...moving);
      return moving;
    };
    const boundary = () => {
      if (state.agent === "crashed") {
        state.agent = "idle";
        if (state.inbox.length === 0) { say("Process restarted. Nothing was waiting."); return render(); }
      }
      if (state.agent === "idle") {
        if (state.inbox.length === 0) { say("Nothing to do: the inbox is empty."); return render(); }
        state.agent = "working";
        const head = state.inbox[0];
        const [first] = promote((p) => p === head);
        say(`The agent wakes up and promotes <strong>#${first.id}</strong> from the inbox.`);
        return render();
      }
      const steered = promote((p) => p.mode === "steer");
      if (steered.length) {
        say(`Turn boundary: promoted <strong>${steered.map((p) => "#" + p.id).join(", ")}</strong> (steer). The task continues with them.`);
      } else if (state.inbox.some((p) => p.mode === "queue")) {
        const first = state.inbox.find((p) => p.mode === "queue");
        promote((p) => p === first);
        say(`The task was about to finish, so the agent promotes one queued prompt: <strong>#${first.id}</strong>.`);
      } else {
        state.agent = "idle";
        say("Turn boundary: nothing pending, so the task finishes and the agent goes <strong>idle</strong>.");
      }
      render();
    };
    const retry = () => {
      if (!state.last) { say("Send a prompt first."); return; }
      state.flash = state.last.id;
      say(`Retried <strong>#${state.last.id}</strong> with the same ID: same receipt, <strong>no duplicate</strong>.`);
      render();
      setTimeout(() => { state.flash = null; render(); }, 900);
    };
    const crash = () => {
      if (state.agent !== "working") { say("The agent isn't working, so there's nothing to lose."); return; }
      state.agent = "crashed";
      say(`Crash! The running task is gone, but <strong>${state.inbox.length}</strong> prompt(s) are still in the durable inbox. Press <strong>Next turn</strong> to restart.`);
      render();
    };

    const chip = (p) => h("li", {}, h("span", { class: `chip ${p.mode}${state.flash === p.id ? " flash" : ""}` },
      h("span", {}, `#${p.id} ${p.text}`), h("span", { class: "m" }, p.mode)));
    const render = () => {
      inboxList.replaceChildren(...state.inbox.map(chip));
      historyList.replaceChildren(...state.history.slice(-5).map(chip));
      agent.dataset.state = state.agent;
      agent.textContent = `agent: ${state.agent}`;
    };

    root.replaceChildren(
      h("div", { class: "demo-lanes" },
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "Inbox · admitted"), h("span", {}, "durable")), inboxList),
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "Conversation · model sees"), agent), historyList)),
      h("div", { class: "demo-controls" },
        button("Send (steer)", () => send("steer"), true),
        button("Send (queue)", () => send("queue")),
        button("Next turn", boundary),
        button("Retry same prompt", retry),
        button("Crash", crash),
        button("Reset", () => { reset(); render(); })),
      status);
    reset();
    render();
  }

  /**
   * Policy: ordered allow/deny statements with wildcards. The last matching statement
   * wins; nothing matching falls back to allow.
   */
  function policy(root) {
    const resources = ["*", "anthropic", "openai", "company-*"];
    const providers = ["openai", "anthropic", "company-eu"];
    let rules = [
      { effect: "deny", resource: "*" },
      { effect: "allow", resource: "anthropic" },
    ];
    let provider = "openai";
    const match = (pattern, value) => new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`).test(value);

    const list = h("ul", { class: "rules" });
    const result = h("p", { class: "demo-status", "aria-live": "polite" });
    const select = (options, value, onchange) =>
      h("select", { onchange: (e) => onchange(e.target.value) }, options.map((o) => h("option", { value: o, selected: o === value }, o)));

    const render = () => {
      const matches = rules.map((rule) => match(rule.resource, provider));
      const winner = matches.lastIndexOf(true);
      list.replaceChildren(...rules.map((rule, i) => h("li", { class: winner === i ? "win" : matches[i] ? "match" : "" },
        h("button", { type: "button", class: `effect-${rule.effect}`, title: "Toggle allow / deny",
          onclick: () => { rule.effect = rule.effect === "allow" ? "deny" : "allow"; render(); } }, rule.effect),
        "provider.use",
        select(resources, rule.resource, (v) => { rule.resource = v; render(); }),
        h("button", { type: "button", title: "Move up", disabled: i === 0,
          onclick: () => { [rules[i - 1], rules[i]] = [rules[i], rules[i - 1]]; render(); } }, "↑"),
        h("button", { type: "button", title: "Remove", onclick: () => { rules.splice(i, 1); render(); } }, "✕"),
        h("span", { class: "verdict" }, winner === i ? "wins" : matches[i] ? "matches" : "no match"))));
      const effect = winner === -1 ? "allow" : rules[winner].effect;
      result.replaceChildren(
        h("span", { class: `result ${effect}` }, `${provider}: ${effect === "allow" ? "allowed" : "denied"}`),
        " ",
        winner === -1 ? "No rule matches, so the default applies." : `Rule ${winner + 1} is the last match, so it decides.`);
    };

    root.replaceChildren(
      h("div", { class: "demo-row" }, "Can I use", select(providers, provider, (v) => { provider = v; render(); }), "?"),
      list,
      h("div", { class: "demo-controls" },
        button("Add rule", () => { rules.push({ effect: "deny", resource: "openai" }); render(); }),
        button("Reset", () => { rules = [{ effect: "deny", resource: "*" }, { effect: "allow", resource: "anthropic" }]; provider = "openai"; root.replaceChildren(); policy(root); })),
      result);
    render();
  }

  const demos = { inbox, policy };
  for (const el of document.querySelectorAll("[data-demo]")) demos[el.dataset.demo]?.(el);
})();
