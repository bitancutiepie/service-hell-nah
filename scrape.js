// Helper to dump the exact structure of the ServiceNow left sidebar & player
(function() {
  const sidebarElements = [];
  
  // Find clickable elements on the left side
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.left < 450 && rect.width > 20 && rect.height > 10) {
      const tag = el.tagName.toLowerCase();
      const cls = el.className ? String(el.className) : '';
      const text = (el.innerText || '').trim();
      const role = el.getAttribute('role');
      const ariaExpanded = el.getAttribute('aria-expanded');

      // Filter to relevant text nodes
      if (text.length > 2 && text.length < 80 && !text.includes('\n')) {
        sidebarElements.push({
          tag,
          class: cls.split(' ').slice(0, 3).join(' '),
          role,
          ariaExpanded,
          text
        });
      }
    }
  });

  // Video / Player elements
  const videoElements = [];
  document.querySelectorAll('video, [class*="vjs"], [class*="play"]').forEach(el => {
    videoElements.push({
      tag: el.tagName.toLowerCase(),
      class: el.className ? String(el.className) : '',
      ariaLabel: el.getAttribute('aria-label')
    });
  });

  const payload = {
    url: window.location.href,
    sidebarCount: sidebarElements.length,
    sidebarSample: sidebarElements.slice(0, 25),
    videoElements: videoElements.slice(0, 10)
  };

  console.log('=== SERVICENOW SCRAPED DATA ===');
  console.log(JSON.stringify(payload, null, 2));
  console.log('=== COPY THE JSON ABOVE AND PASTE IT TO CHAT ===');
  return payload;
})();
