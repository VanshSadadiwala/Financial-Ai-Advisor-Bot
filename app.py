from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import pyttsx3
import speech_recognition as sr
import time
import PyPDF2
import pytesseract
import cv2

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend requests

# Configure Gemini AI
genai.configure(api_key="AIzaSyBlLc0JGB6RY2W3fY9Ng1gWPac97OPCpKU")
chatbot = genai.GenerativeModel("gemini-1.5-pro")

# Initialize Text-to-Speech Engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Adjust speaking speed

document_text = ""  # Store uploaded document text


# Function to generate AI response
def get_gemini_response(prompt):
    global document_text
    try:
        # If document is uploaded and user asks about it, include it
        if "document" in prompt.lower() and document_text:
            full_prompt = f"Based on the following document content:\n{document_text}\n\n{prompt}"
        else:
            full_prompt = prompt  # Normal conversation

        response = chatbot.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"


# Flask route for chatbot interaction
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    response = get_gemini_response(user_input)
    return jsonify({"response": response})


# Flask route for voice recognition
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


# Flask route to upload and extract text from a PDF
@app.route("/upload", methods=["POST"])
def upload_document():
    global document_text
    file = request.files.get("file")
    
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(file)
        document_text = "\n".join([page.extract_text() for page in reader.pages])
    elif file.filename.endswith(".txt"):
        document_text = file.read().decode("utf-8")

    return jsonify({"message": "Document uploaded successfully"})


# Flask route to analyze a graph image
@app.route("/analyze_graph", methods=["POST"])
def analyze_graph():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    extracted_text = pytesseract.image_to_string(thresh)

    insights = []
    if "increase" in extracted_text.lower():
        insights.append("The trend shows an increasing pattern over time.")
    if "decrease" in extracted_text.lower():
        insights.append("The trend indicates a drop at some point.")
    if "stable" in extracted_text.lower():
        insights.append("The data remains stable without significant fluctuations.")

    return jsonify({"extracted_text": extracted_text, "insights": insights})


# Run Flask app
if __name__ == "__main__":
    app.run(debug=True)
