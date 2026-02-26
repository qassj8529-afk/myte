/**
 * provider: fmp.js
 * Implements Financial Modeling Prep capabilities: fundamentals
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.fmp = {

    fundamentals: async function (ticker, apiKey) {
        const url = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data || data.length === 0) throw new Error('Empty');

        const m = data[0];
        return [
            { label: 'Market Cap', value: m.mktCap ? '$' + (m.mktCap / 1e9).toFixed(2) + 'B' : 'N/A' },
            { label: 'Price', value: m.price ? '$' + m.price.toFixed(2) : 'N/A' },
            { label: 'DCF Value', value: m.dcf ? '$' + m.dcf.toFixed(2) : 'N/A' },
            { label: 'CEO', value: m.ceo || 'N/A' }
        ];
    }
};
