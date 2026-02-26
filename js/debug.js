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
    } catch(e) {
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
