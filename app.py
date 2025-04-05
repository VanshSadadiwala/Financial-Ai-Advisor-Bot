from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os
import sys
import logging
from collections import deque
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.preprocessing import MinMaxScaler

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

try:
    app = Flask(__name__)
    CORS(app)  # Enable Cross-Origin Resource Sharing

    # Replace this with your Alpha Vantage API Key
    API_KEY = "VT7LTAGSWHQY4O7O"

    # Initialize a deque to store request times
    request_times = deque(maxlen=25)

    # Function to check rate limit
    def can_make_request():
        current_time = time.time()
        if len(request_times) < 25:
            request_times.append(current_time)
            return True
        elif current_time - request_times[0] > 86400:  # 86400 seconds = 1 day
            request_times.popleft()
            request_times.append(current_time)
            return True
        return False

    @app.route("/")
    def home():
        return "Flask Server is Running!"

    @app.route("/stock-data", methods=["GET"])
    def get_stock_data():
        symbol = request.args.get("symbol", "").upper()
        duration = request.args.get("duration", "")

        if not symbol or not duration:
            return jsonify({"error": "Invalid company symbol or duration"}), 400

        # Determine API endpoint and key for different durations
        if duration in ['1min', '5min', '15min', '30min', '60min']:
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={duration}&apikey={API_KEY}"
            time_series_key = f"Time Series ({duration})"
        elif duration == '1day':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={API_KEY}"
            time_series_key = "Time Series (Daily)"
        elif duration == '1week':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={symbol}&apikey={API_KEY}"
            time_series_key = "Weekly Time Series"
        elif duration == '1month':
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={API_KEY}"
            time_series_key = "Monthly Time Series"
        else:
            return jsonify({"error": "Invalid duration parameter"}), 400

        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch stock data: {response.text}"}), 500

        data = response.json()

        # Check for API errors
        if "Error Message" in data:
            return jsonify({"error": data["Error Message"]}), 400
        if "Note" in data:
            return jsonify({"error": data["Note"]}), 429

        # Extract time series data
        if time_series_key not in data:
            return jsonify({"error": "Time series data not found"}), 500

        time_series_data = data[time_series_key]

        # Format the response into a list
        formatted_data = []
        for datetime, values in time_series_data.items():
            formatted_data.append({
                "datetime": datetime,
                "open": values["1. open"],
                "high": values["2. high"],
                "low": values["3. low"],
                "close": values["4. close"],
                "volume": values["5. volume"]
            })

        return jsonify(formatted_data)

    @app.route('/forecast', methods=['GET'])
    def forecast():
        if not can_make_request():
            return jsonify({'error': 'Rate limit exceeded. Please try again tomorrow.'}), 429
        
        try:
            symbol = request.args.get('symbol', '').upper()
            duration = request.args.get('duration', '1min')
            
            logger.info(f"Received forecast request - Symbol: {symbol}, Duration: {duration}")
            
            if not symbol:
                logger.error("Missing symbol parameter")
                return jsonify({"error": "Missing symbol parameter"}), 400
            
            if not duration:
                logger.error("Missing duration parameter")
                return jsonify({"error": "Missing duration parameter"}), 400
            
            # Validate duration
            valid_durations = ['1min', '5min', '15min', '30min', '60min', '1day', '1week', '1month']
            if duration not in valid_durations:
                logger.error(f"Invalid duration - {duration}")
                return jsonify({"error": f"Invalid duration. Must be one of: {', '.join(valid_durations)}"}), 400
            
            # Fetch historical data
            try:
                if duration in ['1min', '5min', '15min', '30min', '60min']:
                    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={duration}&apikey={API_KEY}&outputsize=full"
                    time_series_key = f"Time Series ({duration})"
                elif duration == '1day':
                    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={API_KEY}&outputsize=full"
                    time_series_key = "Time Series (Daily)"
                elif duration == '1week':
                    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol={symbol}&apikey={API_KEY}"
                    time_series_key = "Weekly Time Series"
                elif duration == '1month':
                    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={API_KEY}"
                    time_series_key = "Monthly Time Series"

                logger.info(f"Making API request to Alpha Vantage: {url}")
                
                # Add timeout and error handling for API request
                try:
                    response = requests.get(url, timeout=10)
                    logger.info(f"API Response Status: {response.status_code}")
                except requests.exceptions.Timeout:
                    logger.error("API request timed out")
                    return jsonify({"error": "API request timed out. Please try again later."}), 504
                except requests.exceptions.ConnectionError:
                    logger.error("Connection error when accessing Alpha Vantage API")
                    return jsonify({"error": "Could not connect to Alpha Vantage API. Please check your internet connection."}), 503
                
                if response.status_code != 200:
                    logger.error(f"API Error: {response.text}")
                    return jsonify({"error": f"Failed to fetch data from Alpha Vantage. Status code: {response.status_code}"}), 500
                
                try:
                    data = response.json()
                    logger.info(f"API Response keys: {list(data.keys())}")
                except ValueError:
                    logger.error(f"Invalid JSON response: {response.text[:100]}...")
                    return jsonify({"error": "Invalid response from Alpha Vantage API"}), 500
                
                if "Error Message" in data:
                    logger.error(f"API Error Message: {data['Error Message']}")
                    return jsonify({"error": data["Error Message"]}), 400
                
                if "Note" in data:
                    logger.warning(f"API Note: {data['Note']}")
                    return jsonify({"error": data["Note"]}), 429
                
                if time_series_key not in data:
                    logger.error(f"Error: Time series key '{time_series_key}' not found")
                    logger.error(f"Available keys: {list(data.keys())}")
                    return jsonify({"error": f"No time series data available for {duration}"}), 400
                
                time_series = data[time_series_key]
                if not time_series:
                    logger.error("Error: Time series data is empty")
                    return jsonify({"error": "No time series data available"}), 400
                
                # Print some basic stats for debugging
                logger.info(f"Number of data points: {len(time_series)}")
                
            except Exception as e:
                logger.exception(f"Error fetching data: {str(e)}")
                return jsonify({"error": f"Error fetching data: {str(e)}"}), 500

            # Convert to DataFrame and prepare for Prophet
            try:
                # Convert to DataFrame and ensure numeric values
                df = pd.DataFrame.from_dict(time_series, orient='index')
                df.index = pd.to_datetime(df.index)
                df = df.sort_index()
                
                # Convert string values to numeric with proper column names
                df = df.rename(columns={
                    '1. open': 'open',
                    '2. high': 'high',
                    '3. low': 'low',
                    '4. close': 'close',
                    '5. volume': 'volume'
                })
                
                # Convert all columns to numeric
                for col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                
                logger.info(f"Initial data shape: {df.shape}")
                logger.debug(f"Sample of initial data:\n{df.head()}")
                
                # Create Prophet DataFrame with required columns
                prophet_df = pd.DataFrame()
                prophet_df['ds'] = df.index  # Date column
                prophet_df['y'] = df['close'].values  # Target variable
                
                # Calculate SMA
                sma_period = min(5, len(df))
                prophet_df['sma'] = df['close'].rolling(window=sma_period, min_periods=1).mean().values
                
                # Calculate RSI
                delta = df['close'].diff()
                gain = delta.where(delta > 0, 0).rolling(window=7, min_periods=1).mean()
                loss = -delta.where(delta < 0, 0).rolling(window=7, min_periods=1).mean()
                rs = gain / loss
                prophet_df['rsi'] = (100 - (100 / (1 + rs))).values
                
                # Handle any remaining NaN values
                prophet_df = prophet_df.fillna(method='ffill').fillna(method='bfill')
                
                logger.info(f"Prophet DataFrame shape: {prophet_df.shape}")
                logger.debug(f"Sample of Prophet data:\n{prophet_df.head()}")
                logger.debug(f"NaN values in Prophet DataFrame:\n{prophet_df.isna().sum()}")
                
                # Verify data validity
                if len(prophet_df) < 5:
                    return jsonify({"error": f"Insufficient data points. Need at least 5, but got {len(prophet_df)}"}), 400
                
                # Create and fit Prophet model
                try:
                    model = Prophet(
                        daily_seasonality=True,
                        weekly_seasonality=True,
                        yearly_seasonality=True,
                        changepoint_prior_scale=0.05,
                        seasonality_prior_scale=10,
                        changepoint_range=0.9
                    )
                    
                    # Add regressors
                    model.add_regressor('sma', standardize=True)
                    model.add_regressor('rsi', standardize=True)
                    
                    logger.info("Prophet model created, fitting data...")
                    # Fit the model
                    model.fit(prophet_df)
                    logger.info("Prophet model fitted successfully")
                    
                    # Create future dates for forecasting
                    future_dates = model.make_future_dataframe(periods=30, freq='min')
                    
                    # Add regressor values for future dates
                    future_dates['sma'] = prophet_df['sma'].iloc[-1]  # Use last SMA value
                    future_dates['rsi'] = prophet_df['rsi'].iloc[-1]  # Use last RSI value
                    
                    logger.info("Making forecast predictions...")
                    # Generate forecast
                    forecast = model.predict(future_dates)
                    logger.info(f"Forecast generated with {len(forecast)} predictions")
                    
                    # Calculate confidence levels
                    confidence_levels = []
                    for i in range(len(forecast) - len(prophet_df)):
                        yhat = forecast['yhat'].iloc[-(i+1)]
                        yhat_lower = forecast['yhat_lower'].iloc[-(i+1)]
                        yhat_upper = forecast['yhat_upper'].iloc[-(i+1)]
                        
                        # Calculate base confidence from prediction interval
                        interval_width = yhat_upper - yhat_lower
                        base_confidence = 1 - (interval_width / (2 * yhat))
                        
                        # Adjust confidence based on RSI
                        rsi_value = prophet_df['rsi'].iloc[-1]
                        if 40 <= rsi_value <= 60:
                            confidence_adj = 1.1  # Higher confidence in neutral RSI
                        elif 30 <= rsi_value <= 70:
                            confidence_adj = 1.0  # Normal confidence
                        else:
                            confidence_adj = 0.9  # Lower confidence in extreme RSI
                        
                        confidence = min(0.95, max(0.6, base_confidence * confidence_adj))
                        confidence_levels.append(confidence)
                    
                    # Prepare response data
                    historical_data = {}
                    for idx, row in df.iterrows():
                        historical_data[idx.strftime('%Y-%m-%d %H:%M:%S')] = {
                            "1. open": str(row['open']),
                            "2. high": str(row['high']),
                            "3. low": str(row['low']),
                            "4. close": str(row['close']),
                            "5. volume": str(row['volume'])
                        }
                    
                    forecast_data = []
                    for i in range(len(forecast) - len(prophet_df)):
                        forecast_data.append({
                            "datetime": forecast['ds'].iloc[-(i+1)].strftime('%Y-%m-%d %H:%M:%S'),
                            "close": float(forecast['yhat'].iloc[-(i+1)]),
                            "confidence": float(confidence_levels[i])
                        })
                    
                    logger.info(f"Returning {len(forecast_data)} forecast datapoints")
                    return jsonify({
                        "historical": historical_data,
                        "forecast": forecast_data
                    })
                except Exception as e:
                    logger.exception(f"Error in Prophet model: {str(e)}")
                    if "capacity" in str(e).lower() or "memory" in str(e).lower():
                        return jsonify({"error": "Server capacity exceeded. Try with less data or a longer interval."}), 503
                    if "convergence" in str(e).lower():
                        return jsonify({"error": "Model failed to converge. Try with different parameters or data."}), 500
                    return jsonify({"error": f"Error in forecast processing: {str(e)}"}), 500
                
            except Exception as e:
                logger.exception(f"Error in Prophet processing: {str(e)}")
                return jsonify({"error": f"Error in forecast processing: {str(e)}"}), 500
                
        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}")  # Debug log
            return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    if __name__ == "__main__":
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=False)
except Exception as e:
    print(f"Error initializing app: {str(e)}")
    sys.exit(1)