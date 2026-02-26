/**
 * parser.js
 * Parses the input script to detect tickers and topics to build modules.
 */

const TOPIC_MAP = {
    chart: ['chart', 'price', 'volume', 'technical', 'moving average', 'rsi', 'bullish', 'bearish', 'trend'],
    financials: ['revenue', 'eps', 'guidance', 'margins', 'earnings', 'profit', 'balance sheet', 'cash flow'],
    news: ['news', 'pr ', 'press release', 'filing', 'sec ', '10-k', '10-q', '8-k', 'headline'],
    reddit: ['reddit', 'social', 'twitter', ' x ', 'wsb', 'wallstreetbets', 'sentiment'],
    short_interest: ['short interest', 'short squeeze', 'shorts', 'borrow fee'],
    holders: ['insider', 'institutional', 'holders', 'ownership', 'bought', 'sold shares'],
    business_model: ['business model', 'segments', 'pivot', 'restructuring', 'operations'],
    deals: ['deals', 'projects', 'contracts', 'jv', 'joint venture', 'partnership', 'pipeline'],
    images: ['image', 'visual', 'picture', 'factory', 'store', 'product', 'facility', 'industry context'],
    scenario: ['bull case', 'bear case', 'risk', 'scenario', 'upside', 'downside', 'catalyst']
};

/**
 * Extracts the primary ticker from the text.
 * Looks for $TICKER format first, then falls back to uppercase words (context-dependent, risky).
 */
function extractTicker(text) {
    const match = text.match(/\$([A-Z]{1,5})\b/i);
    if (match && match[1]) {
        return match[1].toUpperCase();
    }
    return null;
}

/**
 * Parses script into sections and determined modules.
 */
function parseScript(scriptText) {
    const ticker = extractTicker(scriptText) || 'AAPL'; // Default to AAPL if none found for demo purposes

    // Split by double newline to get paragraphs
    const rawParagraphs = scriptText.split(/\n\s*\n/);

    const sections = [];

    rawParagraphs.forEach(para => {
        const text = para.trim();
        if (!text) return;

        const lowerText = text.toLowerCase();
        const modules = new Set();

        // Check against topic map
        for (const [moduleName, keywords] of Object.entries(TOPIC_MAP)) {
            if (keywords.some(kw => lowerText.includes(kw))) {
                modules.add(moduleName);
            }
        }

        // If no specific module detected, maybe default to something or just text.
        // For a rich studio, we can default to 'financials' or 'images' if completely empty, 
        // but better to just return the detected ones to keep it relevant.

        sections.push({
            text,
            modules: Array.from(modules)
        });
    });

    return { ticker, sections };
}
