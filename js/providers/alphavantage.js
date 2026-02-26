/**
 * provider: alphavantage.js
 * Implements Alpha Vantage capabilities: priceData, news
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.alphavantage = {

    priceData: async function (ticker, apiKey) {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data['Error Message'] || data['Information']) throw new Error(data['Error Message'] || data['Information']);

        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) throw new Error('No time series data');

        // Convert object to array and sort ascending
        const formatted = Object.keys(timeSeries).map(dateStr => {
            return {
                time: new Date(dateStr).getTime() / 1000,
                open: parseFloat(timeSeries[dateStr]['1. open']),
                high: parseFloat(timeSeries[dateStr]['2. high']),
                low: parseFloat(timeSeries[dateStr]['3. low']),
                close: parseFloat(timeSeries[dateStr]['4. close']),
                volume: parseInt(timeSeries[dateStr]['5. volume'])
            };
        }).sort((a, b) => a.time - b.time);

        // Alpha vantage daily returns all history typically, let's truncate to last ~250 trading days (1 year)
        return formatted.slice(-250);
    },

    news: async function (ticker, apiKey) {
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=10&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.feed) throw new Error(data['Error Message'] || 'Empty');

        // Normalize to: {url, img, source, date, title}
        return data.feed.map(item => ({
            url: item.url,
            img: item.banner_image || 'https://via.placeholder.com/350x180?text=No+Image',
            source: item.source || 'Alpha Vantage',
            date: item.time_published ? `${item.time_published.substring(0, 4)}-${item.time_published.substring(4, 6)}-${item.time_published.substring(6, 8)}` : 'Recent',
            title: item.title
        }));
    }
};
