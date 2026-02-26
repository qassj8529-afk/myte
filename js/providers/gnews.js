/**
 * provider: gnews.js
 * Implements GNews capabilities: news
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.gnews = {

    news: async function (ticker, apiKey) {
        const url = `https://gnews.io/api/v4/search?q=${ticker}&lang=en&max=10&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.articles) throw new Error(data.errors ? data.errors[0] : 'Empty');

        // Normalize to: {url, img, source, date, title}
        return data.articles.map(item => ({
            url: item.url,
            img: item.image || 'https://via.placeholder.com/350x180?text=No+Image',
            source: item.source?.name || 'GNews',
            date: new Date(item.publishedAt).toLocaleDateString(),
            title: item.title
        }));
    }
};
