/**
 * dataRouter.js
 * Handles intelligent fallback and provider routing based on AppState capabilities.
 */

const ProviderPriority = {
    priceData: ['polygon', 'alphavantage', 'finnhub'],
    news: ['polygon', 'gnews', 'newsapi', 'alphavantage'],
    fundamentals: ['fmp', 'polygon', 'finnhub'],
    images: ['pexels', 'unsplash'],
    social: ['reddit']
};

/**
 * Core Router Function
 * Attempts to fetch data from providers in priority order.
 * @param {string} dataType - 'priceData', 'news', 'fundamentals', etc.
 * @param {string} ticker - The stock ticker
 * @param {string} [extra] - Optional extra params (e.g. search query for images)
 */
async function routeDataRequest(dataType, ticker, extra = '') {
    const priorities = ProviderPriority[dataType];
    if (!priorities) return null;

    for (const providerId of priorities) {
        if (AppState.activeProviders[providerId]) {
            const apiKey = AppState.keys[providerId];
            if (window.logDebug) window.logDebug(`[Router] Accessing ${providerId} for ${dataType}...`, 'log-routing');

            try {
                // We dynamically call window.PROVIDERS[providerId][dataType](ticker, apiKey)
                // Ensure providers are registered heavily
                if (window.PROVIDERS && window.PROVIDERS[providerId] && window.PROVIDERS[providerId][dataType]) {

                    const result = await window.PROVIDERS[providerId][dataType](ticker, apiKey, extra);

                    if (result && (!Array.isArray(result) || result.length > 0)) {
                        if (window.logDebug) window.logDebug(`[Router] Success: ${providerId} delivered ${dataType}.`, 'log-success');
                        return { provider: providerId, data: result };
                    } else {
                        if (window.logDebug) window.logDebug(`[Router] Fallback: ${providerId} returned empty for ${dataType}. Seeking next...`, 'log-warn');
                    }
                } else {
                    if (window.logDebug) window.logDebug(`[Router Error] Provider '${providerId}' does not have method for '${dataType}' registered.`, 'log-error');
                }
            } catch (e) {
                if (window.logDebug) window.logDebug(`[Router Fail] ${providerId} threw error for ${dataType}: ${e.message}. Seeking next...`, 'log-error');
            }
        }
    }

    // If we exhaust the list
    if (window.logDebug) window.logDebug(`[Router Fatal] All available providers failed to deliver ${dataType}.`, 'log-error');
    return null;
}

window.routeDataRequest = routeDataRequest;

// Initialize global providers registry
window.PROVIDERS = window.PROVIDERS || {};
