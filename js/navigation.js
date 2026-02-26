/**
 * navigation.js
 * Handles slide-based horizontal navigation without scrolling.
 */

const NAV_STATE = {
    currentSlideIndex: 0,
    totalSlides: 1, // updated by app.js when slides are generated
    sliderWrapper: null,
    pageIndicator: null,
    overlays: null
};

function initNavigation() {
    NAV_STATE.sliderWrapper = document.getElementById('slider-wrapper');
    NAV_STATE.pageIndicator = document.getElementById('page-indicator');
    NAV_STATE.overlays = document.getElementById('overlays');

    document.addEventListener('keydown', (e) => {
        // Prevent if typing in input
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.code === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });

    // Start with overlays hidden (only shown on page 2+)
    // We actually keep them hidden on Slide 1, shown on Slide > 1
}

function updateNavigation(totalSlides) {
    NAV_STATE.totalSlides = totalSlides;
    NAV_STATE.pageIndicator.classList.remove('hidden');
    updateView();
}

function nextSlide() {
    if (NAV_STATE.currentSlideIndex < NAV_STATE.totalSlides - 1) {
        NAV_STATE.currentSlideIndex++;
        updateView();
    }
}

function prevSlide() {
    if (NAV_STATE.currentSlideIndex > 0) {
        NAV_STATE.currentSlideIndex--;
        updateView();
    }
}

function updateView() {
    // Translate wrapper based on index
    const offset = NAV_STATE.currentSlideIndex * -100;
    NAV_STATE.sliderWrapper.style.transform = `translateX(${offset}vw)`;

    // Update indicator
    NAV_STATE.pageIndicator.innerText = `Slide ${NAV_STATE.currentSlideIndex + 1} / ${NAV_STATE.totalSlides}`;

    // Toggle Overlays visibility (Director Controls)
    if (NAV_STATE.currentSlideIndex === 0) {
        // Slide 1 has inputs, hide overlays so inputs can be clicked
        NAV_STATE.overlays.classList.add('hidden');
        clearOverlays(); // from tools.js
    } else {
        // Analysis slides, show overlays
        NAV_STATE.overlays.classList.remove('hidden');

        // Auto-update charts inside the active slide due to potential resize issues with display/transform
        const activeSlide = document.querySelectorAll('.slide')[NAV_STATE.currentSlideIndex];
        if (activeSlide) {
            const charts = activeSlide.querySelectorAll('.chart-fullscreen-container');
            if (charts.length > 0) {
                window.dispatchEvent(new Event('resize'));
            }
        }
    }
}
