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
 * Lightweight helper to verify an API key against a fast endpoint.
 */
async function testEndpoint(provider, url, headers = {}) {
    try {
        const res = await fetch(url, { headers, mode: 'cors' });
        if (res.ok) return { valid: true };
        if (res.status === 401 || res.status === 403) return { valid: false, error: 'Unauthorized/Invalid Key' };
        return { valid: false, error: `Error ${res.status}` };
    } catch (e) {
        return { valid: false, error: 'Network Error' };
    }
}


/**
 * Async validation of all keys before registering capabilities.
 */
async function validateCapabilities() {
    const statusEl = document.getElementById('api-status');
    if (statusEl) {
        statusEl.innerText = 'Validating API Keys...';
        statusEl.style.color = '#93c5fd'; // blue-300
    }

    // Pure state reset
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

    const validMap = {};
    const errorMap = {};
    const promises = [];

    // Evaluate Polygon
    if (keys.polygon) {
        promises.push(testEndpoint('polygon', `https://api.polygon.io/v3/reference/tickers?limit=1&apiKey=${keys.polygon}`).then(r => {
            if (r.valid) {
                validMap.polygon = true;
                AppState.capabilities.priceData = true;
                AppState.capabilities.news = true;
                AppState.capabilities.fundamentals = true;
            } else errorMap.polygon = r.error;
        }));
    }

    // Alpha Vantage (often doesn't hard fail 401 on standard endpoints but returns JSON error message, we do a basic ticker search)
    if (keys.alphavantage) {
        promises.push(testEndpoint('alphavantage', `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=AAPL&apikey=${keys.alphavantage}`).then(r => {
            // Assume valid if it didn't throw network error, routing will catch bad responses
            if (r.valid) {
                validMap.alphavantage = true;
                AppState.capabilities.priceData = true;
                AppState.capabilities.news = true;
            } else errorMap.alphavantage = r.error;
        }));
    }

    // Finnhub
    if (keys.finnhub) {
        promises.push(testEndpoint('finnhub', `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${keys.finnhub}`).then(r => {
            if (r.valid) {
                validMap.finnhub = true;
                AppState.capabilities.websocket = true;
                AppState.capabilities.fundamentals = true;
            } else errorMap.finnhub = r.error;
        }));
    }

    // FMP
    if (keys.fmp) {
        promises.push(testEndpoint('fmp', `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${keys.fmp}`).then(r => {
            if (r.valid) {
                validMap.fmp = true;
                AppState.capabilities.fundamentals = true;
                AppState.capabilities.insiderData = true;
            } else errorMap.fmp = r.error;
        }));
    }

    // GNews
    if (keys.gnews) {
        promises.push(testEndpoint('gnews', `https://gnews.io/api/v4/search?q=apple&max=1&apikey=${keys.gnews}`).then(r => {
            if (r.valid) {
                validMap.gnews = true;
                AppState.capabilities.news = true;
            } else errorMap.gnews = r.error;
        }));
    }

    // NewsAPI
    if (keys.newsapi) {
        promises.push(testEndpoint('newsapi', `https://newsapi.org/v2/everything?q=apple&pageSize=1&apiKey=${keys.newsapi}`).then(r => {
            if (r.valid) {
                validMap.newsapi = true;
                AppState.capabilities.news = true;
            } else errorMap.newsapi = r.error;
        }));
    }

    // Pexels
    if (keys.pexels) {
        promises.push(testEndpoint('pexels', `https://api.pexels.com/v1/search?query=business&per_page=1`, { Authorization: keys.pexels }).then(r => {
            if (r.valid) {
                validMap.pexels = true;
                AppState.capabilities.images = true;
            } else errorMap.pexels = r.error;
        }));
    }

    // Unsplash
    if (keys.unsplash) {
        promises.push(testEndpoint('unsplash', `https://api.unsplash.com/search/photos?query=business&per_page=1`, { Authorization: `Client-ID ${keys.unsplash}` }).then(r => {
            if (r.valid) {
                validMap.unsplash = true;
                AppState.capabilities.images = true;
            } else errorMap.unsplash = r.error;
        }));
    }

    // Reddit (often works without explicit key)
    if (keys.reddit || true) {
        validMap.reddit = true;
        AppState.capabilities.social = true;
    }

    // Wait for all tests to resolve (using Promise.allSettled implicitly by awaiting Promise.all of caught promises)
    await Promise.all(promises);

    AppState.activeProviders = validMap;

    // UI Generation
    const totalChecked = promises.length + (keys.reddit ? 1 : 0);
    const activeCount = Object.keys(validMap).length;

    if (statusEl) {
        if (activeCount === 0 && promises.length > 0) {
            statusEl.innerText = `Validation Failed. All ${promises.length} keys invalid.`;
            statusEl.style.color = '#ef4444'; // red-500
        } else if (activeCount > 0) {
            statusEl.innerText = `Success. ${activeCount} providers active.`;
            statusEl.style.color = '#4ade80'; // green-400

            const errors = Object.keys(errorMap).map(k => `${k}: ${errorMap[k]}`).join(' | ');
            if (errors) {
                statusEl.innerText += ` (Failed: ${errors})`;
            }
        } else {
            statusEl.innerText = 'Awaiting configuration (Keys Optional for Mock/Reddit)';
            statusEl.style.color = '#fde047'; // yellow-300
        }
    }

    if (window.logDebug) window.logDebug(`Validation complete. Active providers: ${Object.keys(validMap).join(', ')}`, 'log-info');
    return AppState.capabilities;
}

// Make accessible
window.AppState = AppState;
window.initCapabilities = initCapabilities;
window.validateCapabilities = validateCapabilities;
