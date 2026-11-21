# AGENTS.md - Antigravity Extension Engineering & Browser Agent Setup

Guidelines and operational protocols for developing, scraping, testing, and iterating on the **SERVICE HELL NAH** Chrome Extension.

---

## 1. Why `agent-browser` is a Game Changer for this Project

`agent-browser` drastically accelerates development of this extension:

1. **Instant Headless / Automated DOM Verification**:
   - Instead of asking the user to open Developer Tools, copy console output, or take screenshots, Antigravity can directly open pages, take accessibility snapshots (`agent-browser snapshot -i`), and inspect live classes, buttons, and LMS elements.
2. **Deterministic Element Testing**:
   - Tests `clickButton()`, accordions, and custom event dispatching (`mousedown`, `mouseup`, `click`) in real Chromium before writing code into `content.js` or `inject.js`.
3. **Session Replay & Persistence**:
   - Preserves login sessions with `--session <name> --restore` so learning platforms (ServiceNow, SkillWallet) do not require repeated re-authentication across test runs.
4. **End-to-End Course Automation Verification**:
   - Runs test suites that verify whether clicking *Mark as Complete* actually updates the progress percentage.

---

## 2. Using `agent-browser` in Antigravity

When testing portal changes or exploring new LMS structures, adhere to these workflows:

### Session Convention
Always generate and use an isolated session identifier to avoid clobbering other browser instances:
```bash
SESSION="$(agent-browser session id --scope worktree --prefix service-hell-nah)"
```

### Inspecting Target Pages
```bash
# Open page with session persistence
agent-browser --session "$SESSION" open "https://ph.myskillwallet.ai/student/courses/..."

# Extract compact interactive accessibility tree (identifies buttons, inputs, @eN refs)
agent-browser --session "$SESSION" snapshot -i

# Execute test script in page context
cat <<'EOF' | agent-browser --session "$SESSION" eval --stdin
Array.from(document.querySelectorAll('button')).map(b => ({
  text: b.innerText.trim(),
  classes: b.className
}));
EOF
```

### Capturing Annotated Visuals
```bash
# Takes a labeled screenshot where [N] corresponds to @eN refs
agent-browser --session "$SESSION" screenshot --annotate docs/assets/annotated_flow.png
```

---

## 3. Extension Architecture Guidelines

When adding new learning platforms or modifying existing automation loops, adhere strictly to these architecture rules:

### Context Boundaries
1. **`content.js` (Isolated Extension World)**:
   - Must handle all DOM-level button clicks, accordion opening, mutation observers, interval timers, and `chrome.storage.local` persistence.
   - All `chrome.runtime.onMessage` listeners must live here. Never place `chrome.runtime` calls inside scripts injected into the main page context.
2. **`inject.js` (Main Page Context)**:
   - Dedicated solely to interacting with page-level global objects (`window.videojs`, HTMLMediaElement prototypes, SCORM `cmi.*` APIs).
   - Communicates with `content.js` strictly via `window.postMessage`.

### Power Safety Rule
- **Default State must remain `OFF`**: Any new background or content loops must check `if (!autopilotEnabled) return;` at the beginning of each cycle.
- The user must explicitly switch the toggle to `● ON` in the popup before any automatic progression or simulated clicks take place.

### Mouse Simulation Reliability
Modern reactive frameworks (React, Tailwind UI, AngularJS) ignore naive `.click()` calls on custom components. Always dispatch the full event sequence:
```javascript
function clickButton(btn) {
  if (!btn) return;
  btn.scrollIntoView({ block: 'center' });
  btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
  btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
  btn.click();
}
```

---

## 4. UI Design Consistency
- Keep popup styles aligned with the **Pastel Pixel** aesthetic (`Pixelify Sans`, 12x12 SVG pixel icons, and pastel mint, peach, sky, pink, and yellow color accents).
- Any new platform action must be represented as a dedicated pixel tile button with active press transitions.
