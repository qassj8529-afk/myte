/**
 * renderer.js
 * Generates EXACTLY 5 slides based on the structured JSON string.
 */

window.buildPanels = async function (blueprint) {
  const wrapper = document.getElementById('slider-wrapper');
  const tkr = blueprint.ticker || '';
  const name = blueprint.companyName || '';

  // Clear old slides (keep Start Screen)
  const existingSlides = document.querySelectorAll('.slide');
  for (let i = 1; i < existingSlides.length; i++) existingSlides[i].remove();

  // Helpers
  const safeStr = (str) => (str !== null && str !== undefined && str !== 'NA') ? str : '';
  const safeVal = (val) => (val !== null && val !== undefined && val !== '' && val !== 'NA') ? val : 'Not Available';

  let slideCount = 1;

  // ==========================================
  // 1. OVERVIEW SLIDE (Always render)
  // ==========================================
  const s1 = spawnPanel(tkr, 'Company Overview', (container) => {
    const grid = document.createElement('div');
    grid.className = 'overview-grid';

    // Left Column 
    const leftCol = document.createElement('div');
    leftCol.className = 'overview-main glass-panel';
    leftCol.style.padding = '2rem';
    leftCol.innerHTML = `
          <div class="overview-ticker">${safeStr(tkr) ? `$${tkr}` : ''}</div>
          <div class="overview-name">${safeStr(name)}</div>
          <div style="margin-top:1.5rem; color:var(--text-secondary); line-height:1.8; font-size: 1.1rem;">
            <div><strong>Price:</strong> ${safeVal(blueprint.currentPrice)}</div>
            <div><strong>Market Cap:</strong> ${safeVal(blueprint.marketCap)}</div>
            <div><strong>Sector:</strong> ${safeVal(blueprint.sector)}</div>
            <div><strong>Industry:</strong> ${safeVal(blueprint.industry)}</div>
          </div>
        `;
    grid.appendChild(leftCol);

    // Right Column (Narrative)
    const rightCol = document.createElement('div');
    rightCol.className = 'overview-main glass-panel';
    rightCol.style.padding = '2rem';

    let themesHtml = '';
    if (blueprint.analysisThemes && Array.isArray(blueprint.analysisThemes) && blueprint.analysisThemes.length > 0) {
      themesHtml = `<ul class="bullet-list" style="margin-top:1rem;">` +
        blueprint.analysisThemes.map(t => `<li>${safeStr(t)}</li>`).join('') + `</ul>`;
    }

    rightCol.innerHTML = `
          <h3 style="color:var(--text-primary); font-size: 1.3rem;">Primary Narrative</h3>
          <p style="margin-top:0.8rem; line-height:1.6; color:var(--text-secondary);">${safeStr(blueprint.primaryNarrative) || 'No narrative provided.'}</p>
          ${themesHtml ? `<h3 style="color:var(--text-primary); font-size:1.3rem; margin-top:2rem;">Key Themes</h3>${themesHtml}` : ''}
        `;
    grid.appendChild(rightCol);

    container.appendChild(grid);
    return true;
  });
  if (s1) { wrapper.appendChild(s1); slideCount++; }

  // ==========================================
  // 2. CHART SLIDE (Always render if TradingView)
  // ==========================================
  const s2 = spawnPanel(tkr, 'Price Action & Technicals', (container) => {
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-fullscreen-container';
    chartWrapper.style.background = '#000'; // Pure black specific to this iframe
    chartWrapper.style.borderRadius = '12px';
    chartWrapper.style.overflow = 'hidden';

    let interval = 'D';
    if (blueprint.chartConfiguration && blueprint.chartConfiguration.suggestedTimeframe) {
      const tf = blueprint.chartConfiguration.suggestedTimeframe.toLowerCase();
      if (tf.includes('intraday') || tf.includes('15')) interval = '15';
      else if (tf.includes('week')) interval = 'W';
      else if (tf.includes('month')) interval = 'M';
    }

    chartWrapper.innerHTML = `
        <iframe scrolling="no" allowtransparency="true" frameborder="0" src="https://s.tradingview.com/widgetembed/?symbol=${tkr}&interval=${interval}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=${tkr}" style="width: 100%; height: 100%;"></iframe>
        `;
    container.appendChild(chartWrapper);
    return true;
  });
  if (s2) { wrapper.appendChild(s2); slideCount++; }

  // ==========================================
  // 3. FINANCIAL SNAPSHOT SLIDE (Merged)
  // ==========================================
  const s3 = spawnPanel(tkr, 'Financial Snapshot', (container) => {

    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'metrics-grid';
    metricsGrid.style.marginBottom = '2rem';

    const m = blueprint.keyMetrics || {};
    const earnings = blueprint.earningsData || {};
    const insider = blueprint.insiderAndInstitutional || {};

    const metrics = [
      { label: '52 Week High', val: m.fiftyTwoWeekHigh },
      { label: '52 Week Low', val: m.fiftyTwoWeekLow },
      { label: 'Revenue TTM', val: m.revenueTTM },
      { label: 'EPS TTM', val: m.epsTTM },
      { label: 'Next Earnings', val: earnings.nextEarningsDate }
    ];

    metrics.forEach(item => {
      const card = document.createElement('div');
      card.className = 'metric-card glass-panel';
      card.innerHTML = `<div class="label">${item.label}</div><div class="value">${safeVal(item.val)}</div>`;
      metricsGrid.appendChild(card);
    });

    container.appendChild(metricsGrid);

    // Bottom Row for Long Form Summaries
    if (insider.insiderActivitySummary || insider.institutionalOwnershipSummary) {
      const splitGrid = document.createElement('div');
      splitGrid.className = 'split-layout';
      splitGrid.style.flex = 'none';

      let html = '';
      if (insider.insiderActivitySummary) {
        html += `<div class="split-col glass-panel" style="border-top: 4px solid var(--accent-color);">
                <div class="col-title">Insider Activity</div>
                <p style="color:var(--text-secondary); line-height:1.6;">${safeStr(insider.insiderActivitySummary)}</p>
              </div>`;
      }
      if (insider.institutionalOwnershipSummary) {
        html += `<div class="split-col glass-panel" style="border-top: 4px solid #3b82f6;">
                <div class="col-title">Institutional Ownership</div>
                <p style="color:var(--text-secondary); line-height:1.6;">${safeStr(insider.institutionalOwnershipSummary)}</p>
              </div>`;
      }
      splitGrid.innerHTML = html;
      container.appendChild(splitGrid);
    }

    return true;
  });
  if (s3) { wrapper.appendChild(s3); slideCount++; }

  // ==========================================
  // 4. BULL VS BEAR SLIDE
  // ==========================================
  if (blueprint.bullVsBear && (blueprint.bullVsBear.bullCasePoints || blueprint.bullVsBear.bearCasePoints)) {
    const s4 = spawnPanel(tkr, 'Bull vs Bear', (container) => {
      const bull = blueprint.bullVsBear.bullCasePoints || [];
      const bear = blueprint.bullVsBear.bearCasePoints || [];

      const grid = document.createElement('div');
      grid.className = 'split-layout';
      grid.innerHTML = `
            <div class="split-col glass-panel col-bull">
              <div class="col-title" style="color:#16a34a;">Bull Case</div>
              <ul class="bullet-list">
                 ${bull.length > 0 ? bull.map(p => `<li>${safeStr(p)}</li>`).join('') : '<li style="list-style:none;">No points detailed.</li>'}
              </ul>
            </div>
            <div class="split-col glass-panel col-bear">
              <div class="col-title" style="color:#dc2626;">Bear Case</div>
              <ul class="bullet-list">
                 ${bear.length > 0 ? bear.map(p => `<li>${safeStr(p)}</li>`).join('') : '<li style="list-style:none;">No points detailed.</li>'}
              </ul>
            </div>
          `;
      container.appendChild(grid);
      return true;
    });
    if (s4) { wrapper.appendChild(s4); slideCount++; }
  }

  // ==========================================
  // 5. NEWS & SCREENSHOTS SLIDE
  // ==========================================
  const s5 = spawnPanel(tkr, 'News & Media Context', (container) => {

    // Build Top Grid for Provided News
    if (blueprint.recentNews && Array.isArray(blueprint.recentNews) && blueprint.recentNews.length > 0) {
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
    } else {
      const empty = document.createElement('div');
      empty.style.color = 'var(--text-secondary)';
      empty.innerText = "No structured news URLs provided in Blueprint.";
      container.appendChild(empty);
    }

    // Build Bottom Container for Screenshots
    const scContainer = document.createElement('div');
    scContainer.className = 'screenshot-container';
    // Give it an explicit ID linked to this iteration so the newsScreenshot tool knows where to drop images
    scContainer.id = `screenshot-dropzone-${slideCount}`;

    scContainer.innerHTML = `
           <div style="display:flex; justify-content:space-between; align-items:center;">
             <h3 style="color:var(--text-primary);">Manual Screenshots</h3>
             <button class="btn-clear-images hidden" onclick="window.clearScreenshots('${scContainer.id}')">Clear All</button>
           </div>
           <div class="screenshot-placeholder">
              Press Ctrl+V or Cmd+V while on this slide to paste a screenshot here.
           </div>
           <div class="screenshot-stack" style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;"></div>
        `;
    container.appendChild(scContainer);

    return true;
  });
  if (s5) { wrapper.appendChild(s5); slideCount++; }

  return slideCount;
}

/**
 * Creates a generic full-screen slide with `.overlay-layer` built in.
 */
function spawnPanel(ticker, titleString, rendererFn) {
  const slide = document.createElement('div');
  slide.className = 'slide';

  // Add data-title so our tools can read it later (e.g. news screenshots only pastes on specific slide)
  slide.dataset.title = titleString;

  const wrapper = document.createElement('div');
  wrapper.className = 'slide-content-wrapper';

  const title = document.createElement('h2');
  title.className = 'slide-title';
  title.innerText = `${titleString} ${ticker ? `- $` + ticker : ''}`;
  title.style.color = "var(--text-primary)";
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
    if (success) return slide;
  } catch (e) {
    if (window.logDebug) window.logDebug(`Panel Build Error for ${titleString}: ` + e.message, 'log-error');
    return null;
  }
}
