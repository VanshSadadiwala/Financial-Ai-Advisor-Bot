from vercel_python_wsgi import convert_vercel_to_wsgi
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import app from main app.py file
from app import app

# Vercel serverless function handler
def handler(event, context):
    """Vercel serverless function handler that adapts to WSGI"""
    # Convert Vercel's event format to WSGI format
    return convert_vercel_to_wsgi(app, event, context) 