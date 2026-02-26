/**
 * provider: pexels.js
 * Implements Pexels capabilities: images
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.pexels = {

    images: async function (ticker, apiKey, query) {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`;
        const res = await fetch(url, { headers: { Authorization: apiKey } });
        const data = await res.json();

        if (!res.ok || !data.photos) throw new Error('Empty');

        // Normalize to: {src, alt, provider}
        return data.photos.map(p => ({
            src: p.src.large,
            alt: p.alt || 'Pexels Image',
            provider: 'Pexels'
        }));
    }
};
