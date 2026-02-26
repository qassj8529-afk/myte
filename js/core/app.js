/**
 * app.js
 * Central application orchestrator. Bootstraps tools, local storage, API validation, and dashboard parsing.
 */

// Cache key array
const API_KEYS = [
    'api-polygon', 'api-alphavantage', 'api-finnhub', 'api-fmp',
    'api-gnews', 'api-newsapi', 'api-pexels', 'api-unsplash', 'api-reddit'
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize tools
    if (window.initDebug) window.initDebug();
    if (window.initNavigation) window.initNavigation();
    if (window.initMagnifier) window.initMagnifier();
    if (window.initDirectorTools) window.initDirectorTools();
    if (window.initCapabilities) window.initCapabilities();

    // 2. Load cached API keys from localStorage
    API_KEYS.forEach(keyId => {
        const el = document.getElementById(keyId);
        if (el) {
            const cached = localStorage.getItem(keyId);
            if (cached) el.value = cached;

            // Hook change listener to auto-persist
            el.addEventListener('input', (e) => {
                localStorage.setItem(keyId, e.target.value.trim());
            });
        }
    });

    // UI Setup
    const btnValidate = document.getElementById('btn-validate');
    const btnGenerate = document.getElementById('btn-generate');

    if (btnValidate) {
        btnValidate.addEventListener('click', async () => {
            btnValidate.innerText = 'Validating...';
            btnValidate.disabled = true;
            try {
                if (window.validateCapabilities) {
                    await window.validateCapabilities();
                } else {
                    if (window.logDebug) window.logDebug("validateCapabilities missing.", "log-error");
                }
            } catch (e) {
                if (window.logDebug) window.logDebug(`Validation threw: ${e.message}`, "log-error");
            } finally {
                btnValidate.innerText = 'Validate Keys';
                btnValidate.disabled = false;
            }
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', async () => {
            // 1. Initial Checks
            if (window.location.protocol === 'file:') {
                const banner = document.getElementById('file-protocol-warning');
                if (banner) banner.classList.remove('hidden');
                if (window.logDebug) window.logDebug("FATAL: Cannot fetch from file:// protocol due to CORS.", "log-error");
                return;
            }

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
                alert("Invalid JSON format. Please paste a valid JSON Blueprint.");
                if (window.logDebug) window.logDebug("JSON Parse Error: " + e.message, "log-error");
                return;
            }

            if (!blueprint.ticker || !blueprint.dashboardPanelsRequired || !Array.isArray(blueprint.dashboardPanelsRequired)) {
                alert("Invalid Blueprint: Missing 'ticker' or 'dashboardPanelsRequired' array.");
                if (window.logDebug) window.logDebug("Invalid Blueprint Structure", "log-error");
                return;
            }

            // 3. Final Pre-Flight State Verification
            btnGenerate.innerText = 'Generating...';
            btnGenerate.disabled = true;

            try {
                // Verify capabilities if user didn't hit Validate explicitly
                if (!window.AppState || Object.keys(window.AppState.activeProviders).length === 0) {
                    if (window.validateCapabilities) {
                        await window.validateCapabilities();
                    }
                }

                const activeProviderKeys = Object.keys(window.AppState.activeProviders);

                if (activeProviderKeys.length === 0) {
                    if (window.logDebug) window.logDebug("No APIs validated successfully. Attempting fallback render.", "log-warn");
                    // We allow Generation to proceed, as some panels might not strictly need keys (e.g. static text panels)
                    // or if the user wants to see the missing data error states.
                    document.getElementById('api-status').innerText = '0 API Keys. UI will show warnings.';
                    document.getElementById('api-status').style.color = '#fbbf24'; // yellow-400
                }

                if (window.logDebug) window.logDebug(`Parsed Blueprint for: $${blueprint.ticker}`, "log-info");

                // 4. Delegate to Panel Builder
                if (window.buildPanels) {
                    const slideCount = await window.buildPanels(blueprint);
                    if (window.updateNavigation) window.updateNavigation(slideCount);
                    if (window.nextSlide) window.nextSlide(); // shift off homepage
                } else {
                    if (window.logDebug) window.logDebug("FATAL: panelBuilder module not loaded.", "log-error");
                }

            } catch (err) {
                if (window.logDebug) window.logDebug(`Generation Error: ${err.message}`, "log-error");
                alert("An error occurred during generation. Check debug logs.");
            } finally {
                // Restore button state
                btnGenerate.innerText = 'Generate Dashboard';
                btnGenerate.disabled = false;
            }
        });
    }
});
