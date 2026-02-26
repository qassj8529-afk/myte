/**
 * capability.js
 * Analyzes provided API keys and activates capabilities.
 */

const AppState = {
    keys: {},
    capabilities: {
        priceData: false,
        fundamentals: false,
        news: false,
        social: false,
        images: false,
        websocket: false,
        insiderData: false
    },
    activeProviders: {} // Tracks which providers have valid keys
};

function initCapabilities() {
    const toggleBtn = document.getElementById('btn-toggle-apis');
    const expPanel = document.getElementById('expandable-api-panel');

    if (toggleBtn && expPanel) {
        toggleBtn.addEventListener('click', () => {
            expPanel.classList.toggle('open');
            if (expPanel.classList.contains('open')) {
                toggleBtn.innerText = 'Hide Optional Providers ▲';
            } else {
                toggleBtn.innerText = 'Show All Providers ▼';
            }
        });
    }
}

/**
 * Reads DOM inputs and builds the capability object.
 */
function evaluateCapabilities() {
    // Reset
    Object.keys(AppState.capabilities).forEach(k => AppState.capabilities[k] = false);
    AppState.activeProviders = {};

    const keys = {
        polygon: document.getElementById('api-polygon')?.value.trim(),
        alphavantage: document.getElementById('api-alphavantage')?.value.trim(),
        finnhub: document.getElementById('api-finnhub')?.value.trim(),
        fmp: document.getElementById('api-fmp')?.value.trim(),
        gnews: document.getElementById('api-gnews')?.value.trim(),
        newsapi: document.getElementById('api-newsapi')?.value.trim(),
        pexels: document.getElementById('api-pexels')?.value.trim(),
        unsplash: document.getElementById('api-unsplash')?.value.trim(),
        reddit: document.getElementById('api-reddit')?.value.trim()
    };

    AppState.keys = keys;

    // Evaluate Polygon
    if (keys.polygon) {
        AppState.activeProviders.polygon = true;
        AppState.capabilities.priceData = true;
        AppState.capabilities.news = true;
        AppState.capabilities.fundamentals = true;
    }

    // Evaluate Alpha Vantage
    if (keys.alphavantage) {
        AppState.activeProviders.alphavantage = true;
        AppState.capabilities.priceData = true;
        AppState.capabilities.news = true;
    }

    // Evaluate Finnhub
    if (keys.finnhub) {
        AppState.activeProviders.finnhub = true;
        AppState.capabilities.websocket = true;
        AppState.capabilities.fundamentals = true;
    }

    // Evaluate FMP
    if (keys.fmp) {
        AppState.activeProviders.fmp = true;
        AppState.capabilities.fundamentals = true;
        AppState.capabilities.insiderData = true;
    }

    // Evaluate Independent News
    if (keys.gnews) {
        AppState.activeProviders.gnews = true;
        AppState.capabilities.news = true;
    }
    if (keys.newsapi) {
        AppState.activeProviders.newsapi = true;
        AppState.capabilities.news = true;
    }

    // Evaluate Independent Media
    if (keys.pexels) {
        AppState.activeProviders.pexels = true;
        AppState.capabilities.images = true;
    }
    if (keys.unsplash) {
        AppState.activeProviders.unsplash = true;
        AppState.capabilities.images = true;
    }

    // Evaluate Reddit
    if (keys.reddit || true) { // Reddit free tier often works without explicit key for basic search
        AppState.activeProviders.reddit = true;
        AppState.capabilities.social = true;
    }

    logDebug(`Capabilities Evaluated. Active Domains: ${Object.keys(AppState.capabilities).filter(k => AppState.capabilities[k]).join(', ')}`, 'log-info');
    return AppState.capabilities;
}

// Make accessible to other core modules
window.AppState = AppState;
window.initCapabilities = initCapabilities;
window.evaluateCapabilities = evaluateCapabilities;
