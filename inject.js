// inject.js: Video fast-finisher running in page MAIN context
(function() {
  console.log('[BITANCUTIEPIE] Inject helper loaded in page context.');

  // ==========================================
  // 1. NEUTRALIZE TRACKERS & BLOAT APIS
  // ==========================================
  const dummyFn = () => {};
  const dummyObj = new Proxy({}, { get: () => dummyFn });
  ['pendo', '_satellite', 'WalkMe', 'walkme', 'hj', 'dataLayer', 'FS', 'appcues', 'nowPulse'].forEach(key => {
    try { window[key] = dummyObj; } catch (e) {}
  });

  // Listen to window postMessage from content.js
  let autopilotEnabled = false;

  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || !event.data.type) return;

    if (event.data.type === 'BITANCUTIEPIE_STATUS') {
      autopilotEnabled = Boolean(event.data.enabled);
    } else if (event.data.type === 'BITANCUTIEPIE_ACTION') {
      if (event.data.action === 'FORCE_PLAY') forcePlayCurrentVideo();
      if (event.data.action === 'FORCE_FINISH') completeCurrentItem();
    }
  });

  // ==========================================
  // 2. VIDEO PLAY & COMPLETE HELPERS
  // ==========================================
  function forcePlayCurrentVideo() {
    try {
      if (window.videojs) {
        const players = window.videojs.getAllPlayers ? window.videojs.getAllPlayers() : Object.values(window.videojs.players || {});
        players.forEach(p => {
          if (p && typeof p.play === 'function') {
            try { p.play(); } catch (e) {}
          }
        });
      }
    } catch (e) {}

    document.querySelectorAll('video').forEach(v => {
      if (v.paused) try { v.play(); } catch (e) {}
    });
  }

  function completeCurrentItem() {
    forcePlayCurrentVideo();

    // Fast-finish Video.js
    try {
      if (window.videojs) {
        const players = window.videojs.getAllPlayers ? window.videojs.getAllPlayers() : Object.values(window.videojs.players || {});
        players.forEach(p => {
          if (p) {
            try { p.playbackRate(16); } catch (e) {}
            const dur = p.duration ? p.duration() : 0;
            if (dur > 0 && p.currentTime() < dur - 0.2) {
              p.currentTime(dur - 0.1);
              p.trigger('timeupdate');
              p.trigger('ended');
            }
          }
        });
      }
    } catch (e) {}

    // Fast-finish HTML5 Video
    document.querySelectorAll('video').forEach(v => {
      if (!v) return;
      const dur = (Number.isFinite(v.duration) && v.duration > 0) ? v.duration : 0;
      if (dur > 0 && v.currentTime < dur - 0.2) {
        try { v.playbackRate = 16.0; } catch (e) {}
        try { v.currentTime = dur - 0.1; } catch (e) {}
        v.dispatchEvent(new Event('timeupdate', { bubbles: true }));
        v.dispatchEvent(new Event('ended', { bubbles: true }));
      }
    });

    // SCORM / LMS API completion
    try {
      const api = window.API || window.API_1484_11 || window.parent?.API || window.parent?.API_1484_11;
      if (api) {
        api.SetValue?.('cmi.core.lesson_status', 'completed');
        api.SetValue?.('cmi.completion_status', 'completed');
        api.SetValue?.('cmi.success_status', 'passed');
        api.Commit?.('');
      }
    } catch (e) {}
  }

  // Only auto-complete if enabled
  setInterval(() => {
    if (autopilotEnabled) {
      completeCurrentItem();
    }
  }, 400);
})();
