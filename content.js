// content.js - Primary automation controller for ServiceNow & SkillWallet
console.log('%c[SERVICE HELL NAH] Content Script LOADED on: ' + window.location.href, 'background: #5b3fa8; color: #fff; font-size: 14px; font-weight: bold; padding: 4px;');

// Default is OFF until user toggles ON
let autopilotEnabled = false;

// Safe storage access
try {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autopilotEnabled'], (res) => {
      if (res && res.autopilotEnabled !== undefined) {
        autopilotEnabled = Boolean(res.autopilotEnabled);
      }
      notifyInjectScript();
      console.log('[SERVICE HELL NAH] Auto-pilot status:', autopilotEnabled ? 'ON' : 'OFF');
    });
  }
} catch (e) {}

function notifyInjectScript() {
  window.postMessage({ type: 'BITANCUTIEPIE_STATUS', enabled: autopilotEnabled }, '*');
}

// Inject inject.js into the MAIN world for video player speedup
try {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('inject.js');
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);
} catch (e) {
  console.error('[SERVICE HELL NAH] Inject error:', e);
}

function clickButton(btn) {
  if (!btn) return;
  try {
    btn.scrollIntoView({ block: 'center' });
    btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    btn.click();
  } catch (e) {
    btn.click();
  }
}

// ==========================================
// 1. IN-PAGE SCRAPER & AUTO-COPY ENGINE
// ==========================================
function scrapePageElements() {
  const data = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    title: document.title,
    buttons: Array.from(document.querySelectorAll('button, a, [role="button"], div[class*="btn" i], div[class*="complete" i], div[class*="next" i]')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: (el.innerText || '').trim().replace(/\s+/g, ' '),
        className: typeof el.className === 'string' ? el.className : '',
        role: el.getAttribute('role'),
        disabled: el.disabled || el.getAttribute('aria-disabled'),
        position: { bottom: Math.round(r.bottom), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) }
      };
    }).filter(b => b.text.length > 0 && b.position.width > 0).slice(0, 50),
    bottomAreaElements: Array.from(document.querySelectorAll('*')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.top > window.innerHeight - 150 && r.height > 10 && r.width > 20 && el.children.length <= 2;
    }).map(el => ({
      tag: el.tagName,
      text: (el.innerText || '').trim().replace(/\s+/g, ' '),
      className: typeof el.className === 'string' ? el.className : ''
    })).filter(x => x.text.length > 0 && x.text.length < 100).slice(0, 30)
  };

  const jsonStr = JSON.stringify(data, null, 2);

  // Copy to clipboard via fallback textarea
  try {
    const ta = document.createElement('textarea');
    ta.value = jsonStr;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    ta.remove();
    console.log('%c[SERVICE HELL NAH] ✅ Elements scraped and copied to clipboard!', 'background: #3fc896; color: #fff; font-size: 14px; padding: 4px;');
  } catch (err) {
    navigator.clipboard?.writeText?.(jsonStr);
  }

  // Print nicely in console too
  console.log('[SERVICE HELL NAH] Scraped DOM Object:', data);
  return jsonStr;
}

// ==========================================
// 2. SKILLWALLET AUTOMATION ENGINE
// ==========================================
let isHandlingSkillWallet = false;

function handleSkillWallet() {
  if (!window.location.hostname.includes('myskillwallet.ai')) return;
  if (!autopilotEnabled) return;
  if (isHandlingSkillWallet) return;

  // 1. If on overview screen with "Start Learning"
  const startBtn = Array.from(document.querySelectorAll('button')).find(b => {
    const txt = (b.innerText || '').trim().toLowerCase();
    return txt.includes('start learning') && !b.disabled;
  });
  if (startBtn) {
    console.log('[SERVICE HELL NAH] Found "Start Learning" button! Clicking...');
    clickButton(startBtn);
    return;
  }

  // 2. Look for "Mark as Complete" button
  const markCompleteBtn = Array.from(document.querySelectorAll('button')).find(b => {
    const txt = (b.innerText || '').trim().toLowerCase();
    return txt === 'mark as complete' && !b.disabled;
  });

  if (markCompleteBtn) {
    console.log('[SERVICE HELL NAH] Found "Mark as Complete" button! Clicking...');
    isHandlingSkillWallet = true;

    clickButton(markCompleteBtn);

    setTimeout(() => {
      advanceSkillWallet();
    }, 1400);
    return;
  }

  // 3. If currently showing "Completed", advance to Next
  const isCompleted = Array.from(document.querySelectorAll('button, div, span')).some(b => {
    const txt = (b.innerText || '').trim().toLowerCase();
    return txt === 'completed' || txt === '✓ completed';
  });

  if (isCompleted) {
    advanceSkillWallet();
  }
}

function advanceSkillWallet() {
  if (!autopilotEnabled) return;

  // Bottom Next button
  const nextBtn = Array.from(document.querySelectorAll('button')).find(b => {
    const txt = (b.innerText || '').trim();
    return txt.startsWith('Next') && !b.disabled;
  });

  if (nextBtn) {
    console.log('[SERVICE HELL NAH] Clicking Next button:', (nextBtn.innerText || '').slice(0, 30));
    clickButton(nextBtn);
    setTimeout(() => { isHandlingSkillWallet = false; }, 2000);
    return;
  }

  // Fallback: Sidebar uncompleted
  const allLessonBtns = Array.from(document.querySelectorAll('button')).filter(b => {
    const r = b.getBoundingClientRect();
    if (r.right > 350 || r.width === 0 || r.height === 0) return false;
    const cl = b.className || '';
    return cl.includes('w-full flex items-start gap-2') && !cl.includes('group-hover') && !b.innerText.includes('lessons');
  });

  const uncompleted = allLessonBtns.find(b => {
    const cl = b.className || '';
    const isDone = cl.includes('emerald') || b.querySelector('svg[class*="check" i]') || b.innerText.includes('✓');
    const isCurrent = cl.includes('border-secondary') || cl.includes('bg-secondary');
    return !isDone && !isCurrent;
  });

  if (uncompleted) {
    console.log('[SERVICE HELL NAH] Clicking uncompleted sidebar lesson:', uncompleted.innerText);
    clickButton(uncompleted);
    setTimeout(() => { isHandlingSkillWallet = false; }, 2000);
    return;
  }

  isHandlingSkillWallet = false;
}

// ==========================================
// 3. SERVICENOW AUTOMATION ENGINE
// ==========================================
let isNavigatingServiceNow = false;

function expandAllServiceNowModules() {
  const candidates = Array.from(document.querySelectorAll('*')).filter(el => {
    const r = el.getBoundingClientRect();
    if (r.left > 400 || r.width === 0 || r.height === 0) return false;
    const txt = (el.innerText || '');
    return (txt.includes('Module') || txt.includes('MODULE')) && (txt.includes('LESSON') || txt.includes('LESSONS'));
  });

  candidates.forEach(m => {
    const header = m.closest('[role="button"], div[ng-click], div[tabindex], div[class*="header"]') || m;
    const isChevronUp = header.innerHTML.includes('chevron-up') || header.querySelector('svg[class*="chevron-up"], i[class*="chevron-up"]');
    const isAriaClosed = header.getAttribute('aria-expanded') === 'false';
    const isCollapsedClass = (header.className || '').includes('collapsed');

    if (isChevronUp || isAriaClosed || isCollapsedClass) {
      try {
        header.click();
      } catch (e) {}
    }
  });
}

function handleServiceNow() {
  if (!window.location.hostname.includes('service-now.com') && !window.location.hostname.includes('servicenow.com')) return;
  if (!autopilotEnabled) return;
  if (isNavigatingServiceNow) return;

  expandAllServiceNowModules();

  const blacklistWords = ['learning course', 'loading', 'instance status', 'request lab', 'instances remaining', 'on-demand course', 'complete', 'lessons', 'lesson', 'homepage', 'optional'];

  const allClickable = Array.from(document.querySelectorAll('a, [role="treeitem"], [role="button"], li, div[ng-click], div[tabindex="0"]')).filter(el => {
    const rect = el.getBoundingClientRect();
    if (rect.left > 380 || rect.top < 120 || rect.width === 0 || rect.height === 0) return false;

    const txt = (el.innerText || '').trim();
    if (!txt || txt.length < 3 || txt.length > 75) return false;

    const lower = txt.toLowerCase();
    if (blacklistWords.some(b => lower === b || (lower.startsWith(b) && lower.length < b.length + 5))) return false;
    if (lower.includes('module') && (lower.includes('lesson') || lower.includes('lessons'))) return false;

    const container = el.closest('li, [role="treeitem"], [class*="item"]') || el;

    const hasCheckmark = container.querySelector('svg, [class*="check"], [class*="complete"], [class*="success"]') ||
                         container.innerText.includes('✓');
    if (hasCheckmark) return false;

    const isSelected = (container.className || '').includes('active') ||
                       (container.className || '').includes('selected') ||
                       (el.className || '').includes('active') ||
                       container.getAttribute('aria-selected') === 'true';
    if (isSelected) return false;

    return true;
  });

  if (allClickable.length > 0) {
    const target = allClickable[0].closest('a, [role="button"], [role="treeitem"], div[tabindex]') || allClickable[0];
    const title = (target.innerText || '').split('\n')[0].trim();

    console.log('[SERVICE HELL NAH] Advancing to uncompleted lesson:', title);
    isNavigatingServiceNow = true;

    target.scrollIntoView({ block: 'nearest' });
    clickButton(target);

    setTimeout(() => { isNavigatingServiceNow = false; }, 3500);
    return;
  }

  // Fallback: On-page Next button
  const nextBtns = Array.from(document.querySelectorAll('button, a')).filter(btn => {
    const t = (btn.innerText || '').trim().toLowerCase();
    return (t === 'next' || t === 'next lesson' || t === 'continue') && !btn.disabled && window.getComputedStyle(btn).display !== 'none';
  });

  if (nextBtns.length > 0) {
    isNavigatingServiceNow = true;
    clickButton(nextBtns[0]);
    setTimeout(() => { isNavigatingServiceNow = false; }, 3500);
  }
}

// ==========================================
// 4. POPUP ACTION LISTENERS
// ==========================================
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log('[SERVICE HELL NAH] Received action:', req.action);

    if (req.action === 'SCRAPE_AND_COPY') {
      const json = scrapePageElements();
      sendResponse({ status: 'ok', copied: true, data: json });
    } else if (req.action === 'SET_POWER') {
      autopilotEnabled = Boolean(req.enabled);
      notifyInjectScript();
      if (autopilotEnabled) {
        handleSkillWallet();
        handleServiceNow();
      }
      sendResponse({ status: 'ok', enabled: autopilotEnabled });
    } else if (req.action === 'SKILLWALLET_MARK_NEXT') {
      clickButton(Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim().toLowerCase() === 'mark as complete'));
      setTimeout(advanceSkillWallet, 1200);
      sendResponse({ status: 'ok' });
    } else if (req.action === 'SKILLWALLET_START') {
      const startBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').toLowerCase().includes('start learning'));
      if (startBtn) clickButton(startBtn);
      sendResponse({ status: 'ok' });
    } else if (req.action === 'FORCE_FINISH') {
      window.postMessage({ type: 'BITANCUTIEPIE_ACTION', action: 'FORCE_FINISH' }, '*');
      handleSkillWallet();
      sendResponse({ status: 'ok' });
    } else if (req.action === 'EXPAND_ALL') {
      expandAllServiceNowModules();
      sendResponse({ status: 'ok' });
    }
  });
}

// Periodic check
setInterval(() => {
  if (autopilotEnabled) {
    handleSkillWallet();
    handleServiceNow();
  }
}, 1500);
