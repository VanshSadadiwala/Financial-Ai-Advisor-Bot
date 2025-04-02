from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from collections import deque
from datetime import datetime
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Replace this with your Alpha Vantage API Key
API_KEY = "VQAAYJJYJOGUT8OF"

# Rate limiting setup
request_times = deque(maxlen=5)  # Store timestamps of the last 5 requests

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
    market_session = request.args.get("session", "regular")
    period = request.args.get("period", "1month")

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

        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch stock data: {response.text}"}), 500

        data = response.json()

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
        current_date = datetime.now()
        
        for date, values in data[time_series_key].items():
            # For 5-minute interval data, filter based on market session
            if duration == '5min':
                dt = datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
                time = dt.time()
                
                if market_session == 'pre' and time >= datetime.strptime('04:00', '%H:%M').time() and time < datetime.strptime('09:30', '%H:%M').time():
                    formatted_data.append({
                        "datetime": date,
                        "open": values["1. open"],
                        "high": values["2. high"],
                        "low": values["3. low"],
                        "close": values["4. close"],
                        "volume": values["5. volume"]
                    })
                elif market_session == 'regular' and time >= datetime.strptime('09:30', '%H:%M').time() and time < datetime.strptime('16:00', '%H:%M').time():
                    formatted_data.append({
                        "datetime": date,
                        "open": values["1. open"],
                        "high": values["2. high"],
                        "low": values["3. low"],
                        "close": values["4. close"],
                        "volume": values["5. volume"]
                    })
                elif market_session == 'after' and time >= datetime.strptime('16:00', '%H:%M').time() and time <= datetime.strptime('20:00', '%H:%M').time():
                    formatted_data.append({
                        "datetime": date,
                        "open": values["1. open"],
                        "high": values["2. high"],
                        "low": values["3. low"],
                        "close": values["4. close"],
                        "volume": values["5. volume"]
                    })
            else:
                # For monthly data, filter based on period
                if duration == '1month':
                    dt = datetime.strptime(date, '%Y-%m-%d')
                    months_diff = (current_date.year - dt.year) * 12 + (current_date.month - dt.month)
                    
                    if period == '1month' and months_diff <= 1:
                        formatted_data.append({
                            "datetime": date,
                            "open": values["1. open"],
                            "high": values["2. high"],
                            "low": values["3. low"],
                            "close": values["4. close"],
                            "volume": values["5. volume"]
                        })
                    elif period == '3month' and months_diff <= 3:
                        formatted_data.append({
                            "datetime": date,
                            "open": values["1. open"],
                            "high": values["2. high"],
                            "low": values["3. low"],
                            "close": values["4. close"],
                            "volume": values["5. volume"]
                        })
                    elif period == '6month' and months_diff <= 6:
                        formatted_data.append({
                            "datetime": date,
                            "open": values["1. open"],
                            "high": values["2. high"],
                            "low": values["3. low"],
                            "close": values["4. close"],
                            "volume": values["5. volume"]
                        })
                    elif period == '1year' and months_diff <= 12:
                        formatted_data.append({
                            "datetime": date,
                            "open": values["1. open"],
                            "high": values["2. high"],
                            "low": values["3. low"],
                            "close": values["4. close"],
                            "volume": values["5. volume"]
                        })
                    elif period == '8year' and months_diff <= 96:  # 8 years = 96 months
                        formatted_data.append({
                            "datetime": date,
                            "open": values["1. open"],
                            "high": values["2. high"],
                            "low": values["3. low"],
                            "close": values["4. close"],
                            "volume": values["5. volume"]
                        })
                else:
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

@app.route("/forecast", methods=["GET"])
def get_stock_forecast():
    user_input = request.args.get("symbol", "").upper()
    duration = request.args.get("duration", "1day")
    forecast_periods = int(request.args.get("periods", "50"))

    if not user_input:
        return jsonify({"error": "Invalid company name or ticker code"}), 400

    try:
        # First, get historical data
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

        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch stock data"}), 500

        data = response.json()
        
        # Get the correct time series key
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

        # Convert data to DataFrame
        df = pd.DataFrame.from_dict(data[time_series_key], orient='index')
        df.index = pd.to_datetime(df.index)
        df.columns = ['open', 'high', 'low', 'close', 'volume']
        df = df.astype(float)
        df = df.sort_index()

        # Prepare data for Prophet
        prophet_df = df.reset_index()
        prophet_df.columns = ['ds', 'open', 'high', 'low', 'close', 'volume']
        prophet_df = prophet_df[['ds', 'close']]
        prophet_df.columns = ['ds', 'y']

        # Create and fit Prophet model
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=True,
            changepoint_prior_scale=0.05,
            interval_width=0.95
        )
        
        # Add additional regressors
        model.add_regressor('volume')
        model.add_regressor('high')
        model.add_regressor('low')
        
        # Prepare data with additional features
        prophet_df['volume'] = df['volume'].values
        prophet_df['high'] = df['high'].values
        prophet_df['low'] = df['low'].values
        
        # Fit the model
        model.fit(prophet_df)

        # Create future dates for forecasting
        future_dates = model.make_future_dataframe(periods=forecast_periods)
        
        # Add future values for regressors (using last known values)
        future_dates['volume'] = prophet_df['volume'].iloc[-1]
        future_dates['high'] = prophet_df['high'].iloc[-1]
        future_dates['low'] = prophet_df['low'].iloc[-1]

        # Generate forecast
        forecast = model.predict(future_dates)

        # Calculate confidence levels based on Prophet's uncertainty intervals
        confidence_levels = []
        for i in range(len(forecast) - len(prophet_df)):
            yhat_lower = forecast['yhat_lower'].iloc[-(i+1)]
            yhat_upper = forecast['yhat_upper'].iloc[-(i+1)]
            yhat = forecast['yhat'].iloc[-(i+1)]
            confidence = 1 - (yhat_upper - yhat_lower) / (2 * yhat)
            confidence_levels.append(max(0.6, min(0.95, confidence)))

        # Prepare forecast data
        forecast_data = []
        for i in range(forecast_periods):
            forecast_data.append({
                "datetime": forecast['ds'].iloc[-(i+1)].strftime('%Y-%m-%d'),
                "close": float(forecast['yhat'].iloc[-(i+1)]),
                "confidence": float(confidence_levels[i])
            })

        # Convert historical data to match the API format
        historical_data = {}
        for date, row in df.tail(100).iterrows():
            historical_data[date.strftime('%Y-%m-%d')] = {
                "1. open": str(row['open']),
                "2. high": str(row['high']),
                "3. low": str(row['low']),
                "4. close": str(row['close']),
                "5. volume": str(row['volume'])
            }

        return jsonify({
            "historical": historical_data,
            "forecast": forecast_data
        })

    except Exception as e:
        app.logger.error(f"Error in forecasting: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
