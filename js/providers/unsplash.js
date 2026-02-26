/**
 * provider: unsplash.js
 * Implements Unsplash capabilities: images
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.unsplash = {

    images: async function (ticker, apiKey, query) {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5`;
        const res = await fetch(url, { headers: { Authorization: `Client-ID ${apiKey}` } });
        const data = await res.json();

        if (!res.ok || !data.results) throw new Error('Empty');

        // Normalize to: {src, alt, provider}
        return data.results.map(p => ({
            src: p.urls.regular,
            alt: p.alt_description || 'Unsplash Image',
            provider: 'Unsplash'
        }));
    }
};
