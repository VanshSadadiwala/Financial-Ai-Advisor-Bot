// Stock Analysis JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage
    const isDarkMode = localStorage.getItem("theme") === "dark";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        if (document.getElementById("themeToggle")) {
            document.getElementById("themeToggle").checked = true;
        }
        if (document.getElementById("themeToggleMobile")) {
            document.getElementById("themeToggleMobile").checked = true;
        }
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleMobile = document.getElementById("themeToggleMobile");
    
    if (themeToggle) {
        themeToggle.addEventListener("change", function() {
            toggleTheme(themeToggle.checked);
            if (themeToggleMobile) themeToggleMobile.checked = themeToggle.checked;
        });
    }
    
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener("change", function() {
            toggleTheme(themeToggleMobile.checked);
            if (themeToggle) themeToggle.checked = themeToggleMobile.checked;
        });
    }
    
    function toggleTheme(isDark) {
        if (isDark) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
        
        // Update charts to reflect theme change
        updateChartsTheme();
    }
    
    // Initialize all charts
    initializeStockCharts();
    
    // Setup event listeners for stock lookup
    setupStockSearch();
    
    // Setup event listeners for period buttons
    setupPeriodButtons();
    
    // Make stock tags clickable
    const stockTags = document.querySelectorAll('.stock-tag');
    stockTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const symbol = this.getAttribute('data-symbol');
            document.getElementById('stockSymbol').value = symbol;
            searchStock(symbol);
        });
    });
    
    // Initialize frequency buttons (daily/weekly/monthly)
    const frequencyButtons = document.querySelectorAll('.btn-toolbar .btn');
    frequencyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            frequencyButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update charts based on selected frequency
            updateChartFrequency(this.id);
        });
    });
});

// Chart objects
let stockChart, volumeChart, comparisonChart;

// Initialize stock charts
function initializeStockCharts() {
    // Main stock price chart
    const stockCtx = document.getElementById('stockChart');
    if (stockCtx) {
        stockChart = new Chart(stockCtx, {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Reliance Industries',
                    data: [2500, 2520, 2550, 2600, 2650, 2700, 2690, 2720, 2770, 2800, 2850, 2870],
                    borderColor: '#5F99AE',
                    backgroundColor: 'rgba(95, 153, 174, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price (₹)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
    
    // Volume chart
    const volumeCtx = document.getElementById('volumeChart');
    if (volumeCtx) {
        volumeChart = new Chart(volumeCtx, {
            type: 'bar',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Trading Volume',
                    data: [1500000, 1800000, 1700000, 1900000, 2100000, 2000000, 1800000, 2200000, 2300000, 2100000, 2400000, 2500000],
                    backgroundColor: 'rgba(95, 153, 174, 0.7)',
                    borderColor: '#5F99AE',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
    
    // Comparison chart
    const comparisonCtx = document.getElementById('comparisonChart');
    if (comparisonCtx) {
        comparisonChart = new Chart(comparisonCtx, {
            type: 'line',
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{
                    label: 'Reliance',
                    data: [100, 102, 103, 105, 108, 110, 109, 111, 113, 115, 116, 118],
                    borderColor: '#5F99AE',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2
                }, {
                    label: 'NIFTY 50',
                    data: [100, 101, 104, 103, 105, 107, 108, 110, 112, 114, 113, 115],
                    borderColor: '#d63384',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Normalized Value (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
}

// Update chart themes based on dark/light mode
function updateChartsTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#e0e0e0' : '#666666';
    
    const charts = [stockChart, volumeChart, comparisonChart];
    
    charts.forEach(chart => {
        if (!chart) return;
        
        // Update scales
        if (chart.options.scales.y) {
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
            if (chart.options.scales.y.title) {
                chart.options.scales.y.title.color = textColor;
            }
        }
        
        if (chart.options.scales.x) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
            if (chart.options.scales.x.title) {
                chart.options.scales.x.title.color = textColor;
            }
        }
        
        // Update legend
        if (chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        
        chart.update();
    });
}

// Setup stock search functionality
function setupStockSearch() {
    const searchButton = document.getElementById('searchStock');
    const stockSymbol = document.getElementById('stockSymbol');
    
    if (searchButton && stockSymbol) {
        searchButton.addEventListener('click', function() {
            const symbol = stockSymbol.value.trim();
            if (symbol) {
                searchStock(symbol);
            }
        });
        
        stockSymbol.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const symbol = stockSymbol.value.trim();
                if (symbol) {
                    searchStock(symbol);
                }
            }
        });
    }
}

// Search for stock data
function searchStock(symbol) {
    // In a real app, this would fetch data from an API
    // For this demo, we'll simulate with sample data
    console.log(`Searching for stock: ${symbol}`);
    
    // Update stock info card
    document.getElementById('stockName').textContent = `${symbol} - Sample Company Ltd.`;
    
    // Update stock price and change
    const randomPrice = (2500 + Math.random() * 500).toFixed(2);
    const randomChange = (Math.random() * 20 - 10).toFixed(2);
    const randomPercent = (randomChange / randomPrice * 100).toFixed(2);
    const priceElement = document.querySelector('.stock-price');
    const changeElement = document.querySelector('.stock-change');
    
    if (priceElement) priceElement.textContent = `₹${randomPrice}`;
    
    if (changeElement) {
        changeElement.textContent = `${randomChange >= 0 ? '+' : ''}₹${Math.abs(randomChange)} (${randomChange >= 0 ? '+' : ''}${randomPercent}%)`;
        changeElement.className = `stock-change ${randomChange >= 0 ? 'up' : 'down'}`;
    }
    
    // Generate random data for charts
    updateChartsWithRandomData(symbol);
}

// Setup period buttons (1M, 3M, 6M, 1Y)
function setupPeriodButtons() {
    const periodButtons = document.querySelectorAll('.chart-controls .btn');
    if (periodButtons.length) {
        periodButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                periodButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update chart data based on period
                const period = this.getAttribute('data-period');
                updateChartPeriod(period);
            });
        });
    }
}

// Update chart data based on selected period
function updateChartPeriod(period) {
    console.log(`Updating charts for period: ${period}`);
    
    // Generate labels based on period
    let labels, dataPoints, volumePoints;
    
    switch(period) {
        case '1m':
            labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
            dataPoints = generateRandomPrices(30, 2800, 100);
            volumePoints = generateRandomVolumes(30, 2000000, 500000);
            break;
        case '3m':
            labels = Array.from({length: 12}, (_, i) => `Week ${i+1}`);
            dataPoints = generateRandomPrices(12, 2700, 200);
            volumePoints = generateRandomVolumes(12, 1800000, 700000);
            break;
        case '6m':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            dataPoints = generateRandomPrices(6, 2600, 300);
            volumePoints = generateRandomVolumes(6, 1700000, 800000);
            break;
        case '1y':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dataPoints = generateRandomPrices(12, 2500, 400);
            volumePoints = generateRandomVolumes(12, 1500000, 1000000);
            break;
        default:
            labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
            dataPoints = generateRandomPrices(30, 2800, 100);
            volumePoints = generateRandomVolumes(30, 2000000, 500000);
    }
    
    // Update price chart
    if (stockChart) {
        stockChart.data.labels = labels;
        stockChart.data.datasets[0].data = dataPoints;
        stockChart.update();
    }
    
    // Update volume chart
    if (volumeChart) {
        volumeChart.data.labels = labels;
        volumeChart.data.datasets[0].data = volumePoints;
        volumeChart.update();
    }
    
    // Update comparison chart with benchmark (e.g., NIFTY 50)
    if (comparisonChart) {
        comparisonChart.data.labels = labels;
        
        // Normalize data to start at 100
        const stockData = normalizeData(dataPoints);
        const benchmarkData = normalizeData(generateRandomPrices(labels.length, dataPoints[0], dataPoints[0] * 0.1));
        
        comparisonChart.data.datasets[0].data = stockData;
        comparisonChart.data.datasets[1].data = benchmarkData;
        comparisonChart.update();
    }
}

// Update charts based on selected frequency (daily/weekly/monthly)
function updateChartFrequency(frequencyId) {
    console.log(`Updating charts for frequency: ${frequencyId}`);
    
    // Generate data based on frequency
    let granularity, range;
    
    switch(frequencyId) {
        case 'dailyBtn':
            granularity = 'daily';
            range = 30; // 30 days
            break;
        case 'weeklyBtn':
            granularity = 'weekly';
            range = 12; // 12 weeks
            break;
        case 'monthlyBtn':
            granularity = 'monthly';
            range = 12; // 12 months
            break;
        default:
            granularity = 'daily';
            range = 30;
    }
    
    // Update all charts based on frequency
    const labels = generateLabels(granularity, range);
    const stockData = generateRandomPrices(range, 2800, granularity === 'daily' ? 100 : (granularity === 'weekly' ? 200 : 300));
    const volumeData = generateRandomVolumes(range, 2000000, granularity === 'daily' ? 500000 : (granularity === 'weekly' ? 700000 : 900000));
    
    // Update price chart
    if (stockChart) {
        stockChart.data.labels = labels;
        stockChart.data.datasets[0].data = stockData;
        stockChart.update();
    }
    
    // Update volume chart
    if (volumeChart) {
        volumeChart.data.labels = labels;
        volumeChart.data.datasets[0].data = volumeData;
        volumeChart.update();
    }
    
    // Update comparison chart
    if (comparisonChart) {
        comparisonChart.data.labels = labels;
        comparisonChart.data.datasets[0].data = normalizeData(stockData);
        comparisonChart.data.datasets[1].data = normalizeData(generateRandomPrices(range, stockData[0], stockData[0] * 0.1));
        comparisonChart.update();
    }
}

// Generate labels based on granularity and range
function generateLabels(granularity, range) {
    const now = new Date();
    const labels = [];
    
    switch(granularity) {
        case 'daily':
            for (let i = range - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
            }
            break;
        case 'weekly':
            for (let i = range - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i * 7);
                labels.push(`Week ${range - i}`);
            }
            break;
        case 'monthly':
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = range - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                labels.push(months[date.getMonth()]);
            }
            break;
    }
    
    return labels;
}

// Generate random price data
function generateRandomPrices(count, basePrice, maxVariation) {
    const prices = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < count; i++) {
        // Add random variation but maintain a trend
        const randomChange = (Math.random() * maxVariation) - (maxVariation / 2);
        const trendBias = (i / count) * (maxVariation / 2); // Upward trend bias
        currentPrice = currentPrice + randomChange + trendBias;
        
        // Ensure price doesn't go below a minimum threshold
        if (currentPrice < basePrice * 0.7) {
            currentPrice = basePrice * 0.7 + Math.random() * (basePrice * 0.1);
        }
        
        prices.push(Math.round(currentPrice * 100) / 100);
    }
    
    return prices;
}

// Generate random volume data
function generateRandomVolumes(count, baseVolume, maxVariation) {
    const volumes = [];
    
    for (let i = 0; i < count; i++) {
        const randomVolume = baseVolume + (Math.random() * maxVariation * 2) - maxVariation;
        volumes.push(Math.max(Math.round(randomVolume), baseVolume / 2));
    }
    
    return volumes;
}

// Normalize data to start at 100 for comparison chart
function normalizeData(data) {
    if (!data || data.length === 0) return [];
    
    const baseValue = data[0];
    return data.map(value => Math.round((value / baseValue) * 100 * 100) / 100);
}

// Update charts with random data for a given stock symbol
function updateChartsWithRandomData(symbol) {
    // Generate random price trend based on symbol
    const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
    const basePrice = 2000 + (seed % 1000);
    const volatility = 100 + (seed % 200);
    
    // Get currently selected period and frequency
    const activePeriod = document.querySelector('.chart-controls .btn.active')?.getAttribute('data-period') || '1m';
    const activeFrequency = document.querySelector('.btn-toolbar .btn.active')?.id || 'dailyBtn';
    
    // Update stock chart
    let range, labels;
    
    switch(activePeriod) {
        case '1m':
            range = 30;
            labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
            break;
        case '3m':
            range = 90;
            labels = Array.from({length: 12}, (_, i) => `Week ${i+1}`);
            break;
        case '6m':
            range = 180;
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            break;
        case '1y':
            range = 365;
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            break;
        default:
            range = 30;
            labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    }
    
    // Generate data
    const prices = generateRandomPrices(labels.length, basePrice, volatility);
    const volumes = generateRandomVolumes(labels.length, 1500000 + (seed % 1000000), 500000 + (seed % 500000));
    
    // Update stock chart datasets
    if (stockChart) {
        stockChart.data.labels = labels;
        stockChart.data.datasets[0].label = symbol;
        stockChart.data.datasets[0].data = prices;
        stockChart.update();
    }
    
    // Update volume chart
    if (volumeChart) {
        volumeChart.data.labels = labels;
        volumeChart.data.datasets[0].data = volumes;
        volumeChart.update();
    }
    
    // Update comparison chart
    if (comparisonChart) {
        comparisonChart.data.labels = labels;
        comparisonChart.data.datasets[0].label = symbol;
        comparisonChart.data.datasets[0].data = normalizeData(prices);
        
        // Generate benchmark data that somewhat follows but deviates from stock data
        const benchmarkData = prices.map(price => {
            const deviation = (Math.random() - 0.5) * 0.1; // -5% to +5% deviation
            return price * (1 + deviation);
        });
        
        comparisonChart.data.datasets[1].data = normalizeData(benchmarkData);
        comparisonChart.update();
    }
    
    // Update metrics in the Overview section
    updateMetricsWithRandomData(symbol, basePrice);
}

// Update stock metrics with random data
function updateMetricsWithRandomData(symbol, basePrice) {
    // Market cap based on price (in trillions)
    const marketCap = (basePrice * 0.01).toFixed(2);
    
    // Generate other metrics
    const peRatio = (15 + Math.random() * 20).toFixed(1);
    const high52w = (basePrice * 1.15).toFixed(2);
    const low52w = (basePrice * 0.85).toFixed(2);
    const dividendYield = (0.5 + Math.random() * 2).toFixed(2);
    const volume = (1 + Math.random() * 4).toFixed(1);
    
    // Update DOM elements
    const metricValues = document.querySelectorAll('.metric-value');
    if (metricValues.length >= 6) {
        metricValues[0].textContent = `₹${marketCap}T`;
        metricValues[1].textContent = peRatio;
        metricValues[2].textContent = `₹${high52w}`;
        metricValues[3].textContent = `₹${low52w}`;
        metricValues[4].textContent = `${dividendYield}%`;
        metricValues[5].textContent = `${volume}M`;
    }
} 