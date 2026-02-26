/**
 * navigation.js
 * Handles slide-to-slide movement (Left/Right keys) and explicitly fires transition hooks.
 */

let currentSlideIndex = 0;
let slides = Array.from(document.querySelectorAll('.slide'));
let totalSlides = slides.length;

function initNavigation() {
    document.addEventListener('keydown', (e) => {
        // Prevent triggering navigation when typing in inputs/textareas
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    // Setup visual page indicator initial state
    updateIndicator();
}

/**
 * Called by app.js after panels are dynamically generated
 */
function updateNavigation(newCount) {
    slides = Array.from(document.querySelectorAll('.slide'));
    totalSlides = slides.length;
    updateIndicator();
}

function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        _transitionTo(currentSlideIndex + 1);
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        _transitionTo(currentSlideIndex - 1);
    }
}

function _transitionTo(newIndex) {
    // CRITICAL: Notify director tools that we are leaving a slide
    // so they can clean up their active state or disable overlays
    if (window.onSlideWillChange) {
        window.onSlideWillChange(currentSlideIndex);
    }

    // Update visual DOM active markers
    slides[currentSlideIndex].classList.remove('slide-active');
    currentSlideIndex = newIndex;
    slides[currentSlideIndex].classList.add('slide-active');

    // Move the wrapper
    const wrapper = document.getElementById('slider-wrapper');
    wrapper.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;

    updateIndicator();

    // CRITICAL: Notify director tools that we have entered a new slide
    // so they can re-bind mouse listeners to the new slide's overlay
    if (window.onSlideDidChange) {
        window.onSlideDidChange(currentSlideIndex, slides[currentSlideIndex]);
    }
}

function updateIndicator() {
    const indicator = document.getElementById('page-indicator');
    if (totalSlides > 1) {
        indicator.innerText = `Slide ${currentSlideIndex + 1} / ${totalSlides}`;
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

// Global scope exports
window.initNavigation = initNavigation;
window.updateNavigation = updateNavigation;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.getCurrentSlideIndex = () => currentSlideIndex;
