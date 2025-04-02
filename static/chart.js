// Chart.js custom configurations and market data visualizations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the market overview chart on the home page
    initMarketOverviewChart();
    
    // Initialize stock dashboard charts if on that page
    if (document.getElementById('stockChart')) {
        initStockPriceChart();
        initMarketComparisonChart();
        initRealTimeStockChart();
        initVolumeChart();
    }
});

function initMarketOverviewChart() {
    const ctx = document.getElementById('marketOverviewChart');
    if (!ctx) return;
    
    window.marketOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [{
                label: "NIFTY 50",
                data: [19800, 19950, 20100, 20300, 20700],
                borderColor: "#5F99AE",
                backgroundColor: "rgba(95, 153, 174, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#5F99AE"
            }, {
                label: "SENSEX",
                data: [67000, 67500, 67800, 68200, 68500],
                borderColor: "#d63384",
                backgroundColor: "rgba(214, 51, 132, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#d63384"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 4
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        boxWidth: 8
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 2
                },
                point: {
                    radius: 3,
                    hitRadius: 10,
                    hoverRadius: 5
                }
            }
        }
    });
}

function initStockPriceChart() {
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Reliance Industries",
                data: [2500, 2520, 2550, 2600, 2650, 2700, 2690, 2720, 2770, 2800, 2850, 2870],
                borderColor: "#5F99AE",
                backgroundColor: "rgba(95, 153, 174, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3
            }, {
                label: "HDFC Bank",
                data: [1600, 1620, 1650, 1680, 1700, 1690, 1710, 1730, 1750, 1770, 1790, 1810],
                borderColor: "#d63384",
                backgroundColor: "rgba(214, 51, 132, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3
            }, {
                label: "Infosys",
                data: [1300, 1320, 1340, 1360, 1380, 1400, 1420, 1440, 1460, 1480, 1500, 1520],
                borderColor: "#28a745",
                backgroundColor: "rgba(40, 167, 69, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3
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
                },
                title: {
                    display: true,
                    text: 'Stock Price Trends 2023'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (₹)'
                    }
                }
            }
        }
    });
}

function initMarketComparisonChart() {
    const ctx = document.getElementById('marketTrends');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ["Growth", "P/E Ratio", "Dividend", "Volatility", "Momentum", "Value"],
            datasets: [{
                label: "NIFTY 50",
                data: [80, 75, 70, 50, 85, 65],
                borderColor: "#5F99AE",
                backgroundColor: "rgba(95, 153, 174, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#5F99AE"
            }, {
                label: "SENSEX",
                data: [85, 70, 65, 55, 80, 60],
                borderColor: "#d63384",
                backgroundColor: "rgba(214, 51, 132, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#d63384"
            }, {
                label: "NYSE",
                data: [90, 65, 60, 60, 75, 55],
                borderColor: "#28a745",
                backgroundColor: "rgba(40, 167, 69, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#28a745"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Market Metrics Comparison'
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function initRealTimeStockChart() {
    const ctx = document.getElementById('stockPriceChart');
    if (!ctx) return;
    
    // Generate random data to simulate real-time data
    const stockData = Array.from({length: 20}, (_, i) => {
        return {
            x: new Date(Date.now() - (19-i) * 300000), // 5 min intervals
            y: 2800 + Math.random() * 200 - 100       // Random value around 2800
        };
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Reliance Stock Price',
                data: stockData,
                borderColor: "#5F99AE",
                backgroundColor: "rgba(95, 153, 174, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Real-Time Stock Price (Last 100 Minutes)'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (₹)'
                    }
                }
            }
        }
    });
}

function initVolumeChart() {
    const ctx = document.getElementById('stockVolumeChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
            datasets: [{
                label: 'Trading Volume',
                data: [1200000, 1500000, 1800000, 1300000, 1600000, 2100000, 2500000],
                backgroundColor: "rgba(95, 153, 174, 0.7)",
                borderColor: "#5F99AE",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Today\'s Trading Volume (Hourly)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Volume (Shares)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

// Function to update chart data based on period selection
function updateChartPeriod(period) {
    const marketChart = window.marketOverviewChart;
    if (!marketChart) return;
    
    // Simulate different data for different time periods
    let newLabels, newData1, newData2;
    
    switch(period) {
        case '1w':
            newLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            newData1 = [19800, 19950, 20100, 20300, 20700];
            newData2 = [67000, 67500, 67800, 68200, 68500];
            break;
        case '1m':
            newLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
            newData1 = [19500, 19800, 20200, 20700];
            newData2 = [66500, 67200, 67800, 68500];
            break;
        case '3m':
            newLabels = ["Jan", "Feb", "Mar"];
            newData1 = [19200, 19800, 20700];
            newData2 = [65500, 67000, 68500];
            break;
        default:
            newLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
            newData1 = [19800, 19950, 20100, 20300, 20700];
            newData2 = [67000, 67500, 67800, 68200, 68500];
    }
    
    // Update chart data
    marketChart.data.labels = newLabels;
    marketChart.data.datasets[0].data = newData1;
    marketChart.data.datasets[1].data = newData2;
    marketChart.update();
} 