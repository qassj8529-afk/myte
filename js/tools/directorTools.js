/**
 * directorTools.js
 * Implements H (Highlight), B (Box), C (Focus) algorithms bound strictly to `.overlay-layer`.
 */

let activeMode = null; // 'H', 'B', 'C', or null
let isDrawing = false;
let startX = 0, startY = 0;
let currentElement = null;
let currentOverlay = null; // Reference to active slide's overlay boundary

function initDirectorTools() {
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (window.getCurrentSlideIndex && window.getCurrentSlideIndex() === 0) {
            // Disabled on home page
            return;
        }

        const key = e.key.toUpperCase();
        if (['H', 'B', 'C', 'R'].includes(key)) {
            handleToolKey(key);
        }
    });

    // Rebind navigation hooks
    window.onSlideWillChange = window.onSlideWillChange || function () { };
    const _oldWillChange = window.onSlideWillChange;
    window.onSlideWillChange = function (oldIdx) {
        _oldWillChange(oldIdx);
        // User navigated away. Deactivate tools but leave drawn things inside the overlay!
        deactivateMode();
    };
}

function handleToolKey(key) {
    if (key === 'R') {
        // Reset Overlays
        const slide = document.querySelector('.slide.slide-active');
        if (slide) {
            const overlay = slide.querySelector('.overlay-layer');
            if (overlay) overlay.innerHTML = '';
        }
        deactivateMode();
        return;
    }

    // Toggle mode
    if (activeMode === key) {
        deactivateMode();
    } else {
        activateMode(key);
    }
}

function activateMode(key) {
    deactivateMode(); // clean up any existing bindings

    activeMode = key;
    const slide = document.querySelector('.slide.slide-active');
    if (!slide) return;

    currentOverlay = slide.querySelector('.overlay-layer');
    if (!currentOverlay) return;

    currentOverlay.classList.add('draw-mode'); // Turns on pointer-events

    currentOverlay.addEventListener('mousedown', startDraw);
    currentOverlay.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw); // global window to catch release outside perfectly

    if (window.logDebug) window.logDebug(`Director Mode Active: ${key}`, "log-info");
}

function deactivateMode() {
    if (!activeMode || !currentOverlay) return;

    currentOverlay.classList.remove('draw-mode');
    currentOverlay.removeEventListener('mousedown', startDraw);
    currentOverlay.removeEventListener('mousemove', draw);
    window.removeEventListener('mouseup', endDraw);

    activeMode = null;
    currentOverlay = null;
    isDrawing = false;
    currentElement = null;
}

function startDraw(e) {
    // Prevent if using other buttons
    if (e.button !== 0) return;

    const rect = currentOverlay.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;

    if (activeMode === 'H') {
        currentElement = document.createElement('div');
        currentElement.style.position = 'absolute';
        currentElement.style.background = 'rgba(234, 179, 8, 0.4)'; // yellow-500 tint
        currentElement.style.borderRadius = '4px';
        currentElement.style.pointerEvents = 'none'; // so you can draw over it

    } else if (activeMode === 'B') {
        currentElement = document.createElement('div');
        currentElement.style.position = 'absolute';
        currentElement.style.border = '3px solid #ef4444'; // red-500
        currentElement.style.background = 'transparent';
        currentElement.style.borderRadius = '8px';
        currentElement.style.pointerEvents = 'none';

    } else if (activeMode === 'C') {
        // Focus implies drawing a dark circle or highlight. We'll do a spotlight pulse ring.
        currentElement = document.createElement('div');
        currentElement.style.position = 'absolute';
        currentElement.style.border = '4px solid #3b82f6'; // blue-500
        currentElement.style.borderRadius = '50%';
        currentElement.style.background = 'rgba(59, 130, 246, 0.1)';
        currentElement.style.pointerEvents = 'none';
    }

    if (currentElement) {
        currentElement.style.left = `${startX}px`;
        currentElement.style.top = `${startY}px`;
        currentOverlay.appendChild(currentElement);
    }
}

function draw(e) {
    if (!isDrawing || !currentElement) return;

    const rect = currentOverlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    currentElement.style.left = `${left}px`;
    currentElement.style.top = `${top}px`;

    if (activeMode === 'H') {
        // Highlights are usually straight lines, allow variable width/height
        currentElement.style.width = `${width}px`;
        currentElement.style.height = `${height}px`;
    } else if (activeMode === 'B') {
        currentElement.style.width = `${width}px`;
        currentElement.style.height = `${height}px`;
    } else if (activeMode === 'C') {
        // Ensure circle via max constraint
        const size = Math.max(width, height);
        currentElement.style.width = `${size}px`;
        currentElement.style.height = `${size}px`;
        currentElement.style.left = `${startX - size / 2}px`; // animate from center
        currentElement.style.top = `${startY - size / 2}px`;
    }
}

function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;

    // Cleanup if user barely clicked
    if (currentElement) {
        if (currentElement.style.width === '0px' || currentElement.style.width === '') {
            currentElement.remove();
        }
    }

    currentElement = null;
}

window.initDirectorTools = initDirectorTools;
