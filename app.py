"""
Typeless backend — grammar cleanup service.

Flow:
  Browser sends raw transcript text  -->  this server
  This server sends it to the Gemini API with instructions to fix grammar
  This server sends the cleaned text back to the browser

Run locally:
    pip install -r requirements.txt
    # create a .env file with your GEMINI_API_KEY
    python app.py
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create model
model = genai.GenerativeModel("gemini-2.5-flash")

# Create Flask app
app = Flask(__name__)
CORS(app)


@app.route("/cleanup", methods=["POST"])
def cleanup():
    data = request.get_json(silent=True) or {}
    raw_text = data.get("text", "").strip()

    if not raw_text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""
You are an assistant that cleans speech-to-text transcripts.

Rules:
- Fix grammar.
- Add punctuation.
- Capitalize correctly.
- Remove filler words like "uh", "um", "you know" only if they don't change the meaning.
- Keep the original meaning.
- Return ONLY the corrected text.
- Do not add any explanations.

Text:
{raw_text}
"""

    try:
        response = model.generate_content(prompt)

        cleaned_text = response.text.strip()

        return jsonify({
            "cleaned": cleaned_text
        })

    except Exception as e:
        print("Gemini API Error:", e)
        return jsonify({
            "error": "Something went wrong while cleaning the text."
        }), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)