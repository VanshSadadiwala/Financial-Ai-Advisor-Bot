import requests
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

POLYGON_API_KEY = "idl8QpvHV2xwBlK4g17LcPXkZXLbUtYE"

def get_realtime_stock_data(ticker):
    """Fetch real-time stock data (1-minute interval for today)."""
    today = datetime.today().strftime("%Y-%m-%d")
    
    try:
        # Fetch data from the Polygon API
        url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/minute/{today}/{today}?apiKey={POLYGON_API_KEY}"
        response = requests.get(url).json()

        # Log the response to check the returned data or error message
        print("Polygon API Response:", response)  # Add this line for debugging

        if "results" not in response or not response["results"]:
            return None

        # Prepare data from the response
        data = response["results"]
        filtered_data = []

        for point in data:
            timestamp = datetime.fromtimestamp(point["t"] / 1000)
            # Skip weekend data (if any)
            if timestamp.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                continue
            filtered_data.append({
                "x": timestamp.isoformat(),
                "y": round(point["c"], 2)  # Closing price for the minute
            })

        if not filtered_data:
            return None

        latest = filtered_data[-1]  # Most recent data point

        return {
            "symbol": ticker.upper(),
            "price": round(latest["y"], 2),
            "change": round(latest["y"] - filtered_data[0]["y"], 2),  # Change based on the first data point
            "percent_change": round(((latest["y"] - filtered_data[0]["y"]) / filtered_data[0]["y"]) * 100, 2),
            "high": round(max(point["y"] for point in filtered_data), 2),
            "low": round(min(point["y"] for point in filtered_data), 2),
            "volume": sum(point["y"] for point in filtered_data),  # Estimate volume (if necessary)
            "data": filtered_data
        }
    
    except Exception as e:
        # Catch any exceptions and print the error to the console
        print("Error fetching real-time stock data:", str(e))  # Log error message
        return {"error": "Failed to fetch real-time data", "details": str(e)}  # Return error details

def get_historical_stock_data(ticker, duration):
    """Fetch historical stock data based on selected duration."""
    duration_map = {
        "1D": (1, "minute"),
        "7D": (30, "minute"),
        "1M": (1, "day"),
        "6M": (7, "day"),
        "1Y": (15, "day"),
        "5Y": (1, "month")
    }

    if duration not in duration_map:
        return None

    multiplier, timespan = duration_map[duration]
    start_date = (datetime.today() - timedelta(days={
        "1D": 1, "7D": 7, "1M": 30, "6M": 180, "1Y": 365, "5Y": 1825
    }[duration])).strftime("%Y-%m-%d")

    end_date = datetime.today().strftime("%Y-%m-%d")

    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{start_date}/{end_date}?apiKey={POLYGON_API_KEY}"
    response = requests.get(url).json()

    if "results" not in response or not response["results"]:
        return None

    data = response["results"]
    historical_data = []

    for point in data:
        timestamp = datetime.fromtimestamp(point["t"] / 1000)
        # Skip weekend data (Saturday or Sunday)
        if timestamp.weekday() >= 5:
            continue
        historical_data.append({
            "x": timestamp.isoformat(),
            "y": round(point["c"], 2)
        })

    return {"symbol": ticker.upper(), "data": historical_data}

@app.route("/get_stock_data", methods=["POST"])
def fetch_stock_data():
    """Fetch stock data and update with real-time stock info."""
    data = request.get_json()
    ticker = data.get("ticker")
    duration = data.get("duration")

    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400

    stock_data = get_historical_stock_data(ticker, duration)

    # Always fetch real-time stock info, regardless of duration selected
    real_time_info = get_realtime_stock_data(ticker)

    if not stock_data:
        stock_data = {"symbol": ticker.upper(), "data": []}

    if real_time_info:
        stock_data.update({
            "price": real_time_info["price"],
            "change": real_time_info["change"],
            "percent_change": real_time_info["percent_change"],
            "high": real_time_info["high"],
            "low": real_time_info["low"],
            "volume": real_time_info["volume"]
        })

    return jsonify(stock_data)

@app.route("/get_realtime_stock_data", methods=["POST"])
def get_realtime_stock():
    """Fetch real-time stock data (just in case needed separately)."""
    data = request.get_json()
    ticker = data.get("ticker", "").upper()

    if not ticker:
        return jsonify({"error": "No ticker provided"}), 400

    realtime_data = get_realtime_stock_data(ticker)

    if not realtime_data:
        return jsonify({"error": "Failed to fetch real-time data"}), 500

    return jsonify(realtime_data)

@app.route("/")
def index():
    return render_template("Analysis.html")

if __name__ == "__main__":
    app.run(debug=True)