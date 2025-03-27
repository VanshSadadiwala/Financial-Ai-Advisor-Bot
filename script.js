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
    }

    // Initialize the market overview chart
    initMarketOverviewChart();
    
    // Initialize dynamic ambient lighting for cards
    initDynamicCardLighting();
    
    // Initialize sidebar toggle (moved from nested DOMContentLoaded)
    initSidebarToggle();
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
            // Redirect to chatbot page or show chat interface
            window.location.href = "chatbot.html";
        });
    }

    // Load static stock charts on page load
    loadStockCharts();
    
    // Handle sidebar navigation
    document.querySelectorAll(".sidebar ul li").forEach(item => {
        item.addEventListener("click", function() {
            const text = this.textContent.trim();
            
            if (text.includes("Stock Analysis")) {
                stockDashboard.classList.remove("d-none");
                if (mainContent) {
                    mainContent.classList.add("d-none");
                }
                fetchLiveStockData();
            }
        });
    });

    // About section navigation
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutSection = document.getElementById('aboutSection');
    const backToMainFromAboutBtn = document.getElementById('backToMainFromAboutBtn');

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
    const stockChartEl = document.getElementById("stockChart");
    const marketTrendsEl = document.getElementById("marketTrends");
    
    if (stockChartEl) {
        const priceCtx = stockChartEl.getContext("2d");
        new Chart(priceCtx, {
            type: "line",
            data: {
                labels: ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"],
                datasets: [{
                    label: "Stock Price",
                    data: [210, 215, 218, 216, 220, 225],
                    borderColor: "rgb(255, 99, 132)",
                    fill: false
                }]
            }
        });
    }

    if (marketTrendsEl) {
        const trendCtx = marketTrendsEl.getContext("2d");
        new Chart(trendCtx, {
            type: "bar",
            data: {
                labels: ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"],
                datasets: [{
                    label: "Market Trend",
                    data: [230, 240, 250, 235, 245],
                    backgroundColor: ["blue", "green", "red", "orange", "purple"]
                }]
            }
        });
    }
}

// Chart Initialization for Real-Time Data
let priceChart, volumeChart;

document.addEventListener("DOMContentLoaded", function() {
    const stockPriceChartEl = document.getElementById("stockPriceChart");
    const stockVolumeChartEl = document.getElementById("stockVolumeChart");
    
    if (stockPriceChartEl) {
        priceChart = new Chart(stockPriceChartEl.getContext("2d"), {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Stock Price",
                    data: [],
                    borderColor: "#d63384",
                    fill: false
                }]
            },
            options: { responsive: true }
        });
    }
    
    if (stockVolumeChartEl) {
        volumeChart = new Chart(stockVolumeChartEl.getContext("2d"), {
            type: "bar",
            data: {
                labels: [],
                datasets: [{
                    label: "Stock Volume",
                    data: [],
                    backgroundColor: "#5F99AE"
                }]
            },
            options: { responsive: true }
        });
    }
});

// Function to Send Message to Chatbot
async function sendMessage() {
    let userText = document.getElementById("userInput").value.trim();
    if (userText === "") return;
    let chatbox = document.getElementById("chatbox");
    chatbox.innerHTML += `<p class='userText'><span>${userText}</span></p>`;
    document.getElementById("userInput").value = "";
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        // Mock response for demonstration
        const botResponses = [
            "Mutual funds are investment vehicles that pool money from multiple investors to buy securities like stocks and bonds.",
            "Index funds are a type of mutual fund that aims to track a specific market index like NIFTY 50 or SENSEX.",
            "For beginners, I recommend starting with low-cost index funds and gradually diversifying your portfolio.",
            "The best time to start investing is now. The power of compound interest works better the earlier you start.",
            "A balanced portfolio typically includes a mix of stocks, bonds, and cash, with allocations based on your risk tolerance."
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real application, you would fetch from your API
        // let response = await fetch("http://127.0.0.1:5000/chat", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ message: userText }),
        // });
        // let data = await response.json();
        
        // Use random response for demo
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        chatbox.innerHTML += `<p class='botText'><span>${randomResponse}</span></p>`;
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        chatbox.innerHTML += `<p class='botText'><span>Error contacting AI</span></p>`;
    }
}

// Function to initialize dynamic ambient lighting for cards
function initDynamicCardLighting() {
    // Get all three cards on main page
    const welcomeCard = document.querySelector('.welcome-card');
    const marketCard = document.querySelector('.main-content .row:nth-child(2) .col-md-6:first-child .card');
    const insightsCard = document.querySelector('.main-content .row:nth-child(2) .col-md-6:last-child .card');
    
    // Get stock analysis cards with more specific selectors
    const stockPriceCard = document.querySelector('#stockDashboard .row:first-child .col-md-6:first-child .card');
    const marketComparisonCard = document.querySelector('#stockDashboard .row:first-child .col-md-6:last-child .card');
    const realTimeCard = document.querySelector('#stockDashboard .row:nth-child(2) .col-md-6:first-child .card');
    const volumeCard = document.querySelector('#stockDashboard .row:nth-child(2) .col-md-6:last-child .card');
    
    // Arrays of possible values
    const hueAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const gradientAngles = ['0deg', '45deg', '90deg', '135deg', '180deg', '225deg', '270deg', '315deg'];
    const gradientPositions = ['0% 50%', '100% 50%', '50% 0%', '50% 100%', '0% 0%', '100% 100%', '0% 100%', '100% 0%'];
    
    // Function to generate random RGBA color with specific opacity
    function getRandomRGBA(opacity) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Function to smoothly transition between values
    function smoothTransition(element, property, targetValue, duration) {
        // Store the current transition
        const originalTransition = element.style.transition;
        
        // Set a specific transition for this property
        element.style.transition = `${property} ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        
        // Set the new value
        element.style.setProperty(property, targetValue);
        
        // Reset to original transition after the duration
        setTimeout(() => {
            element.style.transition = originalTransition;
        }, duration);
    }
    
    // Function to update a card's lighting properties with smooth transitions
    function updateCardLighting(card, intensity) {
        if (!card) return;
        
        // Select random values
        const randomHue = hueAngles[Math.floor(Math.random() * hueAngles.length)];
        const randomAngle = gradientAngles[Math.floor(Math.random() * gradientAngles.length)];
        const randomPos = gradientPositions[Math.floor(Math.random() * gradientPositions.length)];
        
        // Update CSS variables with smooth transitions
        card.style.transition = `box-shadow 3s ease, transform 0.5s ease`;
        card.style.setProperty('--card-gradient-angle', randomAngle);
        card.style.setProperty('--card-gradient-pos', randomPos);
        
        // Subtle box shadow color change with smooth transition
        const shadowOpacity = 0.1 + (Math.random() * 0.2); // Between 0.1 and 0.3
        const shadowColor = getRandomRGBA(shadowOpacity * intensity);
        card.style.boxShadow = `0 4px 15px ${shadowColor}`;
        
        // Always update the glow color for all cards
        const glowOpacity = 0.1 + (Math.random() * 0.15); // Between 0.1 and 0.25
        card.style.setProperty('--card-glow-color', getRandomRGBA(glowOpacity * intensity));
    }
    
    // Function to initialize cards and set up intervals
    function initializeCardEffects() {
        // Re-query the cards to ensure we have the latest references
        const stockPriceCard = document.querySelector('#stockDashboard .row:first-child .col-md-6:first-child .card');
        const marketComparisonCard = document.querySelector('#stockDashboard .row:first-child .col-md-6:last-child .card');
        const realTimeCard = document.querySelector('#stockDashboard .row:nth-child(2) .col-md-6:first-child .card');
        const volumeCard = document.querySelector('#stockDashboard .row:nth-child(2) .col-md-6:last-child .card');
        
        // Initial update for main page cards
        updateCardLighting(welcomeCard, 1);
        updateCardLighting(marketCard, 0.8);
        updateCardLighting(insightsCard, 0.9);
        
        // Initial update for stock analysis cards with the same intensity as home page
        if (stockPriceCard) updateCardLighting(stockPriceCard, 1); // Match welcome card
        if (marketComparisonCard) updateCardLighting(marketComparisonCard, 0.8); // Match market card
        if (realTimeCard) updateCardLighting(realTimeCard, 0.9); // Match insights card
        if (volumeCard) updateCardLighting(volumeCard, 1); // Match welcome card
        
        // Group cards to update together
        const allCards = [
            { element: welcomeCard, intensity: 1, interval: 8000 },
            { element: marketCard, intensity: 0.8, interval: 12000 },
            { element: insightsCard, intensity: 0.9, interval: 10000 },
            { element: stockPriceCard, intensity: 1, interval: 8000 }, // Same as welcome card
            { element: marketComparisonCard, intensity: 0.8, interval: 12000 }, // Same as market card
            { element: realTimeCard, intensity: 0.9, interval: 10000 }, // Same as insights card
            { element: volumeCard, intensity: 1, interval: 8000 } // Same as welcome card
        ];
        
        // Clear any existing intervals
        allCards.forEach(card => {
            if (card.element && card.element._lightingInterval) {
                clearInterval(card.element._lightingInterval);
            }
        });
        
        // Update each card with its designated interval
        allCards.forEach(card => {
            if (card.element) {
                // Store the interval ID on the element itself for potential cleanup
                card.element._lightingInterval = setInterval(() => {
                    updateCardLighting(card.element, card.intensity);
                }, card.interval);
                
                // Ensure immediate first update
                updateCardLighting(card.element, card.intensity);
            }
        });
    }
    
    // Initial call to set up cards
    initializeCardEffects();
    
    // Setup observer to handle stock dashboard appearing after DOM load
    const dashboardObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'stockDashboard' && !target.classList.contains('d-none')) {
                    // When stock dashboard becomes visible, initialize card effects
                    setTimeout(initializeCardEffects, 500); // Give a slight delay for DOM to fully update
                }
            }
        });
    });
    
    // Start observing the stock dashboard for visibility changes
    const stockDashboard = document.getElementById('stockDashboard');
    if (stockDashboard) {
        dashboardObserver.observe(stockDashboard, { attributes: true });
        
        // If dashboard is already visible, initialize effects
        if (!stockDashboard.classList.contains('d-none')) {
            setTimeout(initializeCardEffects, 500);
        }
    }
    
    // Handle click events that might show the stock dashboard
    document.addEventListener('click', (event) => {
        const clickedElement = event.target;
        if (clickedElement.id === 'stockAnalysisbtn' || 
            (clickedElement.closest('.sidebar ul li') && 
             clickedElement.textContent.includes('Stock Analysis'))) {
            // Stock analysis view is being shown, reinitialize effects
            setTimeout(initializeCardEffects, 500);
        }
    });
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