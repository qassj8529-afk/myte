/**
 * panelBuilder.js
 * Generates specific slides ONLY if their capability exists AND they are specifically requested in the JSON Blueprint array.
 */

window.buildPanels = async function (blueprint) {
    const wrapper = document.getElementById('slider-wrapper');
    const panelsReq = blueprint.dashboardPanelsRequired;
    const ticker = blueprint.ticker;

    // Clear old slides
    const existingSlides = document.querySelectorAll('.slide');
    for (let i = 1; i < existingSlides.length; i++) {
        existingSlides[i].remove();
    }

    let slideCount = 1;

    // Render Charts
    if (panelsReq.includes('chart') && AppState.capabilities.priceData) {
        const slide = await spawnPanel(ticker, 'Price Action', async (container) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-fullscreen-container';
            container.appendChild(chartWrapper);

            const res = await routeDataRequest('priceData', ticker);
            if (res && res.data) {
                if (window.renderTVChart) window.renderTVChart(chartWrapper, res.data);
                return true;
            }
            return false;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render Key Metrics
    if (panelsReq.includes('key_metrics') && AppState.capabilities.fundamentals) {
        const slide = await spawnPanel(ticker, 'Key Metrics', async (container) => {
            const res = await routeDataRequest('fundamentals', ticker);
            if (res && res.data) {
                const grid = document.createElement('div');
                grid.className = 'metrics-grid';
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

    // Render Fundamentals (Detailed)
    if (panelsReq.includes('fundamentals') && AppState.capabilities.fundamentals) {
        const slide = await spawnPanel(ticker, 'Fundamentals Deep Dive', async (container) => {
            const res = await routeDataRequest('fundamentals', ticker);
            // If FMP provides more detailed objects, this would map them. 
            // For now, re-using metrics display safely if data exists.
            if (res && res.data) {
                const grid = document.createElement('div');
                grid.className = 'metrics-grid';
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

    // Render Earnings (Needs endpoint modification, using blueprint logic securely)
    if (panelsReq.includes('earnings')) {
        const slide = await spawnPanel(ticker, 'Earnings Review', async (container) => {
            // Feature placeholder to match blueprint reqs 
            container.innerHTML = `<div class="message-panel">Earnings Data unavailable from active providers.</div>`;
            return true; // We render the panel as "requested but unavailable" for now given current API abstractions
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render Short Interest 
    if (panelsReq.includes('short_interest')) {
        const slide = await spawnPanel(ticker, 'Short Interest & Sentiment', async (container) => {
            container.innerHTML = `<div class="message-panel">Short Interest Data unavailable from active providers.</div>`;
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // Render Social Sentiment
    if (panelsReq.includes('social_sentiment') && AppState.capabilities.social) {
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

    // Render Risk Scenarios (Driven explicitly by Blueprint text)
    if (panelsReq.includes('risk_scenarios') && blueprint.riskScenarios) {
        const slide = await spawnPanel(ticker, 'Risk Scenarios', async (container) => {
            const bull = blueprint.riskScenarios.bullCase || "No bull case listed.";
            const bear = blueprint.riskScenarios.bearCase || "No bear case listed.";

            container.innerHTML = `
          <div style="display:flex; gap: 2rem; width:100%; height:100%;">
             <div class="glass-panel" style="flex:1; padding: 2rem; border-top: 4px solid #4ade80;">
                <h3 style="color:#4ade80; margin-bottom: 1rem;">Bull Case</h3>
                <p>${bull}</p>
             </div>
             <div class="glass-panel" style="flex:1; padding: 2rem; border-top: 4px solid #ef4444;">
                <h3 style="color:#ef4444; margin-bottom: 1rem;">Bear Case</h3>
                <p>${bear}</p>
             </div>
          </div>
        `;
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }


    // Render Industry Context (Media)
    if (panelsReq.includes('industry_context') && AppState.capabilities.images) {
        const slide = await spawnPanel(ticker, 'Industry Context', async (container) => {
            const query = blueprint.companyName ? blueprint.companyName + " industry" : ticker + " industry";
            const res = await routeDataRequest('images', ticker, query);
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
 * Creates a generic full-screen slide with `.overlay-layer` built in.
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

    // CRITICAL: The overlay layer for director tools to draw upon
    const overlay = document.createElement('div');
    overlay.className = 'overlay-layer';

    slide.appendChild(wrapper);
    slide.appendChild(overlay);

    try {
        const success = await rendererFn(container);
        if (success) {
            return slide;
        } else {
            // If a capability was true but the API request failed deeply, show failsafe message.
            container.innerHTML = `<div class="message-panel">Data unavailable from active providers.</div>`;
            return slide; // Still return the slide so the user knows an attempt was made and failed.
        }
    } catch (e) {
        if (window.logDebug) window.logDebug(`Panel Build Error for ${titleString}: ` + e.message, 'log-error');
        // Failsafe per instructions
        container.innerHTML = `<div class="message-panel">Data unavailable from active providers.</div>`;
        return slide;
    }
}
