/**
 * app.js
 * Parses the JSON blueprint and triggers the build process.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('btn-generate');

    if (window.initDebug) initDebug();
    if (window.initNavigation) initNavigation();
    if (window.initMagnifier) initMagnifier();
    if (window.initDirectorTools) initDirectorTools();
    if (window.initCapabilities) initCapabilities();

    btnGenerate.addEventListener('click', async () => {

        // Safety
        if (window.location.protocol === 'file:') {
            const banner = document.getElementById('file-protocol-warning');
            if (banner) banner.classList.remove('hidden');
            if (window.logDebug) window.logDebug("FATAL: Cannot fetch from file:// protocol due to CORS. Use local server.", "log-error");
            return;
        }

        const scriptText = document.getElementById('script-input').value.trim();
        if (!scriptText) {
            alert("Please paste a JSON Blueprint.");
            return;
        }

        let blueprint = null;
        try {
            blueprint = JSON.parse(scriptText);
        } catch (e) {
            alert("Invalid JSON format. Please paste a valid JSON Blueprint.");
            if (window.logDebug) window.logDebug("JSON Parse Error: " + e.message, "log-error");
            return;
        }

        if (!blueprint.ticker || !blueprint.dashboardPanelsRequired || !Array.isArray(blueprint.dashboardPanelsRequired)) {
            alert("Invalid Blueprint: Missing 'ticker' or 'dashboardPanelsRequired' array.");
            if (window.logDebug) window.logDebug("Invalid Blueprint Structure", "log-error");
            return;
        }

        // Evaluate Capabilities
        const capabilities = window.evaluateCapabilities();
        const activeProviderKeys = Object.keys(AppState.activeProviders);

        if (activeProviderKeys.length === 0) {
            if (window.logDebug) window.logDebug("No capabilities authorized. Generation halted.", "log-warn");
            document.getElementById('api-status').innerText = 'Requires at least one API Key.';
            document.getElementById('api-status').style.color = '#ef4444';
            return;
        }

        document.getElementById('api-status').innerText = `Valid Engine. Active branches: ${activeProviderKeys.join(', ')}`;
        document.getElementById('api-status').style.color = '#4ade80';

        if (window.logDebug) window.logDebug(`Parsed Blueprint for: $${blueprint.ticker}`, "log-info");

        // Delegate to Panel Builder, passing the entire blueprint
        if (window.buildPanels) {
            const slideCount = await window.buildPanels(blueprint);
            updateNavigation(slideCount);
            nextSlide(); // shift to first actual slide
        } else {
            if (window.logDebug) window.logDebug("FATAL: panelBuilder module not loaded.", "log-error");
        }
    });

});
