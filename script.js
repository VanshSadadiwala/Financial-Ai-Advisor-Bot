document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    
    // Check local storage for theme preference
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
    }

    // Toggle theme on switch
    themeToggle.addEventListener("change", () => {
        if (themeToggle.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    });
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
    const stockAnalysisBtn = document.getElementById("stockAnalysisBtn");
    const stockDashboard = document.getElementById("stockDashboard");
    const mainContent = document.getElementById("mainContent");

    if (stockAnalysisBtn) {
        stockAnalysisBtn.addEventListener("click", function () {
            stockDashboard.classList.remove("d-none");
            mainContent.classList.add("d-none"); // Hide the default content
            fetchLiveStockData(); // Fetch live stock data dynamically
        });
    }

    // Load static stock charts on page load
    loadStockCharts();
});

// Function to Fetch Live Stock Data
async function fetchLiveStockData() {
    try {
        let response = await fetch('https://api.example.com/stockdata'); // Replace with actual API
        let stockData = await response.json();

        let priceData = stockData.prices;
        let volumeData = stockData.volumes;
        let labels = stockData.timestamps;

        updateChart(priceChart, labels, priceData);
        updateChart(volumeChart, labels, volumeData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Function to Update Charts
function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Function to Load Static Stock Charts
function loadStockCharts() {
    const priceCtx = document.getElementById("stockChart").getContext("2d");
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

    const trendCtx = document.getElementById("marketTrends").getContext("2d");
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

// Chart Initialization for Real-Time Data
const priceChart = new Chart(document.getElementById("stockPriceChart").getContext("2d"), {
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

const volumeChart = new Chart(document.getElementById("stockVolumeChart").getContext("2d"), {
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

// Function to Send Message to Chatbot
async function sendMessage() {
    let userText = document.getElementById("userInput").value.trim();
    if (userText === "") return;
    let chatbox = document.getElementById("chatbox");
    chatbox.innerHTML += `<p class='userText'><span>${userText}</span></p>`;
    document.getElementById("userInput").value = "";
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        let response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText }),
        });
        let data = await response.json();
        chatbox.innerHTML += `<p class='botText'><span>${data.response}</span></p>`;
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        chatbox.innerHTML += `<p class='botText'><span>Error contacting AI</span></p>`;
    }
}