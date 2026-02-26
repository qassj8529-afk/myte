/**
 * app.js
 * Central application orchestrator for the Pure JSON engine.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize tools
    if (window.initDebug) window.initDebug();
    if (window.initNavigation) window.initNavigation();
    if (window.initMagnifier) window.initMagnifier();
    if (window.initDirectorTools) window.initDirectorTools();

    // UI Setup
    const btnGenerate = document.getElementById('btn-generate');

    if (btnGenerate) {
        btnGenerate.addEventListener('click', async () => {
            const scriptText = document.getElementById('script-input')?.value.trim();
            if (!scriptText) {
                alert("Please paste a JSON Blueprint.");
                return;
            }

            // 2. JSON Parsing
            let blueprint = null;
            try {
                blueprint = JSON.parse(scriptText);
            } catch (e) {
                alert("Invalid JSON format. Please paste a valid JSON string.");
                if (window.logDebug) window.logDebug("JSON Parse Error: " + e.message, "log-error");
                return;
            }

            if (!blueprint.ticker || !blueprint.companyName) {
                alert("Invalid Blueprint: Missing 'ticker' or 'companyName'.");
                if (window.logDebug) window.logDebug("Invalid Blueprint Structure", "log-error");
                return;
            }

            btnGenerate.innerText = 'Generating...';
            btnGenerate.disabled = true;

            try {
                if (window.logDebug) window.logDebug(`Parsed Blueprint for: $${blueprint.ticker}`, "log-info");

                // 3. Delegate to Pure Renderer
                if (window.buildPanels) {
                    const slideCount = await window.buildPanels(blueprint);
                    if (window.updateNavigation) window.updateNavigation(slideCount);
                    if (window.nextSlide) window.nextSlide(); // shift off homepage
                } else {
                    if (window.logDebug) window.logDebug("FATAL: renderer.js module not loaded.", "log-error");
                }

            } catch (err) {
                if (window.logDebug) window.logDebug(`Generation Error: ${err.message}`, "log-error");
                alert("An error occurred during generation. Check debug logs.");
            } finally {
                btnGenerate.innerText = 'Generate Dashboard';
                btnGenerate.disabled = false;
            }
        });
    }
});
