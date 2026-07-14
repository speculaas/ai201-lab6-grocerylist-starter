/**
 * Minimal workstream board.
 * Interaction model: FitFindr-style static data + Mermaid CDN;
 * CiteRAG-style click node → focus detail (right column).
 */

const titleEl = document.getElementById("page-title");
const captionEl = document.getElementById("page-caption");
const mermaidHost = document.getElementById("mermaid-host");
const boardEl = document.getElementById("branch-board");
const graphHintEl = document.getElementById("graph-hint");

/** @type {{ branches: Array, byTitle: Map<string, {branchId:string, nodeId:string}>, byBranchId: Map<string, object> }} */
let catalog = { branches: [], byTitle: new Map(), byBranchId: new Map() };
let activeKey = null; // `${branchId}::${nodeId}` or `branch::${branchId}`
let mermaidSource = "";
let graphOrient = "LR"; // Mermaid gitGraph: LR | TB (TB ≈ flowchart "TD")
let graphZoom = 1;
let mermaidBaseSize = null; // { w, h } of unscaled SVG
let mermaidRenderSeq = 0;
const ORIENT_KEY = "fedprint-status-gitgraph-orient";
const ZOOM_KEY = "fedprint-status-gitgraph-zoom";
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeTitle(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildCatalog(branches) {
  const byTitle = new Map();
  const byBranchId = new Map();
  for (const branch of branches || []) {
    byBranchId.set(branch.id, branch);
    byTitle.set(normalizeTitle(branch.label), { type: "branch", branchId: branch.id });
    byTitle.set(normalizeTitle(branch.id), { type: "branch", branchId: branch.id });
    for (const node of branch.nodes || []) {
      byTitle.set(normalizeTitle(node.title), {
        type: "node",
        branchId: branch.id,
        nodeId: node.id,
      });
    }
  }
  return { branches, byTitle, byBranchId };
}

function renderCommands(commands) {
  if (!commands || !commands.length) return "";
  return `<pre>${escapeHtml(commands.map((c) => `$ ${c}`).join("\n"))}</pre>`;
}

function renderNode(node, branchId) {
  return `
    <article
      class="node ${escapeHtml(node.status || "open")}"
      data-branch-id="${escapeHtml(branchId)}"
      data-node-id="${escapeHtml(node.id)}"
      data-title="${escapeHtml(node.title)}"
      tabindex="0"
      role="button"
    >
      <h3>${escapeHtml(node.title)}</h3>
      <span class="status ${escapeHtml(node.status || "open")}">${escapeHtml(node.status || "open")}</span>
      <p>${escapeHtml(node.detail || "")}</p>
      ${renderCommands(node.commands)}
    </article>
  `;
}

function renderBranch(branch, index) {
  const openClass = index === 0 ? "open" : "";
  const nodes = (branch.nodes || [])
    .map((n) => renderNode(n, branch.id))
    .join("");
  return `
    <section class="branch ${openClass}" data-branch-id="${escapeHtml(branch.id)}">
      <button class="branch-header" type="button" aria-expanded="${index === 0}">
        <span class="chevron">▸</span>
        <span class="label">${escapeHtml(branch.label)}</span>
        <span class="status ${escapeHtml(branch.status || "open")}">${escapeHtml(branch.status || "open")}</span>
      </button>
      <div class="branch-body">
        <p class="branch-summary">${escapeHtml(branch.summary || "")}</p>
        ${nodes}
      </div>
    </section>
  `;
}

function setGraphHint(msg) {
  if (graphHintEl) graphHintEl.textContent = msg;
}

function clearHighlights() {
  boardEl.querySelectorAll(".node.active, .branch.active").forEach((el) => {
    el.classList.remove("active");
  });
  mermaidHost.querySelectorAll(".ws-hit").forEach((el) => {
    el.classList.remove("ws-hit");
  });
}

function openBranch(branchId) {
  const branch = boardEl.querySelector(`.branch[data-branch-id="${CSS.escape(branchId)}"]`);
  if (!branch) return null;
  branch.classList.add("open");
  const btn = branch.querySelector(".branch-header");
  if (btn) btn.setAttribute("aria-expanded", "true");
  return branch;
}

/** Scroll only inside the right-hand board; keep the page/graph in the viewport. */
function scrollBoardChildIntoView(el) {
  if (!el || !boardEl) return;
  const er = el.getBoundingClientRect();
  const sr = boardEl.getBoundingClientRect();
  if (er.top < sr.top || er.bottom > sr.bottom) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }
}

function focusBoardTarget(target) {
  clearHighlights();
  if (!target) {
    activeKey = null;
    return;
  }

  if (target.type === "branch") {
    activeKey = `branch::${target.branchId}`;
    const branch = openBranch(target.branchId);
    if (branch) {
      branch.classList.add("active");
      scrollBoardChildIntoView(branch);
    }
    highlightMermaidByTitle(catalog.byBranchId.get(target.branchId)?.label || target.branchId);
    setGraphHint(`Focused branch: ${target.branchId}`);
    return;
  }

  activeKey = `${target.branchId}::${target.nodeId}`;
  const branch = openBranch(target.branchId);
  const nodeEl = boardEl.querySelector(
    `.node[data-branch-id="${CSS.escape(target.branchId)}"][data-node-id="${CSS.escape(target.nodeId)}"]`
  );
  if (nodeEl) {
    nodeEl.classList.add("active");
    scrollBoardChildIntoView(nodeEl);
    highlightMermaidByTitle(nodeEl.dataset.title || "");
    setGraphHint(`Focused: ${nodeEl.dataset.title}`);
  } else if (branch) {
    scrollBoardChildIntoView(branch);
    setGraphHint(`Opened branch ${target.branchId} (node card missing)`);
  }
}

function detectOrient(code) {
  const m = String(code || "").match(/^\s*gitGraph\s*(LR|TB|BT|RL)?\s*:/i);
  if (!m || !m[1]) return "LR";
  return m[1].toUpperCase();
}

function withOrient(code, orient) {
  const dir = orient === "TB" ? "TB" : "LR";
  const src = String(code || "");
  if (/^\s*gitGraph\b/i.test(src)) {
    return src.replace(/^\s*gitGraph\s*(LR|TB|BT|RL)?\s*:/i, `gitGraph ${dir}:`);
  }
  return `gitGraph ${dir}:\n${src}`;
}

function syncOrientButtons() {
  document.querySelectorAll(".orient-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.orient === graphOrient);
  });
}

async function setGraphOrient(orient) {
  const next = orient === "TB" ? "TB" : "LR";
  if (next === graphOrient && mermaidHost.querySelector("svg")) {
    syncOrientButtons();
    return;
  }
  graphOrient = next;
  try {
    localStorage.setItem(ORIENT_KEY, graphOrient);
  } catch (_) {
    /* ignore */
  }
  syncOrientButtons();
  await renderMermaid(mermaidSource);
}

function syncZoomLabel() {
  const label = document.getElementById("zoom-label");
  if (label) label.textContent = `${Math.round(graphZoom * 100)}%`;
}

/**
 * Mermaid does not ship interactive zoom. It emits width="100%" + a viewBox, which
 * filled the host and looked like "extra white space" once we mis-parsed "100%" as
 * 100px. Size from the content viewBox/bbox instead so 100% = tight original drawing.
 */
function applyGraphZoom() {
  syncZoomLabel();
  const wrap = mermaidHost.querySelector(".mermaid-zoom-wrap");
  const svg = wrap?.querySelector("svg") || mermaidHost.querySelector("svg");
  if (!svg || !mermaidBaseSize) return;

  const w = mermaidBaseSize.w * graphZoom;
  const h = mermaidBaseSize.h * graphZoom;
  svg.removeAttribute("style"); // drop mermaid max-width: …px
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  svg.style.width = `${w}px`;
  svg.style.height = `${h}px`;
  svg.style.maxWidth = "none";
  svg.style.display = "block";
  if (wrap) {
    wrap.style.width = `${w}px`;
    wrap.style.height = `${h}px`;
  }
}

function setGraphZoom(next, { persist = true } = {}) {
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
  graphZoom = clamped;
  if (persist) {
    try {
      localStorage.setItem(ZOOM_KEY, String(graphZoom));
    } catch (_) {
      /* ignore */
    }
  }
  applyGraphZoom();
}

function captureMermaidBaseSize(svg) {
  let w = 0;
  let h = 0;
  let vx = 0;
  let vy = 0;

  try {
    const bb = svg.getBBox();
    if (bb.width > 0 && bb.height > 0) {
      const pad = 6;
      vx = bb.x - pad;
      vy = bb.y - pad;
      w = bb.width + pad * 2;
      h = bb.height + pad * 2;
    }
  } catch (_) {
    /* getBBox can fail if not in DOM */
  }

  if (!(w > 0 && h > 0)) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width > 0 && vb.height > 0) {
      vx = vb.x;
      vy = vb.y;
      w = vb.width;
      h = vb.height;
    }
  }

  if (!(w > 0 && h > 0)) {
    // Last resort: style max-width from Mermaid ("max-width: 1615px")
    const maxW = parseFloat((svg.style && svg.style.maxWidth) || "");
    const vb = String(svg.getAttribute("viewBox") || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
      vx = vb[0];
      vy = vb[1];
      w = vb[2];
      h = vb[3];
    } else if (Number.isFinite(maxW) && maxW > 0) {
      w = maxW;
      h = maxW * 0.4;
    } else {
      w = 400;
      h = 280;
    }
  }

  svg.setAttribute("viewBox", `${vx} ${vy} ${w} ${h}`);
  svg.removeAttribute("height");
  // Never keep width="100%" — that was the whitespace/zoom bug.
  svg.removeAttribute("width");
  mermaidBaseSize = { w, h };
}

function wrapMermaidSvg() {
  const svg = mermaidHost.querySelector("svg");
  if (!svg || svg.parentElement?.classList.contains("mermaid-zoom-wrap")) return svg;
  const wrap = document.createElement("div");
  wrap.className = "mermaid-zoom-wrap";
  svg.replaceWith(wrap);
  wrap.appendChild(svg);
  return svg;
}

function titleFromCommitCircle(el) {
  const cls = el.getAttribute("class") || "";
  const m = cls.match(/^commit\s+(.+)\s+commit\d+\b/);
  return m ? m[1].trim() : null;
}

function highlightMermaidByTitle(title) {
  const want = normalizeTitle(title);
  if (!want) return;

  mermaidHost.querySelectorAll("circle.commit").forEach((circle) => {
    const t = titleFromCommitCircle(circle);
    if (t && normalizeTitle(t) === want) circle.classList.add("ws-hit");
  });

  mermaidHost.querySelectorAll("text.commit-label").forEach((text) => {
    if (normalizeTitle(text.textContent) !== want) return;
    text.classList.add("ws-hit");
    const prev = text.previousElementSibling;
    if (prev && prev.classList.contains("commit-label-bkg")) {
      prev.classList.add("ws-hit");
    }
  });
}

function lookupTitle(title) {
  return catalog.byTitle.get(normalizeTitle(title)) || null;
}

function wireExpandCollapse() {
  boardEl.querySelectorAll(".branch-header").forEach((btn) => {
    btn.addEventListener("click", () => {
      const branch = btn.closest(".branch");
      const willOpen = !branch.classList.contains("open");
      branch.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

function wireBoardNodeClicks() {
  boardEl.querySelectorAll(".node").forEach((el) => {
    const activate = () => {
      focusBoardTarget({
        type: "node",
        branchId: el.dataset.branchId,
        nodeId: el.dataset.nodeId,
      });
    };
    el.addEventListener("click", activate);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });
}

function wireMermaidClicks() {
  mermaidHost.querySelectorAll("circle.commit").forEach((circle) => {
    const title = titleFromCommitCircle(circle);
    if (!title) return;
    circle.classList.add("ws-clickable");
    circle.style.cursor = "pointer";
    circle.addEventListener("click", () => onGraphTitleClick(title));
  });

  mermaidHost.querySelectorAll("text.commit-label").forEach((text) => {
    const title = (text.textContent || "").trim();
    if (!title) return;
    text.classList.add("ws-clickable");
    text.style.cursor = "pointer";
    text.addEventListener("click", () => onGraphTitleClick(title));
    const bkg = text.previousElementSibling;
    if (bkg && bkg.classList.contains("commit-label-bkg")) {
      bkg.classList.add("ws-clickable");
      bkg.style.cursor = "pointer";
      bkg.addEventListener("click", () => onGraphTitleClick(title));
    }
  });

  // Branch name labels in the graph → open that branch card
  mermaidHost.querySelectorAll(".branchLabel text, g.label text").forEach((text) => {
    const title = (text.textContent || "").trim();
    if (!title || title === "main") return;
    const hit = lookupTitle(title);
    if (!hit || hit.type !== "branch") return;
    const g = text.closest("g");
    [text, g].filter(Boolean).forEach((el) => {
      el.classList.add("ws-clickable");
      el.style.cursor = "pointer";
      el.addEventListener("click", () => focusBoardTarget(hit));
    });
  });
}

function onGraphTitleClick(title) {
  const hit = lookupTitle(title);
  if (hit) {
    focusBoardTarget(hit);
    return;
  }
  clearHighlights();
  highlightMermaidByTitle(title);
  setGraphHint(
    `Graph milestone “${title}” has no matching detail card yet (title must match a node or branch label in workstream.json).`
  );
}

async function renderMermaid(code) {
  mermaidSource = code || "";
  if (!mermaidSource) {
    mermaidHost.innerHTML = "<p class='hint'>No Mermaid graph in data.</p>";
    mermaidBaseSize = null;
    return;
  }
  const oriented = withOrient(mermaidSource, graphOrient);
  try {
    mermaidRenderSeq += 1;
    const { svg } = await window.mermaid.render(
      `workstream-gitgraph-${mermaidRenderSeq}`,
      oriented
    );
    mermaidHost.innerHTML = svg;
    const svgEl = wrapMermaidSvg();
    if (svgEl) captureMermaidBaseSize(svgEl);
    applyGraphZoom();
    wireMermaidClicks();
    // Re-apply highlight for the active card after re-orient
    if (activeKey && activeKey.includes("::") && !activeKey.startsWith("branch::")) {
      const [branchId, nodeId] = activeKey.split("::");
      const nodeEl = boardEl.querySelector(
        `.node[data-branch-id="${CSS.escape(branchId)}"][data-node-id="${CSS.escape(nodeId)}"]`
      );
      if (nodeEl?.dataset.title) highlightMermaidByTitle(nodeEl.dataset.title);
    }
  } catch (err) {
    mermaidBaseSize = null;
    mermaidHost.innerHTML = `
      <p class="hint">Mermaid render failed; showing source.</p>
      <pre>${escapeHtml(oriented)}</pre>
      <pre>${escapeHtml(err.message || String(err))}</pre>
    `;
  }
}

function wireOrientToggle() {
  document.querySelectorAll(".orient-btn[data-orient]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setGraphOrient(btn.dataset.orient);
    });
  });
  syncOrientButtons();
}

function wireZoomControls() {
  document.getElementById("zoom-in")?.addEventListener("click", () => {
    setGraphZoom(graphZoom + ZOOM_STEP);
  });
  document.getElementById("zoom-out")?.addEventListener("click", () => {
    setGraphZoom(graphZoom - ZOOM_STEP);
  });
  document.getElementById("zoom-label")?.addEventListener("click", () => {
    setGraphZoom(1);
  });

  mermaidHost.addEventListener(
    "wheel",
    (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setGraphZoom(graphZoom + delta);
    },
    { passive: false }
  );

  syncZoomLabel();
}

(async function init() {
  try {
    const { default: mermaid } = await import(
      "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
    );
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
    });
    window.mermaid = mermaid;

    const response = await fetch("data/workstream.json");
    if (!response.ok) {
      throw new Error(`Failed to load data/workstream.json (${response.status})`);
    }
    const data = await response.json();

    catalog = buildCatalog(data.branches || []);
    titleEl.textContent = data.title || "Workstream board";
    captionEl.textContent = data.caption || "";
    boardEl.innerHTML = (data.branches || []).map(renderBranch).join("");
    wireExpandCollapse();
    wireBoardNodeClicks();
    wireOrientToggle();
    wireZoomControls();

    try {
      const saved = localStorage.getItem(ORIENT_KEY);
      if (saved === "LR" || saved === "TB") graphOrient = saved;
      else graphOrient = detectOrient(data.mermaid);
    } catch (_) {
      graphOrient = detectOrient(data.mermaid);
    }
    try {
      const z = parseFloat(localStorage.getItem(ZOOM_KEY));
      if (Number.isFinite(z)) graphZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
    } catch (_) {
      /* ignore */
    }
    syncOrientButtons();
    syncZoomLabel();

    await renderMermaid(data.mermaid);
    setGraphHint(
      "Both columns stay in the viewport and scroll internally. Use LR/TB to rotate and − / + to zoom (or Ctrl/⌘ + scroll on the graph)."
    );
  } catch (err) {
    titleEl.textContent = "Failed to load status board";
    captionEl.textContent = String(err.message || err);
    console.error(err);
  }
})();
