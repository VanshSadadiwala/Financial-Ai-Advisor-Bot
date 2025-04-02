document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleMobile = document.getElementById("themeToggleMobile");
    
    // Check local storage for theme preference
    const isDarkMode = localStorage.getItem("theme") === "dark";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        if (themeToggle) themeToggle.checked = true;
        if (themeToggleMobile) themeToggleMobile.checked = true;
    }

    // Toggle theme on desktop switch
    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            toggleTheme(themeToggle.checked);
            if (themeToggleMobile) themeToggleMobile.checked = themeToggle.checked;
        });
    }
    
    // Toggle theme on mobile switch
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener("change", () => {
            toggleTheme(themeToggleMobile.checked);
            if (themeToggle) themeToggle.checked = themeToggleMobile.checked;
        });
    }
    
    // Theme toggle function
    function toggleTheme(isDark) {
        if (isDark) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
        
        // Re-render charts to update their colors
        if (window.priceChart) window.priceChart.update();
        if (window.volumeChart) window.volumeChart.update();
        
        // Update cards lighting
        initDynamicCardLighting();
    }

    // Initialize the market overview chart
    initMarketOverviewChart();
    
    // Initialize dynamic ambient lighting for cards
    initDynamicCardLighting();
    
    // Initialize sidebar toggle (moved from nested DOMContentLoaded)
    initSidebarToggle();
    
    // ChatBot icon hover and animation effects
    const chatBotIcon = document.getElementById("chatBotIcon");
    if (chatBotIcon) {
        // Add glow effect on hover
        chatBotIcon.addEventListener("mouseenter", function() {
            this.style.transform = "scale(1.1)";
            this.style.boxShadow = "0 0 20px rgba(var(--accent-color-rgb), 0.7)";
            this.style.animation = "chatbotHoverGlow 2s infinite alternate";
        });
        
        chatBotIcon.addEventListener("mouseleave", function() {
            this.style.transform = "scale(1)";
            this.style.boxShadow = "0 0 10px rgba(var(--accent-color-rgb), 0.3)";
            this.style.animation = "chatbotGlow 3s infinite alternate";
        });
    }
});

// Sidebar Clickable components
document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".sidebar ul li");

    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            menuItems.forEach((el) => el.classList.remove("active"));
            item.classList.add("active");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Initialize theme from localStorage
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    // Theme toggle functionality
    const themeToggleSidebar = document.querySelector(".theme-toggle-sidebar");
    
    if (themeToggleSidebar) {
        themeToggleSidebar.addEventListener("click", function() {
            toggleTheme();
        });
    }
    
    function toggleTheme() {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
            if (themeToggleSidebar) {
                themeToggleSidebar.querySelector("i").classList.remove("fa-sun");
                themeToggleSidebar.querySelector("i").classList.add("fa-moon");
                themeToggleSidebar.querySelector("span").textContent = "Dark Mode";
            }
        } else {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
            if (themeToggleSidebar) {
                themeToggleSidebar.querySelector("i").classList.remove("fa-moon");
                themeToggleSidebar.querySelector("i").classList.add("fa-sun");
                themeToggleSidebar.querySelector("span").textContent = "Light Mode";
            }
        }
    }

    // Update theme toggle icon based on current theme
    if (currentTheme === "dark" && themeToggleSidebar) {
        themeToggleSidebar.querySelector("i").classList.remove("fa-moon");
        themeToggleSidebar.querySelector("i").classList.add("fa-sun");
        themeToggleSidebar.querySelector("span").textContent = "Light Mode";
    }

    // Sidebar toggle for mobile view
    const navbarToggler = document.querySelector(".navbar-toggler");
    const sidebar = document.querySelector(".sidebar");
    
    if (navbarToggler && sidebar) {
        navbarToggler.addEventListener("click", function() {
            sidebar.classList.toggle("active");
        });
    }
    
    // Set the active sidebar item based on current page
    const currentPage = window.location.pathname.split("/").pop();
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    
    sidebarItems.forEach(item => {
        const link = item.querySelector("a").getAttribute("href");
        if (link === currentPage || (currentPage === "" && link === "index.html")) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Button event handlers
    const stockAnalysisBtn = document.getElementById("stockAnalysisbtn");
    const mobileStockBtn = document.getElementById("mobileStockBtn");
    const stockDashboard = document.getElementById("stockDashboard");
    const mainContent = document.getElementById("mainContent");
    const backToMainBtn = document.getElementById("backToMainBtn");
    const startChatBtn = document.getElementById("startChatBtn");
    const aboutBtn = document.getElementById("aboutBtn");
    const aboutSection = document.getElementById("aboutSection");
    const backToMainFromAboutBtn = document.getElementById("backToMainFromAboutBtn");
    const homeBtn = document.getElementById("homeBtn");

    // Function to show stock dashboard
    function showStockDashboard() {
        stockDashboard.classList.remove("d-none");
        if (mainContent) {
            mainContent.classList.add("d-none"); // Hide the default content
        }
        if (aboutSection) {
            aboutSection.classList.add("d-none"); // Hide about section if visible
        }
        fetchLiveStockData(); // Fetch live stock data dynamically
    }

    if (stockAnalysisBtn) {
        stockAnalysisBtn.addEventListener("click", function () {
            showStockDashboard();
        });
    }
    
    // Mobile Stock Analysis button
    if (mobileStockBtn) {
        mobileStockBtn.addEventListener("click", function (e) {
            e.preventDefault();
            showStockDashboard();
            // Close mobile navbar after clicking
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.querySelector('.navbar-collapse.show');
            if (navbarCollapse && navbarToggler) {
                navbarToggler.click();
            }
        });
    }
    
    // Back to Main button
    if (backToMainBtn) {
        backToMainBtn.addEventListener("click", function() {
            if (stockDashboard) {
                stockDashboard.classList.add("d-none");
            }
            if (aboutSection) {
                aboutSection.classList.add("d-none");
            }
            if (mainContent) {
                mainContent.classList.remove("d-none");
            }
        });
    }
    
    // About button
    if (aboutBtn) {
        aboutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (aboutSection) {
                aboutSection.classList.remove("d-none");
                if (mainContent) {
                    mainContent.classList.add("d-none");
                }
                if (stockDashboard) {
                    stockDashboard.classList.add("d-none");
                }
            }
            
            // If mobile, close the navbar after clicking
            const navbarCollapse = document.querySelector('.navbar-collapse.show');
            if (navbarCollapse) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                if (navbarToggler) {
                    navbarToggler.click();
                }
            }
            
            // Close sidebar on mobile if it's open
            if (window.innerWidth < 992 && sidebar && sidebar.classList.contains("active")) {
                sidebar.classList.remove("active");
            }
        });
    }
    
    // Back to Main from About button
    if (backToMainFromAboutBtn) {
        backToMainFromAboutBtn.addEventListener("click", function() {
            if (aboutSection) {
                aboutSection.classList.add("d-none");
            }
            if (mainContent) {
                mainContent.classList.remove("d-none");
            }
        });
    }
    
    // Home button
    if (homeBtn) {
        homeBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (stockDashboard) {
                stockDashboard.classList.add("d-none");
            }
            if (aboutSection) {
                aboutSection.classList.add("d-none");
            }
            if (mainContent) {
                mainContent.classList.remove("d-none");
            }
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", function(e) {
        if (window.innerWidth < 992 && sidebar && sidebar.classList.contains("active")) {
            // Check if click is outside the sidebar
            if (!sidebar.contains(e.target) && !navbarToggler.contains(e.target)) {
                sidebar.classList.remove("active");
            }
        }
    });

    // Load static stock charts on page load
    // This function initializes and populates the stock charts on the dashboard
    function loadStockCharts() {
        if (document.getElementById('stockChart')) {
            // Stock price trend chart
            const stockCtx = document.getElementById('stockChart').getContext('2d');
            const stockChart = new Chart(stockCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'NIFTY 50',
                        data: [17500, 17300, 17800, 18200, 18600, 19100, 19500, 19800, 20100, 20400, 20600, 20700],
                        borderColor: '#5F99AE',
                        backgroundColor: 'rgba(95, 153, 174, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                drawBorder: false,
                                color: function(context) {
                                    if (document.body.classList.contains('dark-mode')) {
                                        return 'rgba(255, 255, 255, 0.1)';
                                    } else {
                                        return 'rgba(0, 0, 0, 0.1)';
                                    }
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        if (document.getElementById('marketTrends')) {
            // Market comparison chart
            const marketCtx = document.getElementById('marketTrends').getContext('2d');
            const marketChart = new Chart(marketCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'NIFTY 50',
                        data: [100, 98, 102, 105, 108, 112, 115, 117, 120, 122, 123, 124],
                        borderColor: '#5F99AE',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    }, {
                        label: 'SENSEX',
                        data: [100, 99, 103, 107, 110, 114, 118, 120, 123, 125, 126, 127],
                        borderColor: '#FF6B6B',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    }, {
                        label: 'BSE 500',
                        data: [100, 97, 101, 104, 107, 110, 113, 115, 117, 119, 121, 122],
                        borderColor: '#4ECDC4',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                drawBorder: false,
                                color: function(context) {
                                    if (document.body.classList.contains('dark-mode')) {
                                        return 'rgba(255, 255, 255, 0.1)';
                                    } else {
                                        return 'rgba(0, 0, 0, 0.1)';
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: 'Normalized Value (100 = Jan)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        if (document.getElementById('stockPriceChart')) {
            // Real-time stock price chart
            const realTimeCtx = document.getElementById('stockPriceChart').getContext('2d');
            const realTimeChart = new Chart(realTimeCtx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                    datasets: [{
                        label: 'RELIANCE',
                        data: [2830, 2835, 2838, 2840, 2843, 2847, 2850, 2855, 2860, 2858, 2855, 2852, 
                               2854, 2856, 2860, 2858, 2862, 2865, 2868, 2870, 2872, 2875, 2878, 2880],
                        borderColor: '#FF6B6B',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                drawBorder: false,
                                color: function(context) {
                                    if (document.body.classList.contains('dark-mode')) {
                                        return 'rgba(255, 255, 255, 0.1)';
                                    } else {
                                        return 'rgba(0, 0, 0, 0.1)';
                                    }
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        if (document.getElementById('stockVolumeChart')) {
            // Trading volume chart
            const volumeCtx = document.getElementById('stockVolumeChart').getContext('2d');
            const volumeChart = new Chart(volumeCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Trading Volume (millions)',
                        data: [24.5, 22.3, 28.1, 26.9, 29.5, 31.2, 27.8, 30.5, 32.1, 33.8, 35.2, 36.7],
                        backgroundColor: 'rgba(95, 153, 174, 0.7)',
                        borderColor: '#5F99AE',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false,
                                color: function(context) {
                                    if (document.body.classList.contains('dark-mode')) {
                                        return 'rgba(255, 255, 255, 0.1)';
                                    } else {
                                        return 'rgba(0, 0, 0, 0.1)';
                                    }
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Call the loadStockCharts function to initialize charts
    loadStockCharts();

    // Insight Modal Functionality
    const insightModal = document.getElementById('insightModal');
    if (insightModal) {
        insightModal.addEventListener('show.bs.modal', function (event) {
            // Button that triggered the modal
            const insight = event.relatedTarget;
            
            // Extract info from data attributes
            const title = insight.getAttribute('data-title');
            const content = insight.getAttribute('data-content');
            
            // Update the modal's content
            const modalTitle = insightModal.querySelector('.modal-title');
            const modalContent = insightModal.querySelector('#insightContent');
            
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
        });
    }
    
    // Make insight items clickable
    const insightItems = document.querySelectorAll('.insight-item');
    insightItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            // The modal is triggered by the data-bs-toggle and data-bs-target attributes
        });
    });
});

// Chart Initialization: Add period selection functionality
document.addEventListener("DOMContentLoaded", function() {
    // Initialize chart period buttons
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
    
    // Initialize news filter buttons
    const newsButtons = document.querySelectorAll('.news-controls .btn');
    if (newsButtons.length) {
        newsButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                newsButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Filter news based on category
                const category = this.getAttribute('data-category');
                filterNews(category);
            });
        });
    }
    
    // Make insights items clickable
    const insightItems = document.querySelectorAll('.insights-list .list-group-item');
    if (insightItems.length) {
        insightItems.forEach(item => {
            item.addEventListener('click', function() {
                const title = this.querySelector('h6').textContent;
                alert('You clicked on: ' + title + '\nThis would open the full article in a real application.');
            });
        });
    }
    
    // Make news items clickable
    const newsItems = document.querySelectorAll('.news-item');
    if (newsItems.length) {
        newsItems.forEach(item => {
            item.addEventListener('click', function() {
                const title = this.querySelector('.news-title').textContent;
                alert('You clicked on: ' + title + '\nThis would open the full news article in a real application.');
            });
        });
    }
});

// Function to update chart based on selected period
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

// Function to filter news items by category
function filterNews(category) {
    const newsItems = document.querySelectorAll('.news-item');
    if (!newsItems.length) return;
    
    if (category === 'all') {
        newsItems.forEach(item => {
            item.parentElement.style.display = 'block';
        });
        return;
    }
    
    // Categories would normally be stored as data attributes on news items
    // This is a simplified simulation
    const categoryMap = {
        'markets': [0, 1],  // indices of items in the markets category
        'economy': [2]      // indices of items in the economy category
    };
    
    newsItems.forEach((item, index) => {
        if (categoryMap[category] && categoryMap[category].includes(index)) {
            item.parentElement.style.display = 'block';
        } else {
            item.parentElement.style.display = 'none';
        }
    });
}

// Function to initialize Market Overview Chart on the main page
function initMarketOverviewChart() {
    // Implementation moved to static/chart.js
}

// Function to Fetch Live Stock Data
async function fetchLiveStockData() {
    try {
        // Mock data for demonstration
        const stockData = {
            prices: [210, 215, 218, 216, 220, 225, 228, 230],
            volumes: [1000, 1200, 1150, 980, 1300, 1400, 1250, 1100],
            timestamps: ["9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM"]
        };

        // In a real application, you would fetch from an API
        // let response = await fetch('https://api.example.com/stockdata');
        // let stockData = await response.json();

        if (priceChart && volumeChart) {
            updateChart(priceChart, stockData.timestamps, stockData.prices);
            updateChart(volumeChart, stockData.timestamps, stockData.volumes);
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Function to Update Charts
function updateChart(chart, labels, data) {
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }
}

// Mobile sidebar toggle
function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    
    // Skip creating the sidebar toggle button
    
    // Make sure sidebar is accessible in desktop mode
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            if (sidebar) {
                sidebar.style.display = 'none';
            }
        } else {
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.left = '0';
            }
        }
    }

    // Initial check and event listener for window resize
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Force the sidebar to be visible if this is not mobile
    if (window.innerWidth > 768 && sidebar) {
        sidebar.style.display = 'block';
        sidebar.style.left = '0';
    }
}