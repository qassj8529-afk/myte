/**
 * magnifier.js
 * Provides a fixed lens overlay that calculates mouse offset to zoom the active slide via a cloned DOM element.
 */

let lensEl, contentEl;
let isMagnifierActive = false;

function initMagnifier() {
    lensEl = document.getElementById('magnifier-lens');
    contentEl = document.getElementById('magnifier-content');

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (e.code === 'KeyZ') {
            toggleMagnifier();
        }
        if (e.code === 'Escape' && isMagnifierActive) {
            toggleMagnifier();
        }
    });

    document.addEventListener('mousemove', handlePointerMove);
}

function toggleMagnifier() {
    isMagnifierActive = !isMagnifierActive;

    if (isMagnifierActive) {
        // 1. Identify active slide
        const activeSlide = document.querySelector('.slide-active') || document.querySelector('.slide');
        if (!activeSlide) return;

        // 2. Clear previous clone and clone the active slide into the lens content
        contentEl.innerHTML = '';
        const clone = activeSlide.cloneNode(true);
        // Remove IDs to prevent duplicate ID issues
        clone.id = '';
        // Styling clone to match strict 100vh 100vw constraints
        clone.style.width = '100vw';
        clone.style.height = '100vh';
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';

        contentEl.appendChild(clone);

        // 3. Show Lens
        lensEl.classList.remove('hidden');

    } else {
        // Clean up
        lensEl.classList.add('hidden');
        contentEl.innerHTML = '';
    }
}

function handlePointerMove(e) {
    if (!isMagnifierActive) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = e.clientX;
    const y = e.clientY;

    const lensSize = 300;
    const halfLens = lensSize / 2;

    // 1. Move the Lens itself to follow the mouse
    lensEl.style.transform = `translate(${x - halfLens}px, ${y - halfLens}px)`;

    // 2. Adjust the transform-origin of the scaled content INSIDE the lens based on exact pointer ratios.
    // We use scale(2) from CSS. By shifting the origin, we pan across the cloned document.
    const xPercent = (x / w) * 100;
    const yPercent = (y / h) * 100;

    // This shifts the focal point of the clone to match exactly where the cursor is on the real body
    contentEl.style.transformOrigin = `${xPercent}% ${yPercent}%`;

    // Since the lens moves around but the content should stay visually "pinned" under the cursor,
    // we actually need to counter-translate the content so it aligns with the document under the lens.
    // A cleaner approach since origin handles zoom center is to shift the absolute container back by the mouse offset.
    contentEl.style.left = `-${x - halfLens}px`;
    contentEl.style.top = `-${y - halfLens}px`;
}
