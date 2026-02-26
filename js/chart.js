/**
 * chart.js
 * Configures and renders the TradingView Lightweight Chart using Polygon OHLC.
 */

/**
 * Renders the main chart given already transformed data.
 * @param {HTMLElement} containerElement 
 * @param {Array} data - Array of objects {time, open, high, low, close, volume}
 */
function renderTVChart(containerElement, data) {
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
        width: containerElement.clientWidth,
        height: containerElement.clientHeight
    };

    const chart = LightweightCharts.createChart(containerElement, chartOptions);

    // Resize Observer for responsive charts (especially useful for 100vh slides)
    const ro = new ResizeObserver(entries => {
        if (entries.length === 0 || entries[0].target !== containerElement) return;
        const newRect = entries[0].contentRect;
        if (newRect.width > 0 && newRect.height > 0) {
            chart.applyOptions({ height: newRect.height, width: newRect.width });
        }
    });
    ro.observe(containerElement);

    // Map Data
    const candleData = data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
    }));

    const volumeData = data.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
    }));

    // Add Candle Series
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
    });
    candleSeries.setData(candleData);

    // Calculate & Add EMA 20
    const ema20Data = calculateEMA(candleData, 20);
    if (ema20Data.length > 0) {
        const ema20Series = chart.addLineSeries({
            color: '#3b82f6', // Blue
            lineWidth: 2,
        });
        ema20Series.setData(ema20Data);
    }

    // Calculate & Add EMA 50
    const ema50Data = calculateEMA(candleData, 50);
    if (ema50Data.length > 0) {
        const ema50Series = chart.addLineSeries({
            color: '#fbbf24', // Yellow/Orange
            lineWidth: 2,
        });
        ema50Series.setData(ema50Data);
    }

    // Add Volume Histogram at the bottom
    const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: {
            top: 0.85,
            bottom: 0
        }
    });
    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();
}

/**
 * Simple Exponential Moving Average (EMA) utility
 */
function calculateEMA(data, period) {
    if (data.length < period) return [];

    const k = 2 / (period + 1);
    const emaData = [];

    // Need simple SMA for the first valid period to seed the EMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    let previousEma = sum / period;

    // Add the first point
    emaData.push({ time: data[period - 1].time, value: previousEma });

    // Calculate rest
    for (let i = period; i < data.length; i++) {
        const close = data[i].close;
        const currentEma = (close - previousEma) * k + previousEma;
        emaData.push({ time: data[i].time, value: currentEma });
        previousEma = currentEma;
    }

    return emaData;
}
