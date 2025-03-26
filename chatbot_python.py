import tkinter as tk
from tkinter import PhotoImage, filedialog
import google.generativeai as genai
import speech_recognition as sr
import pyttsx3
import time
import PyPDF2  # For reading PDFs
import cv2
import pytesseract
import numpy as np
import matplotlib.pyplot as plt
from tkinter import filedialog

# Initialize Gemini API
genai.configure(api_key="AIzaSyBlLc0JGB6RY2W3fY9Ng1gWPac97OPCpKU")

# Initialize text-to-speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Adjust speaking speed

# Track if the bot is waiting for a YES/NO response
waiting_for_details = False
last_full_response = ""
last_user_query = ""
document_text = ""  # Store uploaded document text

# Function to make JARVIS speak the full text with pauses
def speak_full_text(text):
    engine.stop()
    paragraphs = text.split("\n")

    for para in paragraphs:
        if para.strip():
            engine.say(para)
            engine.runAndWait()
            time.sleep(0.5)

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

# Function to handle document upload
def upload_document():
    global document_text
    file_path = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf"), ("Text Files", "*.txt")])

    if file_path:
        if file_path.endswith(".pdf"):
            document_text = extract_text_from_pdf(file_path)  # Extract from PDF
        elif file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as file:
                document_text = file.read()  # Read text from TXT file

        # Show message in chat
        animate_bot_response("Document uploaded successfully. You can now ask questions about it.")


# Function to get response from Gemini AI
def get_gemini_response(prompt):
    global document_text
    global document_used  # Track if the document was used

    try:
        chatbot = genai.GenerativeModel("gemini-1.5-pro")

        # If the user asks about the document, include it in the prompt
        if "document" in prompt.lower() and document_text:
            full_prompt = f"Based on the following document content:\n{document_text}\n\n{prompt}"
            document_used = True  # Mark that the document was used
        else:
            full_prompt = prompt  # Normal conversation

        response = chatbot.generate_content(full_prompt)
        return response.text.strip()

    except Exception as e:
        return f"Error: {str(e)}"



# Function to animate bot response
def animate_bot_response(text, is_question=False):
    chat_log.config(state=tk.NORMAL)
    chat_log.insert(tk.END, "JARVIS: ", "bot")

    for char in text:
        chat_log.insert(tk.END, char, "bot")
        chat_log.update()
        time.sleep(0.02)  # Smooth typing effect

    chat_log.insert(tk.END, "\n", "bot")
    chat_log.config(state=tk.DISABLED)
    chat_log.yview(tk.END)

    # Speak only if JARVIS is asking a question
    if is_question:
        speak_full_text(text)

# Function to send user message
def send_message(event=None):
    user_text = user_input.get().strip()
    if user_text == "":
        return

    chat_log.config(state=tk.NORMAL)
    chat_log.insert(tk.END, f"You: {user_text}\n", "user")

    # Easter Egg: If user types "3000", JARVIS says "I am Iron Man" and exits
    if user_text == "3000":
        bot_response = "I am Iron Man"
        animate_bot_response(bot_response)
        speak_full_text(bot_response)  # Make JARVIS say it
        root.quit()  # Exit the chatbot
        return

    # Get response from Gemini AI
    bot_response = get_gemini_response(user_text)

    animate_bot_response(bot_response)

    user_input.delete(0, tk.END)  # Clear input field


# Function for voice input
def voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        chat_log.insert(tk.END, "Listening...\n", "bot")
        chat_log.update()
        try:
            audio = recognizer.listen(source, timeout=5)
            user_text = recognizer.recognize_google(audio)
            user_input.delete(0, tk.END)
            user_input.insert(0, user_text)
            send_message()
        except sr.UnknownValueError:
            animate_bot_response("Sorry, I didn't catch that.")
        except sr.RequestError:
            animate_bot_response("Speech recognition service is unavailable.")

# Function to display the welcome message
def animated_welcome():
    welcome_text = "Hello, I am JARVIS. How can I assist you?"
    animate_bot_response(welcome_text)

# Create the main chat window
root = tk.Tk()
root.title("JARVIS - AI Chatbot")
root.geometry("600x550")
root.resizable(False, False)
root.configure(bg="#1e1e1e")

# Chat log area
chat_log = tk.Text(root, bg="#2d2d2d", fg="white", font=("Arial", 12), wrap="word", state=tk.DISABLED)
chat_log.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
chat_log.tag_configure("user", foreground="#00ffcc", font=("Arial", 12, "bold"))
chat_log.tag_configure("bot", foreground="#ffcc00", font=("Arial", 12, "italic"))

# Entry field (Typing Bar Fixed)
user_input = tk.Entry(root, bg="#3d3d3d", fg="white", font=("Arial", 14))
user_input.pack(side=tk.LEFT, padx=10, pady=5, fill=tk.X, expand=True)
user_input.bind("<Return>", send_message)  # Pressing Enter sends the message

# Load icons (UNCHANGED)
send_icon_path = r"D:\Project\GDG\Financial-Ai-Advisory-Bot\icon\send_icon.png"
send_icon = PhotoImage(file=send_icon_path)
mic_icon_path = r"D:\Project\GDG\Financial-Ai-Advisory-Bot\icon\mic_icon.png"
mic_icon = PhotoImage(file=mic_icon_path)
speaker_icon_path = r"D:\Project\GDG\Financial-Ai-Advisory-Bot\icon\speaker_icon.png"
speaker_icon = PhotoImage(file=speaker_icon_path)

# Buttons
send_button = tk.Button(root, image=send_icon, command=send_message, bg="#1e1e1e", bd=0)
send_button.pack(side=tk.RIGHT, padx=5, pady=5)

mic_button = tk.Button(root, image=mic_icon, command=voice_input, bg="#1e1e1e", bd=0)
mic_button.pack(side=tk.RIGHT, padx=5, pady=5)

speaker_button = tk.Button(root, image=speaker_icon, command=lambda: speak_full_text(chat_log.get("end-2l", "end-1l").strip()), bg="#1e1e1e", bd=0)
speaker_button.pack(side=tk.RIGHT, padx=5, pady=5)

# Upload Document Button
upload_button = tk.Button(root, text="Upload Document", command=upload_document, bg="#333", fg="white", font=("Arial", 12))
upload_button.pack(pady=5)

# Show welcome message after UI loads
root.after(1000, animated_welcome)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Update this path if necessary

# Function to analyze a graph image
def analyze_graph_image():
    file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg")])
    if not file_path:
        return "No file selected."

    # Load the image
    image = cv2.imread(file_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to enhance text extraction
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)

    # Extract text from the image
    extracted_text = pytesseract.image_to_string(thresh)

    # Edge detection for data points
    edges = cv2.Canny(gray, 50, 150)

    # Identify contours (possible data points)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Analyze extracted information
    insights = generate_insights_from_text(extracted_text)

    # Generate a response
    response = f"Graph Analysis Complete!\n\nExtracted Text:\n{extracted_text}\n\nInsights:\n{insights}"
    
    return response

# Function to generate insights from extracted text
def generate_insights_from_text(text):
    insights = []
    if "increase" in text.lower():
        insights.append("The trend shows an increasing pattern over time.")
    if "decrease" in text.lower():
        insights.append("The trend indicates a drop at some point.")
    if "stable" in text.lower():
        insights.append("The data remains stable without significant fluctuations.")
    if "anomaly" in text.lower() or "drop" in text.lower():
        insights.append("There may be an anomaly or unexpected drop in the graph.")

    return "\n".join(insights) if insights else "No significant patterns detected."

# Function to handle image upload and analysis
def upload_graph():
    analysis_result = analyze_graph_image()
    animate_bot_response(analysis_result)
root.mainloop()
