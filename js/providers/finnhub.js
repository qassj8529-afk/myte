/**
 * provider: finnhub.js
 * Implements Finnhub capabilities: priceData, fundamentals
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.finnhub = {

    priceData: async function (ticker, apiKey) {
        const to = Math.floor(Date.now() / 1000);
        const from = to - (365 * 24 * 60 * 60);
        const url = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.s !== 'ok') throw new Error('Data fetch failed');

        const formatted = [];
        for (let i = 0; i < data.t.length; i++) {
            formatted.push({
                time: data.t[i], // API already returns unix seconds
                open: data.o[i],
                high: data.h[i],
                low: data.l[i],
                close: data.c[i],
                volume: data.v[i]
            });
        }
        return formatted;
    },

    fundamentals: async function (ticker, apiKey) {
        const url = `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.metric) throw new Error('Empty');

        const m = data.metric;
        return [
            { label: '52 Wk High', value: m['52WeekHigh'] || 'N/A' },
            { label: '52 Wk Low', value: m['52WeekLow'] || 'N/A' },
            { label: 'Beta', value: m['beta'] ? m['beta'].toFixed(2) : 'N/A' },
            { label: 'P/E TTM', value: m['peTTM'] ? m['peTTM'].toFixed(2) : 'N/A' }
        ];
    }
};
