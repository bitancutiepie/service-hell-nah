// scraper.js: Injected temporarily to inspect ServiceNow Angular structure
(function() {
  console.log('--- Inspecting ServiceNow Modules & Lessons ---');
  
  // Check Angular
  if (window.angular) {
    const el = document.querySelector('[ng-controller], .sn-canvas-main, [class*="course"]');
    if (el) {
      const scope = window.angular.element(el).scope();
      console.log('Angular Scope found:', Object.keys(scope || {}));
      if (scope?.c?.data) {
        console.log('ServiceNow c.data keys:', Object.keys(scope.c.data));
      }
    }
  }

  // Find all elements in left column with text
  const items = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.left < 420 && r.width > 20 && r.height > 12) {
      const txt = (el.innerText || '').trim();
      if (txt && !txt.includes('\n') && txt.length > 2 && txt.length < 60) {
        items.push({
          tag: el.tagName.toLowerCase(),
          cls: el.className ? String(el.className) : '',
          txt: txt,
          ngClick: el.getAttribute('ng-click'),
          role: el.getAttribute('role')
        });
      }
    }
  });

  console.log(`Found ${items.length} items on left side.`);
  return items.slice(0, 30);
})();
