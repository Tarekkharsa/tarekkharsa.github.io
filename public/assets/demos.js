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
          onclick: () => { if (!rules.includes(rule)) return; rule.effect = rule.effect === "allow" ? "deny" : "allow"; render(); } }, rule.effect),
        "provider.use",
        select(resources, rule.resource, (v) => { rule.resource = v; render(); }),
        h("button", { type: "button", title: "Move up", disabled: i === 0,
          onclick: () => { const at = rules.indexOf(rule); if (at < 1) return; [rules[at - 1], rules[at]] = [rules[at], rules[at - 1]]; render(); } }, "↑"),
        h("button", { type: "button", title: "Remove", onclick: () => { const at = rules.indexOf(rule); if (at === -1) return; rules.splice(at, 1); render(); } }, "✕"),
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

  // ---------- shared controls ----------
  const segmented = (options, value, onchange) => {
    const wrap = h("div", { class: "seg", role: "group" });
    const render = (current) =>
      wrap.replaceChildren(...options.map(([v, label]) =>
        h("button", { type: "button", class: v === current ? "on" : "", "aria-pressed": String(v === current),
          onclick: () => { render(v); onchange(v); } }, label)));
    render(value);
    return wrap;
  };
  const slider = (label, min, max, step, value, oninput, format = String) => {
    const out = h("output", {}, format(value));
    const input = h("input", { type: "range", min, max, step, value,
      oninput: (e) => { const v = Number(e.target.value); out.textContent = format(v); oninput(v); } });
    return h("label", { class: "slider" }, h("span", {}, label), input, out);
  };
  const checkbox = (label, checked, onchange) =>
    h("label", { class: "check" }, h("input", { type: "checkbox", checked, onchange: (e) => onchange(e.target.checked) }), label);
  const statusLine = (html) => { const p = h("p", { class: "demo-status", "aria-live": "polite" }); p.innerHTML = html; return p; };
  const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
  const k = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));

  /** Decide, commit, act: the same three actions against a naive handler and an outbox. */
  function outbox(root) {
    let s;
    const reset = () => {
      s = { cmd: 0, last: null,
        naive: { orders: 0, emails: 0, lost: 0, dupes: 0 },
        box: { orders: 0, emails: 0, pending: 0, seen: new Set(), dupes: 0, workerUp: true } };
    };
    const naiveOut = h("div", { class: "lane" });
    const boxOut = h("div", { class: "lane" });
    const status = statusLine("Place an order, crash halfway, then retry. Watch which side ends up in a state nobody planned.");
    const say = (html) => { status.innerHTML = html; };

    const place = (crash) => {
      const id = ++s.cmd;
      s.last = id;
      // Naive: save, then send the email in the same request.
      s.naive.orders++;
      if (crash) s.naive.lost++; else s.naive.emails++;
      // Outbox: commit the order and the intent to email in one transaction, act afterwards.
      s.box.orders++;
      s.box.seen.add(id);
      s.box.pending++;
      if (crash) s.box.workerUp = false;
      if (s.box.workerUp) { s.box.pending--; s.box.emails++; }
      say(crash
        ? `Order <strong>#${id}</strong>: crash right after saving. Naive: nothing remembers the email was owed. Outbox: the intent was committed with the order, so it's <strong>pending</strong>.`
        : `Order <strong>#${id}</strong> placed. Both sides look the same when nothing goes wrong.`);
    };
    const restart = () => {
      const ran = s.box.pending;
      s.box.workerUp = true;
      s.box.emails += s.box.pending;
      s.box.pending = 0;
      say(ran
        ? `Restarted. The outbox worker found <strong>${ran}</strong> pending effect(s) and sent the email(s). The naive side has nothing to recover from.`
        : "Restarted. Nothing was pending.");
    };
    const retry = () => {
      if (!s.last) return say("Place an order first.");
      s.naive.orders++; s.naive.emails++; s.naive.dupes++;
      s.box.dupes += 0;
      say(`The client retried command <strong>#${s.last}</strong>. Naive: a <strong>second order</strong> and a second email. Outbox: the command ID was already committed, so it returns the same receipt.`);
    };
    const lane = (title, rows) => [h("p", { class: "lane-title" }, h("span", {}, title)),
      h("ul", {}, rows.map(([label, value, bad]) => h("li", {}, h("span", { class: `chip${bad ? " bad" : ""}` }, h("span", {}, label), h("span", { class: "m" }, String(value))))))];
    const render = () => {
      naiveOut.replaceChildren(...lane("Naive: save, then email", [
        ["orders", s.naive.orders], ["emails sent", s.naive.emails],
        ["emails lost forever", s.naive.lost, s.naive.lost > 0], ["duplicate orders", s.naive.dupes, s.naive.dupes > 0]]));
      boxOut.replaceChildren(...lane("Decide · commit · act", [
        ["orders", s.box.orders], ["emails sent", s.box.emails],
        ["pending in outbox", s.box.pending], ["worker", s.box.workerUp ? "running" : "crashed", !s.box.workerUp]]));
    };
    const act = (fn) => () => { fn(); render(); };
    reset();
    root.replaceChildren(h("div", { class: "demo-lanes" }, naiveOut, boxOut),
      h("div", { class: "demo-controls" },
        button("Place order", act(() => place(false)), true),
        button("Place order, crash after save", act(() => place(true))),
        button("Restart", act(restart)),
        button("Client retries last order", act(retry)),
        button("Reset", act(() => { reset(); say("Reset."); }))),
      status);
    render();
  }

  /** Sleep-based test vs a test clock: run the same test 20 times on a noisy machine. */
  function clock(root) {
    let sleep = 100;
    const dots = (results) => h("div", { class: "dots" }, results.map((ok) => h("span", { class: ok ? "ok" : "fail", title: ok ? "pass" : "fail" })));
    const sleepLane = h("div", { class: "lane" });
    const clockLane = h("div", { class: "lane" });
    const status = statusLine("The job takes 70–150 ms depending on machine load. Run the test 20 times with each approach.");
    const run = () => {
      const durations = Array.from({ length: 20 }, () => 70 + Math.random() * 80);
      const sleepResults = durations.map((d) => d <= sleep);
      const passed = sleepResults.filter(Boolean).length;
      sleepLane.replaceChildren(h("p", { class: "lane-title" }, h("span", {}, `await sleep(${sleep})`), h("span", {}, `${passed}/20 pass`)),
        dots(sleepResults), h("p", { class: "lane-note" }, `${(20 * sleep / 1000).toFixed(1)} s spent waiting`));
      clockLane.replaceChildren(h("p", { class: "lane-title" }, h("span", {}, "TestClock.adjust + drain()"), h("span", {}, "20/20 pass")),
        dots(durations.map(() => true)), h("p", { class: "lane-note" }, "0 s spent waiting: time only moves when the test moves it"));
      status.innerHTML = passed === 20
        ? `All 20 passed this time with sleep(${sleep}), but the test now <strong>waits ${sleep} ms</strong> every run, and a slower CI machine can still break it.`
        : `The sleep test failed <strong>${20 - passed}</strong> of 20 runs with the same code. The clock test can't flake: it waits for the milestone, not the wall clock.`;
    };
    root.replaceChildren(slider("sleep(ms)", 50, 200, 10, sleep, (v) => { sleep = v; }, (v) => `${v} ms`),
      h("div", { class: "demo-lanes" }, sleepLane, clockLane),
      h("div", { class: "demo-controls" }, button("Run the test 20 times", run, true)), status);
    run();
  }

  /** Fixed dev ports vs ports derived from a hash of the worktree path. */
  function ports(root) {
    const names = ["main", "fix-login", "agent-1", "agent-2", "sync-perf", "agent-3", "docs", "agent-4"];
    const blocked = new Set([3659, 4045, 4190]); // from the Fetch spec's bad-ports list, in this range
    const hash = (text) => { let x = 0x811c9dc5; for (const c of text) { x ^= c.charCodeAt(0); x = Math.imul(x, 0x01000193) >>> 0; } return x; };
    const derive = (path) => { let p = 3000 + (hash(path) % 2000); while (blocked.has(p)) p++; return p; };
    let count = 2;
    const table = h("div");
    const status = statusLine("");
    const render = () => {
      const trees = names.slice(0, count).map((n) => `~/code/app/.worktrees/${n}`);
      const taken = new Map();
      const rows = trees.map((path, i) => {
        const fixed = i === 0 ? "3000" : "3000 · in use";
        const port = derive(path);
        const clash = taken.has(port);
        taken.set(port, path);
        return h("tr", {}, h("td", {}, h("code", {}, path.split("/").pop())), h("td", { class: i === 0 ? "" : "bad" }, fixed), h("td", { class: clash ? "bad" : "good" }, String(port)));
      });
      table.replaceChildren(h("table", { class: "demo-table" },
        h("thead", {}, h("tr", {}, h("th", {}, "worktree"), h("th", {}, "fixed port"), h("th", {}, "hash of the path"))),
        h("tbody", {}, rows)));
      status.innerHTML = `${count} worktrees: with a fixed port, <strong>${count - 1}</strong> dev server(s) can't start. Hashed ports don't depend on start order, so a restart gets the same port again. Ports browsers refuse (like 3659, 4045, 4190) are skipped.`;
    };
    root.replaceChildren(table, h("div", { class: "demo-controls" },
      button("Add a worktree", () => { count = Math.min(names.length, count + 1); render(); }, true),
      button("Restart everything", () => { render(); status.innerHTML = "Restarted: every worktree got <strong>exactly the same port</strong> as before, because it's computed from the path, not from who started first."; }),
      button("Reset", () => { count = 2; render(); })), status);
    render();
  }

  /** What a naive status badge says vs an honest one, for the same connection state. */
  function honest(root) {
    let socket = "open", config = false, age = 5;
    const out = h("div", { class: "demo-lanes" });
    const render = () => {
      const naive = socket === "open" ? ["Connected", "good"] : ["Disconnected", "bad"];
      let honestLabel, note;
      if (socket !== "open") { honestLabel = [`Offline · cached data from ${age}s ago`, "warn"]; note = "Cached data stays readable, but it's labelled as cached and can't overwrite newer data on reconnect."; }
      else if (!config) { honestLabel = ["Connecting…", "warn"]; note = "A socket opening doesn't prove the server is usable. It's not \"connected\" until the initial server config arrives."; }
      else if (age > 30) { honestLabel = [`Connected · updated ${age}s ago`, "warn"]; note = "Connection health and data freshness are separate states. This one is connected but not fresh."; }
      else { honestLabel = ["Connected", "good"]; note = "Socket open, config received, data fresh: now the badge can say it."; }
      const lies = naive[0] === "Connected" && honestLabel[0] !== "Connected";
      out.replaceChildren(
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "Naive badge"), lies ? h("span", { class: "lie" }, "lying") : null),
          h("p", { class: `badge ${naive[1]}` }, naive[0])),
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "Honest badge")), h("p", { class: `badge ${honestLabel[1]}` }, honestLabel[0]),
          h("p", { class: "lane-note" }, note)));
    };
    root.replaceChildren(
      h("div", { class: "demo-row" }, "Socket", segmented([["open", "open"], ["closed", "closed"]], socket, (v) => { socket = v; render(); }),
        checkbox("server config received", config, (v) => { config = v; render(); })),
      slider("last data", 0, 120, 5, age, (v) => { age = v; render(); }, (v) => `${v}s ago`),
      out);
    render();
  }

  /** Is this pull request workflow safe to run on a fork's PR? */
  function prcheck(root) {
    let trigger = "pull_request_target", checkout = true, scripts = true;
    const yaml = h("pre", {}, h("code"));
    const status = h("p", { class: "demo-status", "aria-live": "polite" });
    const render = () => {
      yaml.firstChild.textContent = [`on: ${trigger}`, "jobs:", "  label:", "    steps:",
        checkout ? "      - uses: actions/checkout@v4\n        with: { ref: ${{ github.event.pull_request.head.sha }} }" : "      - uses: actions/checkout@v4   # base branch",
        scripts ? "      - run: npm ci && npm test" : "      - run: git diff --numstat base...head   # read only"].join("\n");
      let verdict, cls;
      if (trigger === "pull_request") { verdict = scripts && checkout ? "Safe: a fork's PR runs with a read-only token and no secrets, so its code can't reach anything that matters." : "Safe: fork PRs get a read-only token and no secrets."; cls = "good"; }
      else if (!checkout) { verdict = "Safe: pull_request_target runs the base branch's workflow, and the PR's code never runs."; cls = "good"; }
      else if (!scripts) { verdict = "OK, with care: PR commits are fetched as passive git data only. That's the repo's rule for this job: no installs, builds, tests or caches."; cls = "warn"; }
      else { verdict = "Pwn request: pull_request_target has a write token and your secrets, and now it runs the PR author's code. Any fork can take over the repo."; cls = "bad"; }
      status.innerHTML = `<span class="result ${cls === "good" ? "allow" : cls === "bad" ? "deny" : "warn"}">${cls === "good" ? "safe" : cls === "bad" ? "unsafe" : "careful"}</span> ${verdict}`;
    };
    root.replaceChildren(
      h("div", { class: "demo-row" }, "Trigger", segmented([["pull_request", "pull_request"], ["pull_request_target", "pull_request_target"]], trigger, (v) => { trigger = v; render(); })),
      h("div", { class: "demo-row" }, checkbox("check out the PR's code", checkout, (v) => { checkout = v; render(); }),
        checkbox("run its scripts", scripts, (v) => { scripts = v; render(); })),
      yaml, status);
    render();
  }

  /** pkill -f by pattern vs killing the port owner you verified. */
  function killpattern(root) {
    const initial = () => [
      { pid: 4101, cmd: "node agent.js --cwd ~/wt/feature-a", who: "you (the agent)" },
      { pid: 4102, cmd: "vite --port 5733", cwd: "~/wt/feature-a", who: "your dev server" },
      { pid: 5201, cmd: "vite --port 5791", cwd: "~/wt/feature-b", who: "another agent's dev server" },
      { pid: 3001, cmd: "app --data ~/.app/userdata", who: "the developer's live app" },
    ];
    let procs = initial();
    const table = h("div");
    const status = statusLine("Your dev server is stuck. Pick a way to stop it.");
    const render = () => table.replaceChildren(h("table", { class: "demo-table" },
      h("thead", {}, h("tr", {}, h("th", {}, "pid"), h("th", {}, "command (argv)"), h("th", {}, "owner"))),
      h("tbody", {}, procs.map((p) => h("tr", { class: p.dead ? "dead" : "" }, h("td", {}, String(p.pid)),
        h("td", {}, h("code", {}, p.cmd + (p.cwd ? `   (cwd ${p.cwd})` : ""))), h("td", {}, p.dead ? `killed · ${p.who}` : p.who))))));
    const kill = (match, label, note) => {
      procs = initial();
      const hit = procs.filter(match);
      hit.forEach((p) => { p.dead = true; });
      render();
      status.innerHTML = `<code>${label}</code> killed: ${hit.map((p) => `<strong>${p.who}</strong>`).join(", ")}. ${note}`;
    };
    root.replaceChildren(table, h("div", { class: "demo-controls" },
      button("pkill -f feature-a", () => kill((p) => p.cmd.includes("feature-a"), "pkill -f feature-a",
        "<code>-f</code> matches the command line, not the working directory. Your agent's argv contains the worktree path; the stuck server's doesn't. You killed yourself and the server is still running.")),
      button("pkill -f vite", () => kill((p) => p.cmd.includes("vite"), "pkill -f vite",
        "It matched every Vite on the machine, including another agent's.")),
      button("kill the owner of :5733, after checking its cwd", () => kill((p) => p.pid === 4102, "kill 4102",
        "Found the process listening on your port, confirmed its working directory is your worktree, and killed only that."), true),
      button("Reset", () => { procs = initial(); render(); status.textContent = "Reset."; })), status);
    render();
  }

  /** How many files an entry point drags in, against a budget. */
  function imports(root) {
    let path = "barrel", typeForm = "import type";
    const out = h("div");
    const render = () => {
      // The barrel's graph already includes the narrow file, so either way through the barrel is 106.
      const total = path === "barrel" || typeForm !== "import type" ? 106 : 1;
      const ok = total <= 15;
      out.replaceChildren(
        h("pre", {}, h("code", {}, [
          path === "barrel" ? 'import { reduceLaneSnapshot } from "@scope/agent-core"' : 'import { reduceLaneSnapshot } from "@scope/agent-core/harness/reducer"',
          typeForm === "import type" ? 'import type { LaneSnapshot } from "@scope/agent-core"' : 'import { type LaneSnapshot } from "@scope/agent-core"',
        ].join("\n"))),
        h("div", { class: "meter" }, h("span", { class: ok ? "fill ok" : "fill over", style: `width:${Math.min(100, total / 106 * 100)}%` }),
          h("span", { class: "mark", style: `left:${15 / 106 * 100}%`, title: "budget" })),
        statusLine(`<strong>${total} file${total === 1 ? "" : "s"}</strong> evaluated · budget 15 · <span class="result ${ok ? "allow" : "deny"}">${ok ? "check passes" : "check fails at commit"}</span>` +
          (path === "subpath" && typeForm !== "import type" ? "<br>The narrow import is undone by one line: <code>import { type X }</code> isn't type-only, so it still loads the barrel." : "") +
          (path === "barrel" ? "<br>One 6 KB function, 106 files, because the index re-exports everything." : "")));
    };
    root.replaceChildren(
      h("div", { class: "demo-row" }, "Value import", segmented([["barrel", "through the barrel"], ["subpath", "narrow subpath"]], path, (v) => { path = v; render(); })),
      h("div", { class: "demo-row" }, "Type import", segmented([["import type", "import type { X }"], ["inline", "import { type X }"]], typeForm, (v) => { typeForm = v; render(); })),
      out);
    render();
  }

  /** A session as an append-only tree; the model's context is a projection of the active branch. */
  function sessiontree(root) {
    let entries, leaf, selected, next;
    const texts = ["also add a test", "use the new API instead", "rename it to Session", "now update the docs"];
    const reset = () => {
      next = 1; entries = []; leaf = null; selected = null;
      add("user", "fix the login bug"); add("assistant", "found it in auth.ts"); add("user", "also handle expired tokens"); add("assistant", "done, tests pass");
    };
    const add = (type, text, extra = {}) => { const e = { id: `e${next++}`, parent: leaf, type, text, ...extra }; entries.push(e); leaf = e.id; return e; };
    const byId = (id) => entries.find((e) => e.id === id);
    const path = () => { const p = []; for (let e = byId(leaf); e; e = byId(e.parent)) p.unshift(e); return p; };
    const projection = () => {
      const p = path();
      const ci = p.map((e) => e.type).lastIndexOf("compaction");
      let selectedEntries = p;
      if (ci >= 0) {
        const c = p[ci];
        const keptFrom = p.findIndex((e) => e.id === c.firstKept);
        selectedEntries = [c, ...p.slice(keptFrom, ci), ...p.slice(ci + 1)];
      }
      const hidden = new Set(p.filter((e) => e.type === "context_edit").map((e) => e.target));
      return selectedEntries.filter((e) => e.type !== "context_edit" && !hidden.has(e.id));
    };
    const treeEl = h("div", { class: "tree" });
    const ctxEl = h("ol", { class: "ctx" });
    const status = statusLine("Click an entry to select it. Nothing you do here deletes an entry.");
    const say = (html) => { status.innerHTML = html; };
    const render = () => {
      const onPath = new Set(path().map((e) => e.id));
      const children = (id) => entries.filter((e) => e.parent === id);
      const node = (e, depth) => [h("button", { type: "button", class: `node ${e.type}${onPath.has(e.id) ? " active" : ""}${selected === e.id ? " sel" : ""}${e.id === leaf ? " leaf" : ""}`,
        style: `margin-left:${depth * 1.1}rem`, onclick: () => { selected = e.id; render(); } },
        h("span", { class: "m" }, e.type === "context_edit" ? "edit" : e.type), e.text), ...children(e.id).flatMap((c) => node(c, children(e.id).length > 1 ? depth + 1 : depth))];
      treeEl.replaceChildren(...children(null).flatMap((e) => node(e, 0)));
      ctxEl.replaceChildren(...projection().map((e) => h("li", { class: e.type }, e.type === "compaction" ? `[summary] ${e.text}` : `${e.type}: ${e.text}`)));
    };
    const act = (fn) => () => { fn(); render(); };
    reset();
    root.replaceChildren(
      h("div", { class: "demo-lanes" },
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "Session file · append-only"), h("span", {}, "leaf ●")), treeEl),
        h("div", { class: "lane" }, h("p", { class: "lane-title" }, h("span", {}, "What the model sees")), ctxEl)),
      h("div", { class: "demo-controls" },
        button("Send a message", act(() => { const t = texts[(next / 2 | 0) % texts.length]; add("user", t); add("assistant", "ok, done"); say(`Two new entries appended after the leaf.`); }), true),
        button("Branch from selected", act(() => {
          const e = byId(selected);
          if (!e) return say("Select an entry first.");
          leaf = e.id; add("user", "try a different approach"); add("assistant", "alternative done");
          say(`New branch from <strong>${e.text}</strong>. The old branch is still in the file, just not on the active path.`);
        })),
        button("Compact", act(() => {
          const p = path().filter((e) => e.type !== "context_edit" && e.type !== "compaction");
          if (p.length < 4) return say("Not enough history to compact.");
          const kept = p[p.length - 2];
          add("compaction", `earlier work summarized (${p.length - 2} entries)`, { firstKept: kept.id });
          say("A compaction entry was appended. It stores a summary and <strong>firstKeptEntryId</strong>; the older entries are still in the file, the model just sees the summary instead.");
        })),
        button("Hide selected from context", act(() => {
          const e = byId(selected);
          if (!e || !["user", "assistant"].includes(e.type)) return say("Select a user or assistant entry first.");
          add("context_edit", `hide "${e.text}"`, { target: e.id });
          say(`A <strong>context_edit</strong> entry hides it from future model context. The original entry is untouched, and branching from before the edit brings it back.`);
        })),
        button("Reset", act(() => { reset(); say("Reset."); }))),
      status);
    render();
  }

  /** An edit tool that matches exactly, then fuzzily, and refuses ambiguity. */
  function edittool(root) {
    const file = [
      "const greeting = \u201cHello\u201d;",
      "function login(user) {",
      "  return check(user);",
      "}",
      "function logout(user) {",
      "  return check(user);",
      "}",
    ].join("\n");
    const calls = {
      exact: { label: "exact & unique", edits: [["function login(user) {", "function login(user, opts) {"]] },
      quotes: { label: "straight quotes", edits: [['const greeting = "Hello";', 'const greeting = "Hi";']] },
      dupe: { label: "appears twice", edits: [["  return check(user);", "  return verify(user);"]] },
      overlap: { label: "overlapping", edits: [["function login(user) {\n  return check(user);", "function login(u) {\n  return check(u);"], ["  return check(user);\n}\nfunction logout", "  return check(user);\n}\n\nfunction logout"]] },
      missing: { label: "not in the file", edits: [["function signup(", "function register("]] },
    };
    const norm = (t) => t.normalize("NFKC").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n")
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u2010-\u2015\u2212]/g, "-").replace(/[\u00A0\u2002-\u200A\u202F\u205F\u3000]/g, " ");
    const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; } return n; };
    const apply = (edits) => {
      const fuzzy = edits.some(([o]) => !file.includes(o));
      const base = fuzzy ? norm(file) : file;
      const matched = [];
      for (const [i, [o, n]] of edits.entries()) {
        const at = base.indexOf(fuzzy ? norm(o) : o);
        if (at === -1) return { error: `Could not find edits[${i}] in app.ts. The oldText must match the file exactly.` };
        const c = count(base, fuzzy ? norm(o) : o);
        if (c > 1) return { error: `Found ${c} occurrences of edits[${i}] in app.ts. Each oldText must be unique. Please provide more context to make it unique.` };
        matched.push({ i, at, len: (fuzzy ? norm(o) : o).length, n });
      }
      matched.sort((a, b) => a.at - b.at);
      for (let j = 1; j < matched.length; j++) if (matched[j - 1].at + matched[j - 1].len > matched[j].at)
        return { error: `edits[${matched[j - 1].i}] and edits[${matched[j].i}] overlap in app.ts. Merge them into one edit or target disjoint regions.` };
      let out = base;
      for (const m of [...matched].reverse()) out = out.slice(0, m.at) + m.n + out.slice(m.at + m.len);
      if (fuzzy) { // copy untouched lines back from the original, byte for byte
        const orig = file.split("\n"), b = base.split("\n"), o = out.split("\n");
        if (o.length === b.length) out = o.map((line, li) => (line === b[li] ? orig[li] : line)).join("\n");
      }
      return { out, fuzzy };
    };
    const view = h("pre", { class: "file" }, h("code"));
    const status = h("p", { class: "demo-status", "aria-live": "polite" });
    const show = (key) => {
      const r = apply(calls[key].edits);
      const before = file.split("\n");
      const lines = (r.out ?? file).split("\n");
      view.firstChild.replaceChildren(...lines.map((l, i) => h("span", { class: `ln${r.out && l !== before[i] ? " changed" : ""}` }, l + "\n")));
      status.innerHTML = r.error
        ? `<span class="result deny">rejected</span> ${r.error.replace(/</g, "&lt;")}`
        : `<span class="result allow">applied</span> ${r.fuzzy ? "No exact match, so it matched on normalized text (curly quotes → straight). Only the touched line was rewritten; every other line kept its original bytes." : "Exact, unique match. One line changed."}`;
    };
    const calm = statusLine("A model sends one of these edit calls to <code>app.ts</code>:");
    root.replaceChildren(calm,
      h("div", { class: "demo-row" }, segmented(Object.entries(calls).map(([key, c]) => [key, c.label]), "exact", show)),
      view, status,
      h("p", { class: "lane-note" }, "Two calls on the same file at once wait in one queue, keyed by the file's real path. Calls on different files run in parallel."));
    show("exact");
  }

  /** Differential rendering: what gets rewritten for each kind of change, and what forces a full redraw. */
  function redraw(root) {
    let lines, written = 0, full = 0;
    const reset = () => { lines = ["$ fix the flaky test", "Reading test/sync.test.ts", "Found a sleep(100) on line 42", "Editing test/sync.test.ts", "Running the test", "1 passed", "Done. Anything else?", "> "]; written = 0; full = 0; };
    const screen = h("pre", { class: "term" });
    const status = statusLine("");
    const paint = (from, isFull, note) => {
      screen.replaceChildren(...lines.map((l, i) => h("span", { class: `tl${i >= from ? " painted" : ""}` }, l + "\n")));
      written += lines.length - from;
      if (isFull) full++;
      status.innerHTML = `${note}<br><strong>${lines.length - from}</strong> line(s) rewritten this frame · <strong>${written}</strong> in total · full redraws: <strong>${full}</strong>`;
    };
    root.replaceChildren(screen, h("div", { class: "demo-controls" },
      button("Type a character", () => { lines[lines.length - 1] += "y"; paint(lines.length - 1, false, "Only the last line changed, so only it is rewritten, inside one synchronized-output frame."); }, true),
      button("Change line 3", () => { lines[2] = "Found sleep(100) on line 42 and line 57"; paint(2, false, "Rendering rewrites from the first changed line to the end, never the lines above it."); }),
      button("Resize the terminal", () => { paint(0, true, "Width changed: wrapping changes everywhere, so this one needs a full redraw. It's counted, and tests assert it doesn't happen when it shouldn't."); }),
      button("Phone keyboard opens", () => { paint(lines.length, false, "On Termux the keyboard changes the terminal height. A full redraw here would replay the whole history, so it's skipped."); }),
      button("Reset", () => { reset(); paint(0, false, "Reset."); written = 0; full = 0; })), status);
    reset();
    paint(0, false, "Initial render: every line is written once.");
    written = lines.length;
  }

  /** Rewriting the system prompt each turn vs freezing it and appending updates. */
  function cache(root) {
    let mode = "freeze", turns;
    const SYSTEM = 3000, TURN = 400, UPDATE = 40;
    const reset = () => { turns = []; };
    const table = h("div");
    const status = statusLine("");
    const next = (changed) => {
      const prev = turns.at(-1);
      const prefixBefore = prev ? prev.total : 0;
      const extra = mode === "freeze" && changed ? UPDATE : 0;
      const total = (prev ? prev.total : SYSTEM) + TURN + extra;
      // Rewrite mode re-renders the system prompt (it includes the time), so nothing before the change is reusable.
      const cached = mode === "freeze" ? prefixBefore : 0;
      turns.push({ total, cached, sent: total - cached, changed });
      render();
    };
    const render = () => {
      const max = Math.max(1, ...turns.map((t) => t.total));
      table.replaceChildren(...turns.map((t, i) => h("div", { class: "cache-row" }, h("span", { class: "lbl" }, `turn ${i + 1}${t.changed ? " · branch changed" : ""}`),
        h("span", { class: "cbar" }, h("span", { class: "hit", style: `width:${t.cached / max * 100}%` }), h("span", { class: "miss", style: `width:${t.sent / max * 100}%` })),
        h("span", { class: "num" }, `${k(t.sent)} new`))));
      const sent = turns.reduce((a, t) => a + t.sent, 0), all = turns.reduce((a, t) => a + t.total, 0);
      status.innerHTML = turns.length
        ? `${mode === "freeze" ? "Frozen baseline" : "Rewritten every turn"}: <strong>${k(sent)}</strong> of ${k(all)} tokens paid at full price (${Math.round((1 - sent / all) * 100)}% served from the provider's cache). <span class="legend"><span class="hit"></span>cached <span class="miss"></span>re-sent</span>`
        : "Press Next turn. The system prompt is 3k tokens; each turn adds 400.";
    };
    root.replaceChildren(
      h("div", { class: "demo-row" }, segmented([["rewrite", "re-render system prompt each turn"], ["freeze", "freeze it, append updates"]], mode, (v) => { mode = v; reset(); render(); })),
      table, h("div", { class: "demo-controls" }, button("Next turn", () => next(false), true), button("Branch changes, next turn", () => next(true)), button("Reset", () => { reset(); render(); })), status);
    reset(); render();
  }

  /** One limit per tool result: whichever of 2,000 lines or 50 KB comes first. */
  function bound(root) {
    let lines = 5000, width = "short";
    const out = h("div");
    const MAX_LINES = 2000, MAX_BYTES = 50 * 1024, MARKER = 75;
    const render = () => {
      const perLine = width === "short" ? 41 : width === "long" ? 161 : 81; // emoji lines: 20 four-byte chars + newline
      const bytes = lines * perLine;
      let model, verdict;
      if (lines <= MAX_LINES && bytes <= MAX_BYTES) { model = { head: lines, tail: 0, bytes }; verdict = "Under both limits: the model sees the output unchanged."; }
      else {
        const sampled = Math.min(lines, MAX_LINES - 4), budget = MAX_BYTES - MARKER - 4;
        if (sampled * perLine <= budget) { model = { head: Math.ceil(sampled / 2), tail: Math.floor(sampled / 2), bytes: sampled * perLine + MARKER }; verdict = `Line limit hit first (${lines.toLocaleString()} lines > 2,000).`; }
        else { const half = Math.floor(budget / 2 / perLine); model = { head: half, tail: half, bytes: half * 2 * perLine + MARKER }; verdict = `Byte limit hit first (${kb(bytes)} > 50 KB), even though it's ${lines <= MAX_LINES ? "under" : "over"} 2,000 lines.`; }
      }
      const truncated = model.tail > 0;
      out.replaceChildren(
        h("div", { class: "meter split" }, h("span", { class: "fill ok", style: `width:${truncated ? 18 : 100}%` }),
          truncated ? h("span", { class: "gap" }, "…") : null, truncated ? h("span", { class: "fill ok", style: "width:18%" }) : null),
        statusLine(`${verdict}<br>Model sees: <strong>${model.head.toLocaleString()}</strong>${truncated ? ` first lines + a marker + the last <strong>${model.tail.toLocaleString()}</strong>` : " lines"} (${kb(model.bytes)} of ${kb(bytes)}).` +
          (truncated ? `<br><code>... output truncated; full content saved to &lt;data dir&gt;/tool-output/tool_01J… ...</code>` : "")));
    };
    root.replaceChildren(slider("output", 10, 20000, 10, lines, (v) => { lines = v; render(); }, (v) => `${v.toLocaleString()} lines`),
      h("div", { class: "demo-row" }, "Line width", segmented([["short", "40 chars"], ["long", "160 chars"], ["emoji", "20 emoji"]], width, (v) => { width = v; render(); })), out);
    render();
  }

  /** Compact before the request stops fitting; keep recent turns verbatim. */
  function compaction(root) {
    let windowSize = 200_000, fail = false, history, summary;
    const SYSTEM = 12_000, REPLY = 32_000, BUFFER = 20_000, KEEP = 8_000, SUMMARY = 2_000;
    const reset = () => { history = [3000, 4000, 25000, 3000]; summary = 0; };
    const bar = h("div", { class: "ctxbar" });
    const status = statusLine("");
    const limit = () => windowSize - Math.max(REPLY, BUFFER);
    const total = () => SYSTEM + summary + history.reduce((a, b) => a + b, 0);
    const render = (note) => {
      const scale = (n) => `${n / windowSize * 100}%`;
      bar.replaceChildren(...[
        h("span", { class: "cseg sys", style: `width:${scale(SYSTEM)}`, title: "system + tools" }),
        summary ? h("span", { class: "cseg sum", style: `width:${scale(summary)}`, title: "summary" }) : null,
        ...history.map((t) => h("span", { class: "cseg turn", style: `width:${scale(Math.min(t, windowSize))}`, title: `${k(t)} tokens` })),
        h("span", { class: "limit", style: `left:${scale(limit())}`, title: "window - reply room" }),
      ].filter(Boolean));
      status.innerHTML = `${note ?? ""}${note ? "<br>" : ""}Request: <strong>${k(total())}</strong> · fits up to <strong>${k(limit())}</strong> (${k(windowSize)} window − ${k(Math.max(REPLY, BUFFER))} reply room). <span class="legend"><span class="sys"></span>system <span class="sum"></span>summary <span class="turn"></span>turns</span>`;
    };
    const turn = (size) => {
      history.push(size);
      if (total() <= limit()) return render(`Added a ${k(size)}-token turn. Still fits, so the call goes ahead unchanged.`);
      if (fail) { history.pop(); return render("Over the limit, so it tried to compact first, but the summary call <strong>failed</strong>. Nothing was cut over: the stored history is untouched and the turn waits."); }
      let kept = 0, split = history.length;
      for (let i = history.length - 1; i >= 0 && kept + history[i] <= KEEP; i--) { kept += history[i]; split = i; }
      const summarized = history.slice(0, split).reduce((a, b) => a + b, 0);
      history = history.slice(split);
      const merged = summary > 0;
      summary = SUMMARY;
      render(`Over the limit <em>before</em> calling the model, so it compacted first: ${k(summarized)} tokens of older turns ${merged ? "merged with the previous summary " : ""}became a ${k(SUMMARY)}-token summary, and the newest ${k(kept)} tokens stay word for word.`);
    };
    reset();
    root.replaceChildren(
      h("div", { class: "demo-row" }, "Model window", segmented([[128_000, "128k"], [200_000, "200k"], [1_000_000, "1M"]], windowSize, (v) => { windowSize = v; reset(); render("Reset for the new window."); }),
        checkbox("summary call fails", fail, (v) => { fail = v; })),
      bar,
      h("div", { class: "demo-controls" }, button("Small turn (+3k)", () => turn(3000), true), button("Huge tool output (+40k)", () => turn(40000)), button("Reset", () => { reset(); render("Reset."); })),
      status);
    render();
  }

  /** Built-in features as replaceable plugins. */
  function replaceable(root) {
    let installed = false;
    const out = h("div");
    const render = () => {
      out.replaceChildren(h("table", { class: "demo-table" },
        h("thead", {}, h("tr", {}, h("th", {}, "feature"), h("th", {}, "built-in"), h("th", {}, "who handles it"))),
        h("tbody", {}, [["/mcp", true], ["codemode", true], ["tool_search", true], ["llama.cpp", false]].map(([name, replaceable]) => {
          const taken = installed && name === "/mcp";
          return h("tr", {}, h("td", {}, h("code", {}, name)), h("td", {}, replaceable ? "replaceable" : "built-in"),
            h("td", { class: taken ? "good" : "" }, taken ? "your-mcp-plugin (built-in stepped aside)" : "built-in extension"));
        }))),
        statusLine(installed
          ? "The third-party plugin registered <code>/mcp</code>, so the built-in MCP support doesn't read its config or connect servers. Uninstall it and the built-in comes back."
          : "All four ship in the product, built on the same extension API a third party gets."));
    };
    root.replaceChildren(h("div", { class: "demo-controls" }, button("Install a third-party MCP plugin", () => { installed = true; render(); }, true), button("Uninstall it", () => { installed = false; render(); })), out);
    render();
  }

  const demos = { inbox, policy, outbox, clock, ports, honest, prcheck, killpattern, imports, sessiontree, edittool, redraw, cache, bound, compaction, replaceable };
  for (const el of document.querySelectorAll("[data-demo]")) demos[el.dataset.demo]?.(el);
})();
