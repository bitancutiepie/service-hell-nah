/* o = outline, w = highlight, f = accent fill */
const ICONS = {
  play: [
    "............",
    ".oo.........",
    ".owoo.......",
    ".owffoo.....",
    ".owffffoo...",
    ".owfffffffo.",
    ".owfffffffo.",
    ".owffffoo...",
    ".owffoo.....",
    ".owoo.......",
    ".oo.........",
    "............"
  ],
  check: [
    "............",
    ".........oo.",
    "........owfo",
    ".......owfo.",
    ".oo...owfo..",
    "owfo.owfo...",
    ".owfowfo....",
    "..owffo.....",
    "...owo......",
    "....o.......",
    "............",
    "............"
  ],
  fast: [
    "............",
    ".oo..oo.....",
    ".ofo.ofo....",
    "..ofo.ofo...",
    "...ofo.ofo..",
    "....ofo.ofo.",
    "...ofo.ofo..",
    "..ofo.ofo...",
    ".ofo.ofo....",
    ".oo..oo.....",
    "............",
    "............"
  ],
  chest: [
    "............",
    "..oooooooo..",
    ".owwwwwwwwo.",
    ".offffffffo.",
    "oooooooooooo",
    "offffwwffffo",
    "offffwwffffo",
    "offffffffffo",
    "oooooooooooo",
    "............",
    "............",
    "............"
  ]
};

const SPARK = [
  "...#...",
  "...#...",
  "..###..",
  "#######",
  "..###..",
  "...#...",
  "...#..."
];

function grid(rows, w, h, cls) {
  let r = "";
  rows.forEach((row, y) => [...row.padEnd(w, ".")].forEach((c, x) => {
    if (c !== ".") {
      r += `<rect x="${x}" y="${y}" width="1" height="1"${cls ? ` class="${c}"` : ""}/>`;
    }
  }));
  return r;
}

const CLOUD = [
  "....####......",
  "..########.##.",
  ".############.",
  "##############",
  ".############."
];

const c1 = document.getElementById("c1");
const c2 = document.getElementById("c2");
if (c1) c1.innerHTML = grid(CLOUD, 14, 6);
if (c2) c2.innerHTML = grid(CLOUD, 14, 6);

const sparkSvg = (px) => `<svg width="${px}" height="${px}" viewBox="0 0 7 7" fill="currentColor" style="display:block;shape-rendering:crispEdges">${grid(SPARK, 7, 7)}</svg>`;

document.querySelectorAll("[data-spark]").forEach(el => {
  el.style.display = "block";
  el.style.lineHeight = "0";
  el.innerHTML = sparkSvg(14);
  if (el.firstChild) el.firstChild.style.color = "var(--pink-d)";
});

/* floating sparkles */
const sparksEl = document.getElementById("sparks");
if (sparksEl) {
  const pts = [
    [8, 22, "#ff9ecb", 18],
    [18, 70, "#8fc2ff", 14],
    [30, 12, "#fff", 14],
    [86, 16, "#ffd36b", 20],
    [92, 52, "#b5f0d8", 14],
    [76, 84, "#ff9ecb", 16],
    [14, 90, "#ffd36b", 14],
    [60, 6, "#8fc2ff", 14]
  ];
  sparksEl.innerHTML = pts.map((p, i) =>
    `<div class="deco spark" style="left:${p[0]}%;top:${p[1]}%;color:${p[2]};animation-delay:${(i * 0.45).toFixed(2)}s">${sparkSvg(p[3])}</div>`
  ).join("");
}

const msg = document.getElementById("msg");

function sendCommand(action, statusText, extra = {}) {
  if (msg && statusText) msg.textContent = statusText;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: action, ...extra }, () => {
      if (chrome.runtime.lastError) {}
    });
  });
}

// Render icons on buttons
document.querySelectorAll(".btn").forEach(b => {
  const tile = b.querySelector(".tile");
  if (tile && ICONS[b.dataset.icon]) {
    tile.innerHTML = `<svg viewBox="0 0 12 12" aria-hidden="true">${grid(ICONS[b.dataset.icon], 12, 12, true)}</svg>`;
  }

  b.addEventListener("click", () => {
    b.classList.add("pressed");
    setTimeout(() => b.classList.remove("pressed"), 120);
    sendCommand(b.dataset.action, b.dataset.msg);
  });
});

// Master ON / OFF Toggle
const masterToggle = document.getElementById("master-toggle");
let isAutoPilotOn = false;

// Read state from storage (default to false: OFF)
chrome.storage?.local?.get(['autopilotEnabled'], (res) => {
  isAutoPilotOn = Boolean(res?.autopilotEnabled);
  renderToggle(isAutoPilotOn);
});

function renderToggle(isOn) {
  if (isOn) {
    masterToggle.textContent = "● ON";
    masterToggle.className = "toggle-btn on";
    if (msg) msg.textContent = "Auto-pilot is ON";
  } else {
    masterToggle.textContent = "● OFF";
    masterToggle.className = "toggle-btn off";
    if (msg) msg.textContent = "Auto-pilot is OFF";
  }
}

masterToggle?.addEventListener("click", () => {
  isAutoPilotOn = !isAutoPilotOn;
  chrome.storage?.local?.set({ autopilotEnabled: isAutoPilotOn });
  renderToggle(isAutoPilotOn);
  sendCommand("SET_POWER", isAutoPilotOn ? "Auto-pilot turned ON" : "Auto-pilot turned OFF", { enabled: isAutoPilotOn });
});
