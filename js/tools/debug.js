/**
 * debug.js
 * Handles the application debug overlay for API and OHLC tracking.
 */

let debugConsole, debugLogs;
let isDebugVisible = false;

function initDebug() {
  debugConsole = document.getElementById('debug-console');
  debugLogs = document.getElementById('debug-logs');

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'KeyD') {
      toggleDebugConsole();
    }
  });

  // Periodically update the header status if visible
  setInterval(() => {
    if (isDebugVisible) updateDebugHeader();
  }, 1000);
}

function updateDebugHeader() {
  const header = document.querySelector('.debug-header');
  if (!header) return;

  const slideIdx = window.getCurrentSlideIndex ? window.getCurrentSlideIndex() : 'N/A';

  // Determine if specific tools are active by sniffing active DOM or global vars
  const isZoom = document.getElementById('magnifier-lens') && !document.getElementById('magnifier-lens').classList.contains('hidden') ? 'Z' : 'Off';

  // To avoid polluting global namespace just to read the draw tool active mode, 
  // we can sniff if the .draw-mode class is present on the current slide
  let activeTool = 'Off';
  const activeSlide = document.querySelector('.slide.slide-active');
  if (activeSlide) {
    const overlay = activeSlide.querySelector('.overlay-layer');
    if (overlay && overlay.classList.contains('draw-mode')) {
      activeTool = 'Drawing';
    }
  }

  // Preserve the close button
  header.innerHTML = `JSON Render State | Slide: ${slideIdx} | Zoom: ${isZoom} | Director: ${activeTool} 
    <span style="float:right; cursor:pointer;" onclick="document.getElementById('debug-console').classList.add('hidden'); isDebugVisible=false;">X</span>`;
}

function toggleDebugConsole() {
  isDebugVisible = !isDebugVisible;
  if (isDebugVisible) {
    debugConsole.classList.remove('hidden');
  } else {
    debugConsole.classList.add('hidden');
  }
}

/**
 * 
 * @param {string} message - The message to log
 * @param {string} type - 'log-info', 'log-success', 'log-warn', 'log-error'
 * @param {object} [data] - Optional object/array to stringify and display (like OHLC preview)
 */
function logDebug(message, type = 'log-info', data = null) {
  if (!debugLogs) {
    console.log(`[${type}] ${message}`, data || '');
    return;
  }

  const el = document.createElement('div');
  el.className = type;

  let timeStr = new Date().toLocaleTimeString();
  let textContent = `[${timeStr}] ${message}`;

  if (data) {
    try {
      const formatted = JSON.stringify(data, null, 2);
      textContent += `\n<pre style="margin-top:4px; margin-bottom:8px; padding:4px; background:rgba(0,0,0,0.5); border-radius:4px; max-height:100px; overflow-y:auto; font-size:0.75rem;">${formatted}</pre>`;
    } catch (e) {
      textContent += `\n[Unparseable Data]`;
    }
  }

  el.innerHTML = textContent;
  debugLogs.appendChild(el);

  // Auto-scroll
  debugLogs.scrollTop = debugLogs.scrollHeight;
}

// Attach to window so api.js can call it easily without circular deps
window.logDebug = logDebug;
window.initDebug = initDebug;

// Global Error Catching
window.onerror = function (message, source, lineno, colno, error) {
  if (window.logDebug) {
    window.logDebug(`Global Error: ${message} (Line ${lineno})`, 'log-error', error ? error.stack : null);
  }
  return false; // let default browser console log too
};

window.onunhandledrejection = function (event) {
  if (window.logDebug) {
    window.logDebug(`Unhandled Promise Rejection: ${event.reason}`, 'log-error', event.reason ? event.reason.stack : null);
  }
};
