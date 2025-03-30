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
    const stockAnalysisBtn = document.getElementById("stockAnalysisbtn");
    const mobileStockBtn = document.getElementById("mobileStockBtn");
    const stockDashboard = document.getElementById("stockDashboard");
    const mainContent = document.getElementById("mainContent");
    const backToMainBtn = document.getElementById("backToMainBtn");
    const startChatBtn = document.getElementById("startChatBtn");
    const sidebarStockAnalysis = document.getElementById("sidebarStockAnalysis");

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
    
    // Sidebar Stock Analysis button
    if (sidebarStockAnalysis) {
        sidebarStockAnalysis.addEventListener("click", function() {
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

    // Back button functionality
    if (backToMainBtn) {
        backToMainBtn.addEventListener("click", function() {
            stockDashboard.classList.add("d-none");
            if (mainContent) {
                mainContent.classList.remove("d-none");
            }
        });
    }
    
    // Chat button functionality
    if (startChatBtn) {
        startChatBtn.addEventListener("click", function() {
            // Redirect to chatbot page
            window.location.href = "templates/chatbot.html";
        });
    }

    // Load static stock charts on page load
    loadStockCharts();
    
    // Remove old sidebar click handler that duplicates functionality
    // and update with active class management
    const allSidebarItems = document.querySelectorAll(".sidebar ul li");
    allSidebarItems.forEach(item => {
        item.addEventListener("click", function() {
            // Remove active class from all items
            allSidebarItems.forEach(i => i.classList.remove("active"));
            // Add active class to clicked item
            this.classList.add("active");
        });
    });

    // About section navigation
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutSection = document.getElementById('aboutSection');
    const backToMainFromAboutBtn = document.getElementById('backToMainFromAboutBtn');

    if (aboutBtn && aboutSection && backToMainFromAboutBtn) {
        aboutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mainContent.classList.add('d-none');
            stockDashboard.classList.add('d-none');
            aboutSection.classList.remove('d-none');
            updateActiveNavLink('aboutBtn');
        });

        backToMainFromAboutBtn.addEventListener('click', function() {
            mainContent.classList.remove('d-none');
            stockDashboard.classList.add('d-none');
            aboutSection.classList.add('d-none');
            updateActiveNavLink('homeBtn');
        });
    }

    // Update the updateActiveNavLink function to handle the About link
    function updateActiveNavLink(activeId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.id === activeId) {
                link.classList.add('active');
            }
        });
    }
});

// Function to initialize Market Overview Chart on the main page
function initMarketOverviewChart() {
    const marketOverviewEl = document.getElementById("marketOverviewChart");
    
    if (marketOverviewEl) {
        const ctx = marketOverviewEl.getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                    label: "NIFTY 50",
                    data: [19200, 19500, 19800, 20100, 20400, 20700],
                    borderColor: "#5F99AE",
                    backgroundColor: "rgba(95, 153, 174, 0.1)",
                    fill: true,
                    tension: 0.4
                }, {
                    label: "SENSEX",
                    data: [65000, 66000, 67000, 68000, 69000, 70000],
                    borderColor: "#d63384",
                    backgroundColor: "rgba(214, 51, 132, 0.1)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Indian Market Indices 2023'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
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

// Function to Load Static Stock Charts
function loadStockCharts() {
    try {
        // Stock Chart
        const stockCtx = document.getElementById("stockChart");
        if (stockCtx) {
            const stockChart = new Chart(stockCtx, {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{
                        label: "HDFC Bank",
                        data: [1520, 1590, 1630, 1680, 1720, 1780],
                        borderColor: "#5F99AE",
                        backgroundColor: "rgba(95, 153, 174, 0.1)",
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'HDFC Bank Stock Price (2023)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        // Market Trends
        const marketCtx = document.getElementById("marketTrends");
        if (marketCtx) {
            const marketChart = new Chart(marketCtx, {
                type: "line",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{
                        label: "HDFC Bank",
                        data: [1520, 1590, 1630, 1680, 1720, 1780],
                        borderColor: "#5F99AE",
                        tension: 0.4
                    }, {
                        label: "ICICI Bank",
                        data: [940, 980, 1020, 1050, 1110, 1150],
                        borderColor: "#d63384",
                        tension: 0.4
                    }, {
                        label: "SBI",
                        data: [620, 650, 690, 710, 740, 780],
                        borderColor: "#fd7e14",
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Banking Sector Comparison'
                        }
                    }
                }
            });
        }

        // Initialize real-time price chart
        const priceCtx = document.getElementById("stockPriceChart");
        if (priceCtx) {
            window.priceChart = new Chart(priceCtx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [{
                        label: "HDFC Bank Price",
                        data: [],
                        borderColor: "#d63384",
                        backgroundColor: "rgba(214, 51, 132, 0.1)",
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    animation: {
                        duration: 500
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Real-Time Price Movement'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        // Initialize volume chart
        const volumeCtx = document.getElementById("stockVolumeChart");
        if (volumeCtx) {
            window.volumeChart = new Chart(volumeCtx, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [{
                        label: "Trading Volume",
                        data: [],
                        backgroundColor: "rgba(95, 153, 174, 0.6)",
                        borderColor: "#5F99AE",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    animation: {
                        duration: 500
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Trading Volume'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error initializing charts:", error);
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