/**
 * provider: reddit.js
 * Implements Reddit capabilities: social
 */

window.PROVIDERS = window.PROVIDERS || {};
window.PROVIDERS.reddit = {

    social: async function (ticker, apiKey) {
        // Basic search endpoint (usually open without auth, handles optional API limits gracefully)
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(ticker)}&limit=5`;
        const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok || !data.data || !data.data.children) throw new Error('Empty');

        // Normalize to: {url, community, metrics, title}
        return data.data.children.map(post => {
            const p = post.data;
            return {
                url: `https://reddit.com${p.permalink}`,
                community: `r/${p.subreddit}`,
                metrics: `Score: ${p.score}`,
                title: p.title
            };
        });
    }
};
