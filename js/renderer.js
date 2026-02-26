/**
 * renderer.js
 * Generates the 9 exact, specific slides from the JSON Blueprint structure.
 * Will only render a slide if the data required for that specific slide exists in the payload.
 */

window.buildPanels = async function (blueprint) {
    const wrapper = document.getElementById('slider-wrapper');
    const tkr = blueprint.ticker || 'UNKNOWN';

    // Clear old slides (keep Start Screen)
    const existingSlides = document.querySelectorAll('.slide');
    for (let i = 1; i < existingSlides.length; i++) {
        existingSlides[i].remove();
    }

    let slideCount = 1;

    // 1. Overview Slide
    if (blueprint.companyName || blueprint.primaryNarrative) {
        const slide = spawnPanel(tkr, 'Company Overview', (container) => {
            const grid = document.createElement('div');
            grid.className = 'overview-grid';

            const leftCol = document.createElement('div');
            leftCol.className = 'overview-main glass-panel';
            leftCol.style.padding = '2rem';
            leftCol.innerHTML = `
          <div class="overview-ticker">$${tkr}</div>
          <div class="overview-name">${blueprint.companyName || 'N/A'}</div>
          <div style="margin-top:1rem; color:var(--text-secondary);">
            <div><strong>Price:</strong> ${blueprint.currentPrice || 'N/A'}</div>
            <div><strong>Market Cap:</strong> ${blueprint.marketCap || 'N/A'}</div>
            <div><strong>Sector:</strong> ${blueprint.sector || 'N/A'}</div>
            <div><strong>Industry:</strong> ${blueprint.industry || 'N/A'}</div>
          </div>
        `;
            grid.appendChild(leftCol);

            const rightCol = document.createElement('div');
            rightCol.className = 'overview-main glass-panel';
            rightCol.style.padding = '2rem';

            let themesHtml = '';
            if (blueprint.analysisThemes && Array.isArray(blueprint.analysisThemes)) {
                themesHtml = `<ul class="bullet-list" style="margin-top:1rem;">` +
                    blueprint.analysisThemes.map(t => `<li>${t}</li>`).join('') + `</ul>`;
            }

            rightCol.innerHTML = `
          <h3 style="color:#fff;">Primary Narrative</h3>
          <p style="margin-top:0.5rem;">${blueprint.primaryNarrative || 'N/A'}</p>
          <h3 style="color:#fff; margin-top:2rem;">Key Themes</h3>
          ${themesHtml}
        `;
            grid.appendChild(rightCol);

            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 2. Chart Slide
    if (blueprint.chartConfiguration) {
        const slide = spawnPanel(tkr, 'Price Action & Technicals', (container) => {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-fullscreen-container';

            // Determine interval
            const tf = blueprint.chartConfiguration.suggestedTimeframe || 'Daily';
            let interval = 'D';
            if (tf.toLowerCase().includes('intraday')) interval = '15';

            chartWrapper.innerHTML = `
<!-- TradingView Widget BEGIN -->
  <iframe scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/widgetembed/?symbol=${tkr}&interval=${interval}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=${tkr}" style="width: 100%; height: 100%;"></iframe>
<!-- TradingView Widget END -->
        `;
            container.appendChild(chartWrapper);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 3. Key Metrics Slide
    if (blueprint.keyMetrics) {
        const slide = spawnPanel(tkr, 'Key Metrics', (container) => {
            const m = blueprint.keyMetrics;
            const grid = document.createElement('div');
            grid.className = 'metrics-grid';

            const metrics = [
                { label: '52 Week High', val: m.fiftyTwoWeekHigh },
                { label: '52 Week Low', val: m.fiftyTwoWeekLow },
                { label: 'Revenue TTM', val: m.revenueTTM },
                { label: 'EPS TTM', val: m.epsTTM },
                { label: 'Short Interest', val: m.shortInterestPercent },
                { label: 'Borrow Rate', val: m.borrowRate }
            ];

            metrics.forEach(item => {
                const card = document.createElement('div');
                card.className = 'metric-card glass-panel';
                card.innerHTML = `<div class="label">${item.label}</div><div class="value">${item.val !== undefined && item.val !== null ? item.val : 'Not Available'}</div>`;
                grid.appendChild(card);
            });

            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 4. Earnings Slide
    if (blueprint.earningsData) {
        const slide = spawnPanel(tkr, 'Earnings Review', (container) => {
            const grid = document.createElement('div');
            grid.className = 'overview-grid';
            grid.innerHTML = `
           <div class="glass-panel" style="padding:2rem;">
             <h3 style="color:var(--text-secondary); text-transform:uppercase; font-size:0.9rem;">Next Earnings Date</h3>
             <div style="font-size:2rem; color:#fff; font-weight:600; margin-top:0.5rem;">${blueprint.earningsData.nextEarningsDate || 'Unknown'}</div>
           </div>
           <div class="glass-panel" style="padding:2rem;">
             <h3 style="color:var(--text-secondary); text-transform:uppercase; font-size:0.9rem;">Recent Earnings Summary</h3>
             <p style="margin-top:1rem;">${blueprint.earningsData.recentEarningsSummary || 'No summary provided.'}</p>
           </div>
         `;
            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 5. Institutional + Insider Slide
    if (blueprint.insiderAndInstitutional) {
        const slide = spawnPanel(tkr, 'Institutional & Insider', (container) => {
            const grid = document.createElement('div');
            grid.className = 'split-layout';
            grid.innerHTML = `
          <div class="split-col glass-panel" style="border-top: 4px solid #c084fc;">
            <div class="col-title">Insider Activity</div>
            <p>${blueprint.insiderAndInstitutional.insiderActivitySummary || 'Not available.'}</p>
          </div>
          <div class="split-col glass-panel" style="border-top: 4px solid #3b82f6;">
            <div class="col-title">Institutional Ownership</div>
            <p>${blueprint.insiderAndInstitutional.institutionalOwnershipSummary || 'Not available.'}</p>
          </div>
        `;
            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 6. News Slide
    if (blueprint.recentNews && Array.isArray(blueprint.recentNews) && blueprint.recentNews.length > 0) {
        const slide = spawnPanel(tkr, 'Recent News', (container) => {
            const grid = document.createElement('div');
            grid.className = 'news-grid';
            blueprint.recentNews.forEach(n => {
                const card = document.createElement('a');
                card.className = 'news-card';
                card.href = n.url || '#';
                card.target = '_blank';
                card.style.textDecoration = 'none';
                card.innerHTML = `
          <div class="news-content">
            <div class="news-meta">${n.source || 'News'} &bull; ${n.publishedDate || ''}</div>
            <div class="news-title">${n.title || 'Untitled'}</div>
            <div style="color:var(--accent-color); font-size:0.8rem; margin-top:1rem; word-break: break-all;">${n.url || ''}</div>
          </div>
        `;
                grid.appendChild(card);
            });
            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 7. Corporate Actions Slide
    if (blueprint.corporateActions && Array.isArray(blueprint.corporateActions) && blueprint.corporateActions.length > 0) {
        const slide = spawnPanel(tkr, 'Corporate Actions', (container) => {
            const panel = document.createElement('div');
            panel.className = 'glass-panel';
            panel.style.padding = '2rem';
            panel.style.width = '100%';

            const list = `<ul class="bullet-list">` + blueprint.corporateActions.map(a => `<li>${a}</li>`).join('') + `</ul>`;
            panel.innerHTML = list;

            container.appendChild(panel);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    // 8. Bull vs Bear Slide
    if (blueprint.bullVsBear) {
        const slide = spawnPanel(tkr, 'Bull vs Bear', (container) => {
            const bull = blueprint.bullVsBear.bullCasePoints || [];
            const bear = blueprint.bullVsBear.bearCasePoints || [];

            const grid = document.createElement('div');
            grid.className = 'split-layout';
            grid.innerHTML = `
          <div class="split-col glass-panel col-bull">
            <div class="col-title" style="color:#4ade80;">Bull Case</div>
            <ul class="bullet-list">
               ${bull.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div class="split-col glass-panel col-bear">
            <div class="col-title" style="color:#ef4444;">Bear Case</div>
            <ul class="bullet-list">
               ${bear.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        `;
            container.appendChild(grid);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }


    // 9. Industry Context Slide
    if (blueprint.industryContext) {
        const slide = spawnPanel(tkr, 'Industry Context', (container) => {
            const p = document.createElement('div');
            p.className = 'glass-panel';
            p.style.padding = '3rem';
            p.style.width = '100%';

            p.innerHTML = `
        <div style="display:flex; gap: 4rem; margin-bottom: 2rem;">
           <div>
             <h3 style="color:var(--text-secondary); text-transform:uppercase; font-size:0.9rem;">Sector</h3>
             <div style="font-size:1.5rem; color:#fff; font-weight:500;">${blueprint.industryContext.sector || 'N/A'}</div>
           </div>
           <div>
             <h3 style="color:var(--text-secondary); text-transform:uppercase; font-size:0.9rem;">Industry</h3>
             <div style="font-size:1.5rem; color:#fff; font-weight:500;">${blueprint.industryContext.industry || 'N/A'}</div>
           </div>
        </div>
        <h3 style="color:var(--text-secondary); text-transform:uppercase; font-size:0.9rem; margin-bottom:1rem;">Top Competitors</h3>
        <ul class="bullet-list">
           ${(blueprint.industryContext.competitors || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
      `;
            container.appendChild(p);
            return true;
        });
        if (slide) { wrapper.appendChild(slide); slideCount++; }
    }

    return slideCount;
}

/**
 * Creates a generic full-screen slide with `.overlay-layer` built in.
 */
function spawnPanel(ticker, titleString, rendererFn) {
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
        const success = rendererFn(container);
        if (success) {
            if (window.logDebug) window.logDebug(`Generated Slide: ${titleString}`, 'log-success');
            return slide;
        }
    } catch (e) {
        if (window.logDebug) window.logDebug(`Panel Build Error for ${titleString}: ` + e.message, 'log-error');
        return null;
    }
}
