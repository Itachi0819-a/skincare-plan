(function () {
  const root = document.getElementById("app");

  const state = {
    data: null,
    kind: "normal",
    day: new Date().getDay(),
    spot: "pus",
    invFilter: "active",
    checks: {},
    saved: true,
  };

  function todayKey(prefix) {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${prefix || "skin-check-"}${d.getFullYear()}-${m}-${dd}`;
  }

  function loadChecks(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveChecks() {
    const key = todayKey(state.data.checkoff && state.data.checkoff.storage_prefix);
    try {
      localStorage.setItem(key, JSON.stringify(state.checks));
      state.saved = true;
    } catch {
      state.saved = false;
    }
  }

  function clearChecks() {
    const key = todayKey(state.data.checkoff && state.data.checkoff.storage_prefix);
    state.checks = {};
    try {
      localStorage.removeItem(key);
      state.saved = true;
    } catch {
      state.saved = false;
    }
    render();
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matchesStep(step, kind, focus) {
    if (step.only_kinds && !step.only_kinds.includes(kind)) return false;
    if (step.except_kinds && step.except_kinds.includes(kind)) return false;
    if (step.only_focus && !step.only_focus.includes(focus)) return false;
    if (step.except_focus && step.except_focus.includes(focus)) return false;
    return true;
  }

  function resolveStep(step, kind) {
    const variant = (step.variants && (step.variants[kind] || step.variants.default)) || {};
    return {
      id: step.id,
      title: variant.title || step.title || "",
      detail: variant.detail || step.detail || "",
    };
  }

  function buildSteps(list, kind, focus) {
    return (list || [])
      .filter((s) => matchesStep(s, kind, focus))
      .map((s) => resolveStep(s, kind));
  }

  function focusOf(day) {
    const f = state.data.focus[String(day)] || { id: "plain", label: "" };
    return f;
  }

  function renderSteps(steps) {
    return `<ol class="steps">${steps
      .map(
        (s, i) =>
          `<li><span class="num">${i + 1}</span><div><strong>${esc(s.title)}</strong><p>${esc(
            s.detail
          )}</p></div></li>`
      )
      .join("")}</ol>`;
  }

  function filterInventory() {
    const inv = state.data.inventory || [];
    const f = (state.data.inventory_filters || []).find((x) => x.id === state.invFilter) || {};
    return inv.filter((item) => {
      if (f.statuses && !f.statuses.includes(item.status)) return false;
      if (f.kinds && !f.kinds.includes(item.kind)) return false;
      return true;
    });
  }

  function countStatus(statuses) {
    return (state.data.inventory || []).filter((x) => statuses.includes(x.status)).length;
  }

  function badgeClass(status) {
    const map = state.data.inventory_status_tones || {};
    return map[status] || "neutral";
  }

  function toc() {
    const items = [
      ["today", "今天怎么做"],
      ["check", "今日打卡"],
      ["week", "一周安排"],
      ["spot", "痘痘处理"],
      ["inv", "我的药和护肤品"],
      ["combo", "哪些能一起用"],
      ["adjust", "开始和调整"],
      ["buy", "补货规则"],
      ["note", "依据和提醒"],
    ];
    return `<nav class="toc">${items
      .map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`)
      .join("")}</nav>`;
  }

  function render() {
    const d = state.data;
    if (!d) return;
    const realDay = new Date().getDay();
    const days = d.weekdays || [];
    const kind = state.kind;
    const day = state.day;
    const focus = focusOf(day);
    const am = buildSteps(d.am_steps, kind, focus.id);
    const pm = buildSteps(d.pm_steps, kind, focus.id);
    const todayAm = buildSteps(d.am_steps, kind, focusOf(realDay).id);
    const todayPm = buildSteps(d.pm_steps, kind, focusOf(realDay).id);
    const total = todayAm.length + todayPm.length;
    const done = [...todayAm, ...todayPm].filter((x) => state.checks[x.id]).length;

    const dayOptions = days
      .map((name, i) => {
        const label = i === realDay ? `${name}（今天）` : name;
        return `<option value="${i}"${i === day ? " selected" : ""}>${esc(label)}</option>`;
      })
      .join("");

    const seg = (d.day_types || [])
      .map(
        (t) =>
          `<button type="button" data-kind="${esc(t.id)}" aria-pressed="${
            kind === t.id
          }">${esc(t.label)}</button>`
      )
      .join("");

    const weekRows = [1, 2, 3, 4, 5, 6, 0]
      .map((di) => {
        const f = focusOf(di);
        const name = days[di] || "";
        const label = di === realDay ? `${name}（今天）` : name;
        const chin = f.id === "rest" ? "休息" : "阿达帕林";
        const other =
          f.id === "sa"
            ? "鼻子水杨酸"
            : f.id === "retinol"
            ? "脸颊额头 A醇"
            : f.id === "rest"
            ? "只保湿，可敷面膜"
            : "只保湿";
        const cls = di === realDay ? "today-cell" : "";
        return `<tr><td class="${cls}">${esc(label)}</td><td>壬二酸＋防晒</td><td>${esc(
          chin
        )}</td><td>${esc(other)}</td></tr>`;
      })
      .join("");

    const spots = d.spots || [];
    const spot = spots.find((s) => s.id === state.spot) || spots[0] || { items: [], label: "" };
    const spotChips = spots
      .map(
        (s) =>
          `<button type="button" data-spot="${esc(s.id)}" aria-pressed="${
            s.id === (spot.id || state.spot)
          }">${esc(s.label)}</button>`
      )
      .join("");
    const spotProps = (spot.items || [])
      .map((it) => `<div class="prop"><dt>${esc(it.label)}</dt><dd>${esc(it.value)}</dd></div>`)
      .join("");

    const filters = (d.inventory_filters || [])
      .map(
        (f) =>
          `<button type="button" data-inv="${esc(f.id)}" aria-pressed="${
            f.id === state.invFilter
          }">${esc(f.label)}</button>`
      )
      .join("");

    const invShown = filterInventory();
    const invHtml = invShown
      .map((x) => {
        return `<article class="inv-card">
          <div class="inv-head">
            <div>
              <div class="kind-tag">${esc(x.kind)}</div>
              <strong>${esc(x.name)}</strong>
            </div>
            <span class="badge ${badgeClass(x.status)}">${esc(x.status)}</span>
          </div>
          <p class="detail">作用：${esc(x.role)}｜什么时候：${esc(x.when)}｜涂哪：${esc(
          x.where
        )}｜别和：${esc(x.avoid)}</p>
          <p class="meta">最近购买：${esc(x.buy)}｜来源：${esc(x.src)}</p>
        </article>`;
      })
      .join("");

    const comboRows = (d.combos || [])
      .map(
        (c) =>
          `<tr><td>${esc(c.pair)}</td><td><span class="pill ${esc(c.ok)}">${esc(
            c.ok
          )}</span></td><td>${esc(c.how)}</td></tr>`
      )
      .join("");

    const adjust = (d.adjustments || [])
      .map(
        (s, i) =>
          `<li><span class="num">${i + 1}</span><div><strong>${esc(s.title)}</strong><p>${esc(
            s.detail
          )}</p></div></li>`
      )
      .join("");

    const restockRows = (d.restock || [])
      .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.paid)}</td><td>${esc(p.note)}</td></tr>`)
      .join("");

    const restockRules = (d.restock_rules || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const consider = (d.consider_buying || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const unverified = (d.unverified || [])
      .map((x) => `<li><strong>${esc(x.item)}</strong>：${esc(x.issue)}</li>`)
      .join("");
    const safety = (d.safety_rules || [])
      .map((x) => `<li><strong>${esc(x.rule)}</strong>：${esc(x.detail)}</li>`)
      .join("");
    const profileBits = [
      d.profile && d.profile.sex,
      d.profile && d.profile.skin_tone ? `肤色${d.profile.skin_tone}` : "",
      d.profile && d.profile.skin_type,
    ]
      .filter(Boolean)
      .join(" · ");
    const concerns = ((d.profile && d.profile.concerns) || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const medicalItems = ((d.profile && d.profile.medical) || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const medicalBlock = medicalItems ? `<p>用药提醒：</p><ul class="plain">${medicalItems}</ul>` : "";
    const prefs = (d.preferences || []).map((x) => `<li>${esc(x)}</li>`).join("");

    const checkItems = [
      ...todayAm.map((x) => ({ ...x, prefix: "早" })),
      ...todayPm.map((x) => ({ ...x, prefix: "晚" })),
    ]
      .map((x) => {
        const on = !!state.checks[x.id];
        return `<label class="check${on ? " done" : ""}">
          <input type="checkbox" data-check="${esc(x.id)}" ${on ? "checked" : ""}>
          <span>${esc(x.prefix)} · ${esc(x.title)}</span>
        </label>`;
      })
      .join("");

    const raw = (d.links && d.links.raw_data) || "data.json";
    const repo = (d.links && d.links.repo) || "";

    root.innerHTML = `
      <div class="wrap">
        <header class="hero">
          <h1>${esc(d.title || "我的护肤方案")}</h1>
          <p class="summary">${esc(d.summary || "")}</p>
          <div class="meta-row">
            <span>更新于 ${esc(d.last_updated || "")}</span>
            <a href="data.json">原始数据 data.json</a>
            ${repo ? `<a href="${esc(repo)}">GitHub 仓库</a>` : ""}
          </div>
        </header>

        <div class="sticky-controls">
          <div class="seg" id="kind-seg">${seg}</div>
          <div class="controls-row">
            <label>星期（默认今天）
              <select id="day-select">${dayOptions}</select>
            </label>
          </div>
        </div>

        ${toc()}

        <section class="block" id="today">
          <h2>今天怎么做</h2>
          <h3>早上 · ${esc(days[day] || "")}</h3>
          ${renderSteps(am)}
          <h3>晚上 · ${esc(days[day] || "")} · ${esc(focus.label)}</h3>
          ${renderSteps(pm)}
          <div class="callout"><div class="lead">一句话记住</div><p>${esc(d.one_liner || "")}</p></div>
        </section>

        <section class="block" id="check">
          <h2>今日打卡</h2>
          <p class="caption">${esc((d.checkoff && d.checkoff.caption) || "")}</p>
          <div class="metrics">
            <div class="metric ${done === total && total ? "success" : ""}">
              <b>${done}/${total}</b>
              <span>${esc(days[realDay] || "")}已完成</span>
            </div>
          </div>
          <div class="checks">${checkItems}</div>
          <button type="button" class="quiet" id="clear-checks">清空今天的勾选</button>
          ${state.saved ? "" : "<p class=\"caption\">这个浏览器不允许本地保存，勾选只在本次打开期间有效。</p>"}
        </section>

        <section class="block" id="week">
          <h2>一周安排</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>早上</th><th>晚上：下巴嘴周</th><th>晚上：其他区域</th></tr></thead>
              <tbody>${weekRows}</tbody>
            </table>
          </div>
          <p class="caption">${esc(d.week_notes || "")}</p>
        </section>

        <section class="block" id="spot">
          <h2>痘痘处理：点你现在的那种</h2>
          <div class="chips" id="spot-chips">${spotChips}</div>
          <div class="props">${spotProps}</div>
          <div class="callout warning">
            <div class="lead">${esc((d.red_flag && d.red_flag.lead) || "")}</div>
            <p>${esc((d.red_flag && d.red_flag.text) || "")}</p>
          </div>
          <p class="caption">${esc(d.spot_safety_note || "")}</p>
        </section>

        <section class="block" id="inv">
          <h2>我的药和护肤品</h2>
          <p class="caption">${esc(d.inventory_caption || "")} 共 ${d.inventory.length} 样。</p>
          <div class="metrics four">
            <div class="metric"><b>${countStatus(["在用"])}</b><span>在用</span></div>
            <div class="metric"><b>${countStatus(["部分剩余", "存货待用完"])}</b><span>剩余待用完</span></div>
            <div class="metric warning"><b>${countStatus(["待确认"])}</b><span>待确认</span></div>
            <div class="metric"><b>${countStatus(["收起不用", "已停用", "已用完", "应急备用"])}</b><span>备用或不用</span></div>
          </div>
          <div class="chips" id="inv-chips">${filters}</div>
          ${invHtml || "<p class=\"caption\">这一栏没有条目。</p>"}
        </section>

        <section class="block" id="combo">
          <h2>哪些能一起用</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>组合</th><th>能否</th><th>怎么用</th></tr></thead>
              <tbody>${comboRows}</tbody>
            </table>
          </div>
          <p class="caption">${esc(d.combo_note || "")}</p>
        </section>

        <section class="block" id="adjust">
          <h2>开始和调整</h2>
          <ol class="steps">${adjust}</ol>
        </section>

        <section class="block" id="buy">
          <h2>补货规则</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>产品</th><th>买过的价格</th><th>怎么买</th></tr></thead>
              <tbody>${restockRows}</tbody>
            </table>
          </div>
          <ol class="plain">${restockRules}</ol>
          <h3>可以考虑、不急着买</h3>
          <ol class="plain">${consider}</ol>
        </section>

        <section class="block" id="skinlog">
          <h2>最近皮肤状态</h2>
          <p class="caption">${esc(d.skin_log_caption || "")}</p>
          ${((d.skin_log) || []).map((e) => `<div class="callout info"><div class="lead">${esc(e.date || "")}</div><p>状态：${esc(e.status || "")}</p><p>调整：${esc(e.action || "")}</p>${e.next ? `<p>接下来：${esc(e.next)}</p>` : ""}${e.source ? `<p class="caption">来源：${esc(e.source)}</p>` : ""}</div>`).join("") || "<p>暂无记录</p>"}
        </section>

        <section class="block" id="note">
          <h2>依据和提醒</h2>
          <p>${esc(profileBits)}</p>
          <p class="caption">${esc((d.profile && d.profile.lifestyle) || "")}</p>
          <p>皮肤情况：</p>
          <ul class="plain">${concerns}</ul>
          ${medicalBlock}
          <p>体质和用药注意：</p>
          <ul class="plain">${((d.profile && d.profile.constitution) || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <p>偏好：</p>
          <ul class="plain">${prefs}</ul>
          <p>安全规则：</p>
          <ul class="plain">${safety}</ul>
          <p>待确认事项：</p>
          <ul class="plain">${unverified}</ul>
          <p>${esc(d.sources || "")}</p>
          <p class="caption">${esc((d.profile && d.profile.notes) || "")}</p>
          <div class="callout info">
            <div class="lead">不是医疗建议</div>
            <p>${esc(d.disclaimer || "")}</p>
          </div>
        </section>

        <p class="footer-links">
          给其他 AI 用的原始数据：<a href="${esc(raw)}">${esc(raw)}</a>
          · 说明见 <a href="AI_INSTRUCTIONS.md">AI_INSTRUCTIONS.md</a>
          · <a href="README.md">README</a>
        </p>
      </div>
      <button type="button" class="top-btn" id="to-top">回到顶部</button>
    `;

    document.getElementById("kind-seg").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-kind]");
      if (!btn) return;
      state.kind = btn.getAttribute("data-kind");
      render();
    });
    document.getElementById("day-select").addEventListener("change", (e) => {
      state.day = Number(e.target.value);
      render();
    });
    document.getElementById("spot-chips").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-spot]");
      if (!btn) return;
      state.spot = btn.getAttribute("data-spot");
      render();
    });
    document.getElementById("inv-chips").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-inv]");
      if (!btn) return;
      state.invFilter = btn.getAttribute("data-inv");
      render();
    });
    root.querySelectorAll("[data-check]").forEach((el) => {
      el.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-check");
        state.checks[id] = !!e.target.checked;
        saveChecks();
        render();
      });
    });
    document.getElementById("clear-checks").addEventListener("click", clearChecks);
    document.getElementById("to-top").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function bootError(msg) {
    root.innerHTML = `<p class="error">${esc(msg)}</p>`;
  }

  fetch("data.json", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("无法读取 data.json（" + res.status + "）");
      return res.json();
    })
    .then((data) => {
      state.data = data;
      state.spot = data.default_spot || "pus";
      const prefix = data.checkoff && data.checkoff.storage_prefix;
      state.checks = loadChecks(todayKey(prefix));
      render();
    })
    .catch((err) => {
      bootError("加载失败：" + (err && err.message ? err.message : err) + "。请通过网页服务器打开，或检查 data.json。");
    });
})();
