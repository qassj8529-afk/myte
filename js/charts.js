/**
 * charts.js
 * Renders TradingView Lightweight Charts in full-screen slides.
 */

function formatCandleData(finnhubData) {
    if (!finnhubData || finnhubData.s !== 'ok' || !finnhubData.t) return { candles: [], volume: [] };

    const candles = [];
    const volume = [];

    for (let i = 0; i < finnhubData.t.length; i++) {
        const time = finnhubData.t[i];

        candles.push({
            time: time,
            open: finnhubData.o[i],
            high: finnhubData.h[i],
            low: finnhubData.l[i],
            close: finnhubData.c[i]
        });

        const isUp = finnhubData.c[i] >= finnhubData.o[i];
        volume.push({
            time: time,
            value: finnhubData.v[i],
            color: isUp ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
        });
    }

    return { candles, volume };
}

function renderMainChart(containerElement, rawData) {
    containerElement.innerHTML = '';

    const data = formatCandleData(rawData);
    if (data.candles.length === 0) {
        containerElement.innerHTML = '<div style="padding: 2rem; color: #a1a1aa; text-align: center;">No valid chart data available.</div>';
        return;
    }

    const chartOptions = {
        layout: {
            textColor: '#a1a1aa',
            background: { type: 'solid', color: 'transparent' }
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal
        },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        // Start with 100% of container size
        width: containerElement.clientWidth,
        height: containerElement.clientHeight
    };

    const chart = LightweightCharts.createChart(containerElement, chartOptions);

    // Robust Resize Handling using ResizeObserver
    const ro = new ResizeObserver(entries => {
        if (entries.length === 0 || entries[0].target !== containerElement) return;
        const newRect = entries[0].contentRect;
        // Debounce or apply immediately
        if (newRect.width > 0 && newRect.height > 0) {
            chart.applyOptions({ height: newRect.height, width: newRect.width });
        }
    });

    ro.observe(containerElement);

    // Also hook into window resize
    window.addEventListener('resize', () => {
        chart.applyOptions({
            height: containerElement.clientHeight,
            width: containerElement.clientWidth
        });
    });

    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
    });
    candleSeries.setData(data.candles);

    const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: {
            top: 0.85,
            bottom: 0
        }
    });
    volumeSeries.setData(data.volume);

    chart.timeScale().fitContent();
}
