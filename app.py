from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
import pdfkit
import requests
import json
from dotenv import load_dotenv  # Add this import

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure pdfkit - WINDOWS VERSION
# Update this path if your wkhtmltopdf installed elsewhere
wkhtmltopdf_path = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    resume_text = data.get('resume_text', '')
    
    # Get API key from .env
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        return jsonify({"success": False, "error": "API key not configured"})
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "AI Resume Builder"
    }
    
    payload = {
        "model": "openai/gpt-3.5-turbo",  # Default model
        "messages": [
            {"role": "system", "content": "You are a professional resume analyzer. Provide specific, actionable suggestions to improve this resume for ATS compatibility and hiring potential."},
            {"role": "user", "content": f"Please analyze this resume and provide improvement suggestions:\n\n{resume_text}"}
        ],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30  # 30 seconds timeout
        )
        response.raise_for_status()
        suggestions = response.json()["choices"][0]["message"]["content"]
        return jsonify({"success": True, "suggestions": suggestions})
    
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"API request failed: {str(e)}"})
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"})

@app.route('/improve', methods=['POST'])
def improve_section():
    data = request.json
    section_text = data.get('section_text', '')
    section_type = data.get('section_type', 'general')
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        return jsonify({"success": False, "error": "API key not configured"})
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "AI Resume Builder"
    }
    
    payload = {
        "model": "qwen/qwq-32b:free",
        "messages": [
            {"role": "system", "content": f"You are a professional resume writer. Improve this {section_type} section to be more impactful and ATS-friendly."},
            {"role": "user", "content": section_text}
        ],
        "temperature": 0.5
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        improved_text = response.json()["choices"][0]["message"]["content"]
        return jsonify({"success": True, "improved_text": improved_text})
    
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"API request failed: {str(e)}"})
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"})

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    html_content = data.get('html_content', '')
    
    try:
        # Generate PDF
        pdf = pdfkit.from_string(html_content, False, configuration=config)
        return jsonify({
            "success": True,
            "pdf": pdf.decode('latin-1')
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": f"PDF generation failed: {str(e)}. Please ensure wkhtmltopdf is installed at {wkhtmltopdf_path}"})

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)