from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import pyttsx3
import speech_recognition as sr
import time
import PyPDF2
import pytesseract
import cv2
import numpy as np

# ----- Initialization -----
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend requests

# Configure Gemini AI
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
chatbot = genai.GenerativeModel("gemini-1.5-pro")

# Initialize Text-to-Speech Engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Adjust speaking speed

# Global variable to store document text (for context in queries)
document_text = ""

# ----- Helper Functions -----
def speak_full_text(text):
    """Uses text-to-speech to speak the given text."""
    engine.stop()
    paragraphs = text.split("\n")
    for para in paragraphs:
        if para.strip():
            engine.say(para)
            engine.runAndWait()
            time.sleep(0.5)

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
        # If a document was uploaded and the user query mentions 'document', include its content
        if "document" in prompt.lower() and document_text:
            full_prompt = f"Based on the following document content:\n{document_text}\n\n{prompt}"
        else:
            full_prompt = prompt  # Normal conversation
        
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
    # Decode image from the file bytes
    image = cv2.imdecode(np.frombuffer(file_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return "Error processing image."
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Enhance text extraction using thresholding
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    extracted_text = pytesseract.image_to_string(thresh)
    insights = generate_insights_from_text(extracted_text)
    response = f"Graph Analysis Complete!\n\nExtracted Text:\n{extracted_text}\n\nInsights:\n{insights}"
    return response

# ----- Flask Routes -----
# Route to serve the chatbot webpage
@app.route("/")
def index():
    return render_template("chatbot.html")  # Place your chatbot.html in the "templates" folder

# API route for chatbot interaction
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    response = get_gemini_response(user_input)
    return jsonify({"response": response})

# API route for voice recognition
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

# API route to upload and extract text from a document (PDF or TXT)
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

# API route to analyze a graph image
@app.route("/analyze_graph", methods=["POST"])
def analyze_graph():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400
    analysis = analyze_graph_image(file.read())
    return jsonify({"response": analysis})

# ----- Run Flask App -----
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
