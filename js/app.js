/**
 * app.js
 * Generates slides through the Data Router based on defined capabilities.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('btn-generate');

    if (window.initDebug) initDebug();
    if (window.initNavigation) initNavigation();
    if (window.initMagnifier) initMagnifier();
    if (window.initCapabilities) initCapabilities();

    btnGenerate.addEventListener('click', async () => {

        // 1. Safety Check for file:// protocol
        if (window.location.protocol === 'file:') {
            const banner = document.getElementById('file-protocol-warning');
            if (banner) banner.classList.remove('hidden');
            if (window.logDebug) window.logDebug("FATAL: Cannot fetch from file:// protocol due to CORS. Use local server.", "log-error");
            return;
        }

        const scriptText = document.getElementById('script-input').value.trim();
        if (!scriptText) {
            alert("Please paste an analysis script.");
            return;
        }

        // 2. Evaluate Capabilities
        const capabilities = window.evaluateCapabilities();
        const activeProviderKeys = Object.keys(AppState.activeProviders);

        if (activeProviderKeys.length === 0) {
            if (window.logDebug) window.logDebug("No capabilities authorized. Generation halted.", "log-warn");
            document.getElementById('api-status').innerText = 'Requires at least one API Key (e.g. Polygon).';
            document.getElementById('api-status').style.color = '#ef4444';
            return;
        }

        document.getElementById('api-status').innerText = `Valid Engine. Active branches: ${activeProviderKeys.join(', ')}`;
        document.getElementById('api-status').style.color = '#4ade80';

        // 3. Extract Ticker
        const ticker = extractTicker(scriptText);
        if (window.logDebug) window.logDebug(`Detected ticker: $${ticker}`, "log-info");

        // 4. Delegate to dynamic Panel Builder
        if (window.buildPanels) {
            const slideCount = await window.buildPanels(scriptText, ticker);
            updateNavigation(slideCount);
            nextSlide(); // shift to analysis slide
        } else {
            if (window.logDebug) window.logDebug("FATAL: panelBuilder module not loaded.", "log-error");
        }
    });

});

function extractTicker(scriptText) {
    const match = scriptText.match(/\$([A-Z]{1,5})\b/i);
    return match && match[1] ? match[1].toUpperCase() : 'AAPL';
}
