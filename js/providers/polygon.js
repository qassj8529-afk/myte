/**
 * provider: polygon.js
 * Implements Polygon capabilities: priceData, news, fundamentals
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.polygon = {

    priceData: async function (ticker, apiKey) {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setFullYear(toDate.getFullYear() - 1);

        const format = (d) => d.toISOString().split('T')[0];
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${format(fromDate)}/${format(toDate)}?adjusted=true&sort=asc&apiKey=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.status !== 'OK' || !data.results) throw new Error(data.error || 'Empty');

        // Normalize to: {time: unix, open, high, low, close, volume}
        return data.results.map(r => ({
            time: Math.floor(r.t / 1000), // ms -> UNIX seconds
            open: r.o,
            high: r.h,
            low: r.l,
            close: r.c,
            volume: r.v
        }));
    },

    news: async function (ticker, apiKey) {
        const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=10&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.status !== 'OK' || !data.results) throw new Error('Empty');

        // Normalize to: {url, img, source, date, title}
        return data.results.map(item => ({
            url: item.article_url,
            img: item.image_url,
            source: item.publisher?.name || 'Polygon',
            date: new Date(item.published_utc).toLocaleDateString(),
            title: item.title
        }));
    },

    fundamentals: async function (ticker, apiKey) {
        const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.status !== 'OK' || !data.results) throw new Error('Empty');

        const resData = data.results;
        // Normalize to Array of {label, value}
        return [
            { label: 'Market Cap', value: resData.market_cap ? (resData.market_cap / 1e9).toFixed(2) + 'B' : 'N/A' },
            { label: 'Outstanding Shares', value: resData.share_class_shares_outstanding ? (resData.share_class_shares_outstanding / 1e6).toFixed(2) + 'M' : 'N/A' },
            { label: 'Primary Exch', value: resData.primary_exchange || 'N/A' },
            { label: 'Employees', value: resData.total_employees ? resData.total_employees.toLocaleString() : 'N/A' }
        ];
    }
};
