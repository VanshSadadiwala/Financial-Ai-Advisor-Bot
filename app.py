from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import time
import os
from collections import deque
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.preprocessing import MinMaxScaler
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable comprehensive CORS with all origins and methods
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

# Get API key from environment with fallback
API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY", "VT7LTAGSWHQY4O7O")
logger.info(f"Using Alpha Vantage API key: {'*' * len(API_KEY[:-4])} + {API_KEY[-4:]}")

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

# Function to convert duration string to pandas frequency string
def convert_duration_to_freq(duration):
    """Convert duration string to pandas frequency string"""
    if duration in ['1min', '5min', '15min', '30min', '60min']:
        # Convert '1min' to '1T', '5min' to '5T', etc.
        return duration.replace('min', 'T')
    elif duration == '1day':
        return 'D'  # Daily frequency
    elif duration == '1week':
        return 'W'  # Weekly frequency
    elif duration == '1month':
        return 'MS'  # Month start frequency
    else:
        # Default to daily if unknown
        logger.warning(f"Unknown duration format: {duration}, defaulting to daily")
        return 'D'

@app.route("/")
def home():
    return render_template("stockanalysis.html")

@app.route("/stock-data", methods=["GET"])
def get_stock_data():
    symbol = request.args.get("symbol", "").upper()
    duration = request.args.get("duration", "")

    logger.info(f"Stock data request - Symbol: {symbol}, Duration: {duration}")

    if not symbol or not duration:
        logger.warning("Missing parameters in stock-data request")
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
        logger.warning(f"Invalid duration parameter: {duration}")
        return jsonify({"error": "Invalid duration parameter"}), 400

    try:
        logger.info(f"Making API request to Alpha Vantage: {url}")
        response = requests.get(url, timeout=15)  # Add timeout
        logger.info(f"Alpha Vantage response status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"API Error: {response.text}")
            return jsonify({"error": f"Failed to fetch stock data: {response.text}"}), 500

        data = response.json()

        # Check for API errors
        if "Error Message" in data:
            logger.error(f"Alpha Vantage error: {data['Error Message']}")
            return jsonify({"error": data["Error Message"]}), 400
        if "Note" in data:
            logger.warning(f"Alpha Vantage rate limit note: {data['Note']}")
            return jsonify({"error": data["Note"]}), 429

        # Extract time series data
        if time_series_key not in data:
            logger.error(f"Time series key not found. Available keys: {list(data.keys())}")
            return jsonify({"error": "Time series data not found"}), 500

        time_series_data = data[time_series_key]
        logger.info(f"Successfully fetched {len(time_series_data)} data points")

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
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception: {str(e)}")
        return jsonify({"error": f"Network error fetching data: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route('/forecast', methods=['GET'])
def forecast():
    if not can_make_request():
        return jsonify({'error': 'Rate limit exceeded. Please try again tomorrow.'}), 429
    
    try:
        symbol = request.args.get('symbol', '').upper()
        duration = request.args.get('duration', '1min')
        
        print(f"Received request - Symbol: {symbol}, Duration: {duration}")  # Debug log
        
        if not symbol:
            print("Error: Missing symbol parameter")  # Debug log
            return jsonify({"error": "Missing symbol parameter"}), 400
            
        if not duration:
            print("Error: Missing duration parameter")  # Debug log
            return jsonify({"error": "Missing duration parameter"}), 400
            
        # Validate duration
        valid_durations = ['1min', '5min', '15min', '30min', '60min', '1day', '1week', '1month']
        if duration not in valid_durations:
            print(f"Error: Invalid duration - {duration}")  # Debug log
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

            print(f"Making API request to: {url}")  # Debug log
            response = requests.get(url)
            print(f"API Response Status: {response.status_code}")  # Debug log
            
            if response.status_code != 200:
                print(f"API Error: {response.text}")  # Debug log
                return jsonify({"error": f"Failed to fetch data from Alpha Vantage. Status code: {response.status_code}"}), 500
                
            data = response.json()
            print(f"API Response: {data}")  # Debug log
            
            if "Error Message" in data:
                print(f"API Error Message: {data['Error Message']}")  # Debug log
                return jsonify({"error": data["Error Message"]}), 400
            
            if "Note" in data:
                print(f"API Note: {data['Note']}")  # Debug log
                return jsonify({"error": data["Note"]}), 429
            
            if time_series_key not in data:
                print(f"Error: Time series key '{time_series_key}' not found")  # Debug log
                print(f"Available keys: {list(data.keys())}")  # Debug log
                return jsonify({"error": f"No time series data available for {duration}"}), 400
            
            time_series = data[time_series_key]
            if not time_series:
                print("Error: Time series data is empty")  # Debug log
                return jsonify({"error": "No time series data available"}), 400
            
        except Exception as e:
            print(f"Error fetching data: {str(e)}")  # Debug log
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
            
            print(f"Initial data shape: {df.shape}")
            print(f"Sample of initial data:\n{df.head()}")
            
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

            # Calculate the split point for 66% historical data
            total_length = len(prophet_df)
            historical_split = int(total_length * 0.66)  # 66% of data for historical
            
            # Split the data
            historical_df = prophet_df.iloc[:historical_split].copy()
            
            # Create and fit Prophet model with historical data
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
            
            # Fit the model with historical data
            model.fit(historical_df)
            
            # Calculate forecast periods (34% of total data)
            forecast_periods = int(total_length * 0.34)
            
            # Get the last date from historical data
            last_historical_date = historical_df['ds'].max()
            
            # Create future dates starting from the last historical date
            future_dates = pd.date_range(
                start=last_historical_date,
                periods=forecast_periods + 1,  # +1 to include the last historical date
                freq=convert_duration_to_freq(duration)  # Use the helper function
            )
            
            # Convert to DataFrame and format for Prophet
            future_dates = pd.DataFrame({'ds': future_dates})
            
            # Add regressor values for future dates
            future_dates['sma'] = historical_df['sma'].iloc[-1]
            future_dates['rsi'] = historical_df['rsi'].iloc[-1]
            
            # Generate forecast
            forecast = model.predict(future_dates)
            
            # Prepare response data - only include the 66% historical data
            historical_data = {}
            for idx, row in df.iloc[:historical_split].iterrows():
                historical_data[idx.strftime('%Y-%m-%d %H:%M:%S')] = {
                    "4. close": str(row['close'])
                }

            # Prepare forecast data (excluding the overlapping point)
            forecast_data = []
            for i in range(1, len(forecast)):  # Start from 1 to skip the overlapping point
                confidence = max(0.6, min(0.95, 0.85 - (i / (2 * len(forecast)))))  # Decreasing confidence over time
                forecast_data.append({
                    "datetime": forecast['ds'].iloc[i].strftime('%Y-%m-%d %H:%M:%S'),
                    "close": str(forecast['yhat'].iloc[i]),
                    "confidence": confidence
                })

            print(f"Historical data points: {len(historical_data)}")
            print(f"Forecast points: {len(forecast_data)}")
            print(f"Proportion: {(len(forecast_data)/(len(historical_data)+len(forecast_data)))*100:.2f}%")

            return jsonify({
                "historical": historical_data,
                "forecast": forecast_data
            })
            
        except Exception as e:
            print(f"Error in Prophet processing: {str(e)}")
            return jsonify({"error": f"Error in forecast processing: {str(e)}"}), 500
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)