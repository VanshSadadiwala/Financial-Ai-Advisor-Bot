from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import speech_recognition as sr
import time
import PyPDF2
import pytesseract
import cv2
import numpy as np
from gtts import gTTS
import os
import tempfile
from dotenv import load_dotenv

# ----- Initialization -----
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend requests

# Load from .env file (only works locally; Render uses real environment variables)
load_dotenv()

# Get API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Safety check
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
chatbot = genai.GenerativeModel("gemini-pro")

# Initialize text-to-speech functionality
def text_to_speech(text):
    """Convert text to speech using gTTS and return the filename."""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
        tts = gTTS(text=text, lang="en", slow=False)
        tts.save(temp_file.name)
        return temp_file.name

# Global variable to store document text (for context in queries)
document_text = ""

# ----- Helper Functions -----
def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file-like object."""
    text = ""
    reader = PyPDF2.PdfReader(pdf_file)
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def get_gemini_response(prompt):
    """Generate a response from Gemini AI, optionally including document context."""
    global document_text
    try:
        if "document" in prompt.lower() and document_text:
            full_prompt = f"Based on the following document content:\n{document_text}\n\n{prompt}"
        else:
            full_prompt = prompt
        
        response = chatbot.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def generate_insights_from_text(text):
    """Generate simple insights from extracted text."""
    insights = []
    lower_text = text.lower()
    if "increase" in lower_text:
        insights.append("The trend shows an increasing pattern over time.")
    if "decrease" in lower_text:
        insights.append("The trend indicates a drop at some point.")
    if "stable" in lower_text:
        insights.append("The data remains stable without significant fluctuations.")
    if "anomaly" in lower_text or "drop" in lower_text:
        insights.append("There may be an anomaly or unexpected drop in the graph.")
    return "\n".join(insights) if insights else "No significant patterns detected."

def analyze_graph_image(file_bytes):
    """Analyze a graph image and extract text and insights."""
    image = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return "Error processing image."
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    extracted_text = pytesseract.image_to_string(thresh)
    insights = generate_insights_from_text(extracted_text)
    response = f"Graph Analysis Complete!\n\nExtracted Text:\n{extracted_text}\n\nInsights:\n{insights}"
    return response

# ----- Flask Routes -----
@app.route("/")
def index():
    return render_template("chatbot.html")  # Place your chatbot.html in the "templates" folder

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    response = get_gemini_response(user_input)
    return jsonify({"response": response})

@app.route("/voice", methods=["GET"])
def voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        try:
            audio = recognizer.listen(source, timeout=5)
            user_text = recognizer.recognize_google(audio)
            return jsonify({"message": user_text})
        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand audio"}), 400
        except sr.RequestError:
            return jsonify({"error": "Speech recognition service unavailable"}), 500

# Store temporary file paths
active_audio_files = {}

@app.route("/speak", methods=["POST"])
def speak_text():
    text = request.json.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        print(f"Generating speech for text: {text[:50]}...")
        
        # Generate unique ID for this audio
        file_id = str(int(time.time()))
        speech_file = text_to_speech(text)
        
        # Verify the file exists
        if not os.path.exists(speech_file):
            raise Exception(f"Generated file {speech_file} does not exist")
            
        print(f"Generated speech file at: {speech_file}")
        active_audio_files[file_id] = speech_file
        
        return jsonify({"success": True, "audio_id": file_id})
    except Exception as e:
        import traceback
        print(f"Error generating speech: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Error generating speech: {str(e)}"}), 500

@app.route("/audio/<file_id>", methods=["GET"])
def get_audio(file_id):
    try:
        if file_id not in active_audio_files:
            print(f"Audio file ID {file_id} not found. Available IDs: {list(active_audio_files.keys())}")
            return jsonify({"error": "Audio file not found"}), 404
            
        filepath = active_audio_files[file_id]
        if not os.path.exists(filepath):
            print(f"Audio file {filepath} does not exist on disk")
            return jsonify({"error": "Audio file not found on disk"}), 404
            
        print(f"Serving audio file: {filepath}")
        return send_file(filepath, mimetype="audio/mpeg")
    except Exception as e:
        import traceback
        print(f"Error serving audio: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Error serving audio: {str(e)}"}), 500

@app.route("/upload", methods=["POST"])
def upload_document():
    global document_text
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if file.filename.endswith(".pdf"):
        document_text = extract_text_from_pdf(file)
    elif file.filename.endswith(".txt"):
        document_text = file.read().decode("utf-8")
    else:
        return jsonify({"error": "Unsupported file type"}), 400
    return jsonify({"message": "Document uploaded successfully"})

@app.route("/analyze_graph", methods=["POST"])
def analyze_graph():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400
    analysis = analyze_graph_image(file.read())
    return jsonify({"response": analysis})

# ----- Run Flask App -----
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
