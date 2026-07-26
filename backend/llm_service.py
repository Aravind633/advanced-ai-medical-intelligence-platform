import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Ensure GROQ_API_KEY is in environment
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY")
)

def generate_medical_report(predicted_class: str, confidence: float) -> str:
    prompt = f"""
    You are an expert radiologist AI assistant. 
    A chest X-ray has been analyzed by a deep learning model (DenseNet121).
    
    The model predicts: {predicted_class}
    Confidence Score: {confidence * 100:.2f}%
    
    Please write a structured, professional clinical radiology report based on this finding.
    Include standard sections:
    - EXAMINATION: Chest Radiograph (PA/AP view)
    - CLINICAL INDICATION: AI-Assisted Screening
    - FINDINGS: (Based on the {predicted_class} prediction)
    - IMPRESSION: (Clear summary of the diagnosis)
    
    Keep it concise and highly professional. Do not add any disclaimers about being an AI, just write the report as requested.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional radiologist writing medical reports."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant", # Updated Groq model
            temperature=0.3,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error generating report: {str(e)}"
