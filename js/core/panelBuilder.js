/**
 * panelBuilder.js
 * Generates specific slides ONLY if their capability exists.
 */

window.buildPanels = async function (scriptText, ticker) {
    const wrapper = document.getElementById('slider-wrapper');

    // Clear old slides
    const existingSlides = document.querySelectorAll('.slide');
    for (let i = 1; i < existingSlides.length; i++) {
        existingSlides[i].remove();
    }

    let slideCount = 1;

    // Render Charts if Price Data available
    if (AppState.capabilities.priceData) {
        const slide = await spawnPanel(ticker, 'Price Action', async (container) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-fullscreen-container';
            container.appendChild(chartWrapper);

            const res = await routeDataRequest('priceData', ticker);
            if (res && res.data) {
                if (window.renderTVChart) window.renderTVChart(chartWrapper, res.data);
                return true;
            }
            return false; // Did not render
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    } else {
        logDebug("Skipped Chart panel: 'priceData' capability missing.", 'log-warn');
    }

    // Render Fundamentals (Metrics)
    if (AppState.capabilities.fundamentals) {
        const slide = await spawnPanel(ticker, 'Key Metrics', async (container) => {
            const res = await routeDataRequest('fundamentals', ticker);
            if (res && res.data) {
                const grid = document.createElement('div');
                grid.className = 'metrics-grid';

                // Generic renderer since structure might vary per provider
                // Assuming provider normalizes to [{label: 'Market Cap', value: '3T'}, ...]
                res.data.forEach(m => {
                    const card = document.createElement('div');
                    card.className = 'metric-card glass-panel';
                    card.innerHTML = `<div class="label">${m.label}</div><div class="value">${m.value}</div>`;
                    grid.appendChild(card);
                });
                container.appendChild(grid);
                return true;
            }
            return false;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render News
    if (AppState.capabilities.news) {
        const slide = await spawnPanel(ticker, 'Recent Headlines', async (container) => {
            const res = await routeDataRequest('news', ticker);
            if (res && res.data) {
                const grid = document.createElement('div');
                grid.className = 'news-grid';

                // Normalized expected: [{url, img, source, date, title}]
                res.data.forEach(item => {
                    const card = document.createElement('a');
                    card.className = 'news-card';
                    card.href = item.url || '#';
                    card.target = '_blank';
                    card.innerHTML = `
            <img src="${item.img || 'https://via.placeholder.com/350x180?text=No+Image'}" class="news-thumb" alt="News">
            <div class="news-content">
              <div class="news-meta">${item.source || 'Unknown'} | ${item.date || ''}</div>
              <div class="news-title">${item.title}</div>
            </div>
          `;
                    grid.appendChild(card);
                });
                container.appendChild(grid);
                return true;
            }
            return false;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render Social
    if (AppState.capabilities.social) {
        const slide = await spawnPanel(ticker, 'Social Sentiment', async (container) => {
            const res = await routeDataRequest('social', ticker);
            if (res && res.data) {
                const list = document.createElement('div');
                list.className = 'reddit-list';
                res.data.forEach(item => {
                    const card = document.createElement('a');
                    card.className = 'reddit-item';
                    card.href = item.url;
                    card.target = '_blank';
                    card.innerHTML = `
            <div class="reddit-meta">${item.community} | ${item.metrics}</div>
            <div class="reddit-title">${item.title}</div>
          `;
                    list.appendChild(card);
                });
                container.appendChild(list);
                return true;
            }
            return false;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render Images
    if (AppState.capabilities.images) {
        const slide = await spawnPanel(ticker, 'Industry Context', async (container) => {
            const query = ticker + " corporate finance";
            const res = await routeDataRequest('images', ticker, query); // ticker unused here essentially
            if (res && res.data) {
                const grid = document.createElement('div');
                grid.className = 'images-flow';
                res.data.forEach(imgData => {
                    const img = document.createElement('img');
                    img.src = imgData.src;
                    img.className = 'glass-panel';
                    grid.appendChild(img);
                });
                container.appendChild(grid);
                return true;
            }
            return false;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    return slideCount;
}

/**
 * Creates a generic full-screen slide if the renderer succeeds.
 */
async function spawnPanel(ticker, titleString, rendererFn) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const wrapper = document.createElement('div');
    wrapper.className = 'slide-content-wrapper';

    const title = document.createElement('h2');
    title.className = 'slide-title';
    title.innerText = `${titleString} - $${ticker}`;
    wrapper.appendChild(title);

    const container = document.createElement('div');
    container.className = 'panel-container';
    wrapper.appendChild(container);
    slide.appendChild(wrapper);

    try {
        const success = await rendererFn(container);
        if (success) {
            return slide;
        } else {
            // Per prompt instructions: Do not render panel if no provider data
            return null;
        }
    } catch (e) {
        if (window.logDebug) window.logDebug(`Panel Build Error for ${titleString}: ` + e.message, 'log-error');
        return null;
    }
}
