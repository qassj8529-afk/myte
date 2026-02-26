/**
 * tools.js
 * Implements Director Mode features: Zoom, Highlight, Box, Debug Console
 */

const TOOLS_STATE = {
    isZoomActive: false,
    isHighlightActive: false,
    isBoxActive: false,

    // Drawing state
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentElement: null
};

let zoomLayer, highlightLayer, boxLayer, debugConsole, debugLogs;

function initTools() {
    zoomLayer = document.getElementById('zoom-layer');
    highlightLayer = document.getElementById('highlight-layer');
    boxLayer = document.getElementById('box-layer');
    debugConsole = document.getElementById('debug-console');
    debugLogs = document.getElementById('debug-logs');

    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('mousemove', handlePointerMove);

    // Highlighting handlers
    highlightLayer.addEventListener('mousedown', (e) => startDraw(e, 'highlight-mark'));
    highlightLayer.addEventListener('mousemove', draw);
    highlightLayer.addEventListener('mouseup', stopDraw);

    // Box handlers
    boxLayer.addEventListener('mousedown', (e) => startDraw(e, 'selection-box'));
    boxLayer.addEventListener('mousemove', draw);
    boxLayer.addEventListener('mouseup', stopDraw);
}

function handleGlobalKeydown(e) {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.code) {
        case 'KeyZ':
            toggleZoom();
            break;
        case 'KeyH':
            toggleMode('highlight');
            break;
        case 'KeyB':
            toggleMode('box');
            break;
        case 'KeyD':
            toggleDebugConsole();
            break;
        case 'Escape':
            clearOverlays();
            break;
    }
}

/**
 * Handle Zoom Tracking
 */
function handlePointerMove(e) {
    if (TOOLS_STATE.isZoomActive) {
        // We apply CSS transform scale to the slider wrapper directly, tracking mouse.
        // transform-origin percentage calculation:
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;

        document.body.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    }
}

function toggleZoom() {
    TOOLS_STATE.isZoomActive = !TOOLS_STATE.isZoomActive;
    if (TOOLS_STATE.isZoomActive) {
        clearModes();
        document.body.classList.add('zoomed');
    } else {
        document.body.classList.remove('zoomed');
        document.body.style.transformOrigin = 'center';
    }
}

function toggleMode(mode) {
    clearModes();
    if (mode === 'highlight') {
        TOOLS_STATE.isHighlightActive = !TOOLS_STATE.isHighlightActive;
        if (TOOLS_STATE.isHighlightActive) highlightLayer.classList.add('active');
    } else if (mode === 'box') {
        TOOLS_STATE.isBoxActive = !TOOLS_STATE.isBoxActive;
        if (TOOLS_STATE.isBoxActive) boxLayer.classList.add('active');
    }
}

function clearModes() {
    TOOLS_STATE.isHighlightActive = false;
    TOOLS_STATE.isBoxActive = false;
    TOOLS_STATE.isZoomActive = false;
    highlightLayer.classList.remove('active');
    boxLayer.classList.remove('active');
    document.body.classList.remove('zoomed');
}

function clearOverlays() {
    clearModes();
    highlightLayer.innerHTML = '';
    boxLayer.innerHTML = '';
}

function toggleDebugConsole() {
    debugConsole.classList.toggle('hidden');
}

/**
 * Debug Logger Function
 */
window.logDebug = function (message, type = 'log-info') {
    // Wait until debugLogs exists in DOM (can be called early from API)
    if (!debugLogs) {
        if (document.getElementById('debug-logs')) {
            debugLogs = document.getElementById('debug-logs');
        } else {
            console.log(`[${type}] ${message}`);
            return;
        }
    }

    const el = document.createElement('div');
    el.className = type;
    el.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugLogs.appendChild(el);
    debugLogs.scrollTop = debugLogs.scrollHeight;
}

/* ============================
   Drawing Logic (Highlight/Box)
   ============================ */
function startDraw(e, className) {
    TOOLS_STATE.isDrawing = true;
    TOOLS_STATE.startX = e.clientX;
    TOOLS_STATE.startY = e.clientY;

    TOOLS_STATE.currentElement = document.createElement('div');
    TOOLS_STATE.currentElement.className = className;
    TOOLS_STATE.currentElement.style.left = TOOLS_STATE.startX + 'px';
    TOOLS_STATE.currentElement.style.top = TOOLS_STATE.startY + 'px';

    e.target.appendChild(TOOLS_STATE.currentElement);
}

function draw(e) {
    if (!TOOLS_STATE.isDrawing) return;

    const width = Math.abs(e.clientX - TOOLS_STATE.startX);
    const height = Math.abs(e.clientY - TOOLS_STATE.startY);
    const left = Math.min(e.clientX, TOOLS_STATE.startX);
    const top = Math.min(e.clientY, TOOLS_STATE.startY);

    TOOLS_STATE.currentElement.style.width = width + 'px';
    TOOLS_STATE.currentElement.style.height = height + 'px';
    TOOLS_STATE.currentElement.style.left = left + 'px';
    TOOLS_STATE.currentElement.style.top = top + 'px';
}

function stopDraw() {
    TOOLS_STATE.isDrawing = false;
    TOOLS_STATE.currentElement = null;
}
