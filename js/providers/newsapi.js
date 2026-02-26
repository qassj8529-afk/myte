/**
 * provider: newsapi.js
 * Implements NewsAPI capabilities: news
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.newsapi = {

    news: async function (ticker, apiKey) {
        const url = `https://newsapi.org/v2/everything?q=${ticker}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.status !== 'ok' || !data.articles) throw new Error(data.message || 'Empty');

        // Normalize to: {url, img, source, date, title}
        return data.articles.map(item => ({
            url: item.url,
            img: item.urlToImage || 'https://via.placeholder.com/350x180?text=No+Image',
            source: item.source?.name || 'NewsAPI',
            date: new Date(item.publishedAt).toLocaleDateString(),
            title: item.title
        }));
    }
};
