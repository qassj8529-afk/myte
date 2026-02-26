/**
 * newsScreenshots.js
 * Listens for globally pasted images (Ctrl+V) and explicitly mounts them
 * only if the user is currently on the News & Media Context slide.
 */

document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('paste', async (e) => {
        // 1. Ensure we are actively viewing a presentation
        const activeSlide = document.querySelector('.slide.slide-active');
        if (!activeSlide || activeSlide.id === 'slide-start') return;

        // 2. We only want to paste images onto the News & Media slide
        if (activeSlide.dataset.title !== 'News & Media Context') return;

        // 3. Find the exact container we rendered for this slide
        // Since sliders are re-built on Gen, we look directly inside the active slide
        const dropZone = activeSlide.querySelector('.screenshot-container');
        if (!dropZone) return;

        const stack = dropZone.querySelector('.screenshot-stack');
        const placeholder = dropZone.querySelector('.screenshot-placeholder');
        const clearBtn = dropZone.querySelector('.btn-clear-images');

        // 4. Extract Image from Clipboard
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let imgBlob = null;

        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                imgBlob = item.getAsFile();
                break;
            }
        }

        if (!imgBlob) return; // Not an image paste, ignore

        // 5. Mount Image
        e.preventDefault(); // Stop default browser paste handling

        // Convert to ObjectURL for instantaneous zero-network rendering
        const url = URL.createObjectURL(imgBlob);

        const imgEl = document.createElement('img');
        imgEl.src = url;
        imgEl.className = 'screenshot-preview';

        // Replace placeholder immediately if it was the first image
        if (placeholder) placeholder.style.display = 'none';
        if (clearBtn) clearBtn.classList.remove('hidden');

        stack.appendChild(imgEl);

        if (window.logDebug) window.logDebug(`Pasted image to News layout.`, 'log-success');
    });

});

// Expose clear function for the inline onclick handler in renderer.js
window.clearScreenshots = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stack = container.querySelector('.screenshot-stack');
    const placeholder = container.querySelector('.screenshot-placeholder');
    const clearBtn = container.querySelector('.btn-clear-images');

    if (stack) stack.innerHTML = '';
    if (placeholder) placeholder.style.display = 'flex';
    if (clearBtn) clearBtn.classList.add('hidden');
};
