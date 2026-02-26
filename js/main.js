/**
 * main.js
 * Orchestrates the application logic and dynamic UI generation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnGenerate = document.getElementById('btn-generate');
    const startScreen = document.getElementById('start-screen');
    const dashboard = document.getElementById('dashboard');
    const overlays = document.getElementById('overlays');
    const modulesContainer = document.getElementById('modules-container');

    btnGenerate.addEventListener('click', async () => {
        const scriptText = document.getElementById('script-input').value.trim();
        if (!scriptText) {
            alert("Please paste an analysis script first.");
            return;
        }

        // 1. Switch View
        startScreen.classList.remove('view-active');
        startScreen.classList.add('hidden');

        dashboard.classList.remove('hidden');
        dashboard.classList.add('view-active');
        overlays.classList.remove('hidden');

        // 2. Initialize Controller
        initController();

        // 3. Parse Script
        const { ticker, sections } = parseScript(scriptText);

        // Add header module
        appendHeaderModule(ticker);

        // 4. Generate Modules
        for (const section of sections) {
            await generateSectionModules(ticker, section);
        }
    });

    function appendHeaderModule(ticker) {
        const el = document.createElement('div');
        el.className = 'module glass-panel flex-col';
        el.style.padding = '2rem';
        el.innerHTML = `
      <h1 style="margin:0;">Analysis: $${ticker}</h1>
      <p style="color:var(--text-secondary); font-size: 0.9rem;">DIRECTOR MODE: Space (next), Z (zoom), H (highlight), B (box), C (focus), T (script), R/ESC (reset)</p>
    `;
        modulesContainer.appendChild(el);
    }

    async function generateSectionModules(ticker, section) {
        if (!section.modules || section.modules.length === 0) {
            // Create a plain text or generic visual block if no topics detected.
            return;
        }

        // Wrap the modules for this paragraph in a section frame to sync with Teleprompter
        const sectionFrame = document.createElement('div');
        sectionFrame.className = 'module-section';
        sectionFrame.style.display = 'flex';
        sectionFrame.style.flexDirection = 'column';
        sectionFrame.style.gap = '2rem';

        // Build modules based on topics found in this paragraph
        for (const modName of section.modules) {
            const moduleEl = document.createElement('div');
            moduleEl.className = 'module glass-panel';
            moduleEl.style.padding = '2rem';
            moduleEl.dataset.scriptText = section.text; // sync for controller.js teleprompter

            // Heading
            const title = document.createElement('h2');
            title.innerText = formatTitle(modName, ticker);
            moduleEl.appendChild(title);

            const content = document.createElement('div');
            moduleEl.appendChild(content);

            // Handle specific module rendering
            switch (modName) {
                case 'chart':
                    await renderChartModule(content, ticker);
                    break;
                case 'financials':
                    await renderFinancialsModule(content, ticker);
                    break;
                case 'news':
                    await renderNewsModule(content, ticker);
                    break;
                case 'images':
                    await renderImagesModule(content, ticker);
                    break;
                case 'reddit':
                    await renderRedditModule(content, ticker);
                    break;
                default:
                    content.innerHTML = `<p style="color:var(--text-secondary); font-style: italic;">[${modName.toUpperCase()} DATA PLACEHOLDER]</p>`;
            }

            sectionFrame.appendChild(moduleEl);
        }

        modulesContainer.appendChild(sectionFrame);
    }

    function formatTitle(modName, ticker) {
        const names = {
            chart: `Price Action`,
            financials: `Key Metrics`,
            news: `Recent Headlines`,
            reddit: `Social Sentiment`,
            short_interest: `Short Interest`,
            holders: `Institutional Flow`,
            business_model: `Business Model`,
            deals: `Recent Deals`,
            images: `Industry Context`,
            scenario: `Risk Scenarios`
        };
        return (names[modName] || modName.toUpperCase()) + ` - ${ticker}`;
    }

    // --- Renderers ---

    async function renderChartModule(container, ticker) {
        container.className = 'chart-module';
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-container';
        container.appendChild(wrapper);

        // Show loading
        wrapper.innerHTML = '<p style="padding:2rem;">Loading chart data...</p>';

        const data = await getCandles(ticker);
        wrapper.innerHTML = '';

        if (data && data.s === 'ok') {
            renderChart(wrapper, formatCandleData(data));
        } else {
            wrapper.innerHTML = '<p style="padding:2rem; color:red;">Failed to load chart data</p>';
        }
    }

    async function renderFinancialsModule(container, ticker) {
        container.className = 'financials-grid';
        const data = await getBasicFinancials(ticker);

        if (data && data.metric) {
            const metrics = [
                { label: '52 Wk High', value: data.metric['52WeekHigh'] || 'N/A' },
                { label: '52 Wk Low', value: data.metric['52WeekLow'] || 'N/A' },
                { label: 'Market Cap', value: data.metric['marketCapitalization'] ? (data.metric['marketCapitalization'] / 1000).toFixed(2) + 'B' : 'N/A' },
                { label: 'Beta', value: data.metric['beta'] || 'N/A' }
            ];

            metrics.forEach(m => {
                const card = document.createElement('div');
                card.className = 'stat-card';
                card.innerHTML = `<div class="label">${m.label}</div><div class="value">${m.value}</div>`;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p>Financial data unavailable.</p>';
        }
    }

    async function renderNewsModule(container, ticker) {
        container.className = 'news-list';
        const data = await getCompanyNews(ticker);

        if (data && data.length > 0) {
            const top3 = data.slice(0, 3);
            top3.forEach(article => {
                const d = new Date(article.datetime * 1000).toLocaleDateString();
                const item = document.createElement('div');
                item.className = 'news-item';
                item.innerHTML = `
          <div class="news-meta">${d} | ${article.source}</div>
          <div class="news-title">${article.headline}</div>
        `;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<p>No recent news found.</p>';
        }
    }

    async function renderImagesModule(container, ticker) {
        container.className = 'images-grid';
        const data = await getImages(ticker + ' finance business');

        if (data && data.photos && data.photos.length > 0) {
            data.photos.slice(0, 2).forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.src.medium;
                img.alt = photo.alt;
                container.appendChild(img);
            });
        } else {
            container.innerHTML = '<p>Images unavailable.</p>';
        }
    }

    async function renderRedditModule(container, ticker) {
        container.className = 'news-list';
        const data = await getRedditPosts(ticker);

        if (data && data.data && data.data.children) {
            const posts = data.data.children.slice(0, 3);
            posts.forEach(post => {
                const p = post.data;
                const item = document.createElement('div');
                item.className = 'news-item';
                item.innerHTML = `
          <div class="news-meta">r/${p.subreddit} | ↑${p.ups}</div>
          <div class="news-title">${p.title}</div>
        `;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<p>No social sentiment found.</p>';
        }
    }

});
