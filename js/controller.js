/**
 * controller.js
 * Manages Director Mode keyboard and mouse interactions.
 */

const STATE = {
    isZoomActive: false,
    isHighlightActive: false,
    isBoxActive: false,
    isTeleprompterActive: false,
    isChartFocused: false,

    // Drawing state
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentElement: null
};

// DOM Elements initialized later by main.js
let zoomLens, highlightLayer, boxLayer, teleprompter;

function initController() {
    zoomLens = document.getElementById('zoom-lens');
    highlightLayer = document.getElementById('highlight-layer');
    boxLayer = document.getElementById('box-layer');
    teleprompter = document.getElementById('teleprompter');

    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('mousemove', handleMouseMove);

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
    // Prevent firing when typing in an input or textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            scrollNextModule();
            break;
        case 'KeyZ':
            toggleZoom();
            break;
        case 'KeyH':
            toggleMode('highlight');
            break;
        case 'KeyB':
            toggleMode('box');
            break;
        case 'KeyC':
            toggleFocusChart();
            break;
        case 'KeyR':
            resetView();
            break;
        case 'KeyT':
            toggleTeleprompter();
            break;
        case 'Escape':
            clearOverlays();
            break;
    }
}

function handleMouseMove(e) {
    if (STATE.isZoomActive) {
        // Center lens on cursor
        zoomLens.style.left = (e.clientX - 125) + 'px';
        zoomLens.style.top = (e.clientY - 125) + 'px';

        // Zoom background logic: we simulate zoom by applying a backdrop-filter,
        // or since this is pure CSS/JS, actual DOM zoom is hard without Canvas.
        // Instead, we use standard CSS scale on a clone or just leave standard css styling for the lens as a "spotlight" focus.
        // Real magnification is tricky for arbitrary DOM elements, so we'll treat it as a spotlight/focus lens.
    }
}

function toggleZoom() {
    STATE.isZoomActive = !STATE.isZoomActive;
    if (STATE.isZoomActive) {
        clearModes();
        zoomLens.classList.add('active');
    } else {
        zoomLens.classList.remove('active');
    }
}

function toggleMode(mode) {
    clearModes(); // only one active drawing mode at a time
    if (mode === 'highlight') {
        STATE.isHighlightActive = !STATE.isHighlightActive;
        if (STATE.isHighlightActive) highlightLayer.classList.add('active');
    } else if (mode === 'box') {
        STATE.isBoxActive = !STATE.isBoxActive;
        if (STATE.isBoxActive) boxLayer.classList.add('active');
    }
}

function clearModes() {
    STATE.isHighlightActive = false;
    STATE.isBoxActive = false;
    STATE.isZoomActive = false;
    highlightLayer.classList.remove('active');
    boxLayer.classList.remove('active');
    zoomLens.classList.remove('active');
}

function toggleFocusChart() {
    STATE.isChartFocused = !STATE.isChartFocused;
    const charts = document.querySelectorAll('.chart-module');
    if (charts.length === 0) return;

    if (STATE.isChartFocused) {
        charts[0].classList.add('focus-mode');
        // Re-trigger resize on internal lightweight chart
        window.dispatchEvent(new Event('resize'));
    } else {
        charts[0].classList.remove('focus-mode');
        window.dispatchEvent(new Event('resize'));
    }
}

function toggleTeleprompter() {
    STATE.isTeleprompterActive = !STATE.isTeleprompterActive;
    if (STATE.isTeleprompterActive) {
        teleprompter.classList.add('active');
    } else {
        teleprompter.classList.remove('active');
    }
}

function scrollNextModule() {
    const currentY = window.scrollY;
    const modules = document.querySelectorAll('.module');

    for (let mod of modules) {
        const rect = mod.getBoundingClientRect();
        if (rect.top > 50) { // next module that is slightly below top
            window.scrollTo({
                top: currentY + rect.top - 50,
                behavior: 'smooth'
            });

            // Update teleprompter text if it exists
            updateTeleprompter(mod.dataset.scriptText);
            return;
        }
    }
}

function updateTeleprompter(text) {
    if (!text) return;
    teleprompter.querySelector('.teleprompter-content').innerText = text;
}

function clearOverlays() {
    clearModes();
    highlightLayer.innerHTML = '';
    boxLayer.innerHTML = '';
    if (STATE.isChartFocused) toggleFocusChart();
    if (STATE.isTeleprompterActive) toggleTeleprompter();
}

function resetView() {
    clearOverlays();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================
   Drawing Logic
   ============================ */
function startDraw(e, className) {
    STATE.isDrawing = true;
    STATE.startX = e.offsetX;
    STATE.startY = e.offsetY;

    STATE.currentElement = document.createElement('div');
    STATE.currentElement.className = className;
    STATE.currentElement.style.left = STATE.startX + 'px';
    STATE.currentElement.style.top = STATE.startY + 'px';

    e.target.appendChild(STATE.currentElement);
}

function draw(e) {
    if (!STATE.isDrawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    const width = Math.abs(currentX - STATE.startX);
    const height = Math.abs(currentY - STATE.startY);
    const left = Math.min(currentX, STATE.startX);
    const top = Math.min(currentY, STATE.startY);

    STATE.currentElement.style.width = width + 'px';
    STATE.currentElement.style.height = height + 'px';
    STATE.currentElement.style.left = left + 'px';
    STATE.currentElement.style.top = top + 'px';
}

function stopDraw() {
    STATE.isDrawing = false;
    STATE.currentElement = null;
}
