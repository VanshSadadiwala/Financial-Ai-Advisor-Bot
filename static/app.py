from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from collections import deque

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Replace this with your Twelve Data API Key
API_KEY = "VQAAYJJYJOGUT8OF"

# Rate limiting setup
request_times = deque(maxlen=5)  # Store timestamps of the last 8 requests

# Function to check rate limit
def can_make_request():
    current_time = time.time()
    if len(request_times) < 5:
        request_times.append(current_time)
        return True
    elif current_time - request_times[0] > 60:
        request_times.popleft()
        request_times.append(current_time)
        return True
    return False

@app.route("/")
def home():
    return "Flask Server is Running!"

@app.route("/stock-data", methods=["GET"])
def get_stock_data():
    user_input = request.args.get("symbol", "").upper()
    duration = request.args.get("duration", "")

    if not user_input or not duration:
        return jsonify({"error": "Invalid company name or ticker code or duration"}), 400

    if not can_make_request():
        return jsonify({"error": "Rate limit exceeded. Please wait a minute."}), 429

    try:
        # API URL for Alpha Vantage
        if duration in ['1min', '5min', '15min', '30min', '60min']:
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={user_input}&interval={duration}&apikey={API_KEY}"
        elif duration == '1day':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={user_input}&apikey={API_KEY}"
        elif duration == '1week':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={user_input}&apikey={API_KEY}"
        elif duration == '1month':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={user_input}&apikey={API_KEY}"
        else:
            return jsonify({"error": "Invalid duration parameter"}), 400

        print(f"Making request to: {url}")  # Debug log
        response = requests.get(url)
        print(f"Response status: {response.status_code}")  # Debug log
        print(f"Response content: {response.text}")  # Debug log

        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch stock data: {response.text}"}), 500

        data = response.json()
        print(f"Parsed data: {data}")  # Debug log

        # Check for API error messages
        if "Error Message" in data:
            return jsonify({"error": data["Error Message"]}), 400
        if "Note" in data:
            return jsonify({"error": data["Note"]}), 429

        # Get the correct time series key based on duration
        time_series_key = None
        if duration in ['1min', '5min', '15min', '30min', '60min']:
            time_series_key = f"Time Series ({duration})"
        elif duration == '1day':
            time_series_key = "Time Series (Daily)"
        elif duration == '1week':
            time_series_key = "Weekly Time Series"
        elif duration == '1month':
            time_series_key = "Monthly Time Series"

        if time_series_key not in data:
            return jsonify({"error": "Invalid data format received from API"}), 500

        # Convert the time series data to the format expected by the frontend
        formatted_data = []
        for date, values in data[time_series_key].items():
            formatted_data.append({
                "datetime": date,
                "open": values["1. open"],
                "high": values["2. high"],
                "low": values["3. low"],
                "close": values["4. close"],
                "volume": values["5. volume"]
            })

        return jsonify(formatted_data)
    except Exception as e:
        app.logger.error(f"Error fetching data: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
