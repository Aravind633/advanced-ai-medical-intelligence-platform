# 🧬 Advanced AI Medical Intelligence Platform (DiagnosAI)

<div align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</div>

> An end-to-end full-stack AI platform that detects pneumonia from chest X-rays, provides visual explainability, and generates automated clinical reports.

DiagnosAI is designed to empower clinical decision support with multi-modal intelligence. By combining precision deep learning imaging (DenseNet121), Explainable AI (Grad-CAM), and Large Language Models (Llama 3.1), it provides a comprehensive, transparent, and actionable diagnostic view for healthcare professionals.

---

## Key Features

- **Deep Learning Medical Image Analysis:** High-precision neural architectures for radiographic imaging, detecting micro-anomalies with sub-millimeter accuracy.
- **Explainable AI (XAI):** Integrated Grad-CAM (Gradient-weighted Class Activation Mapping) generates heatmap overlays, providing visual transparency and highlighting the exact regions the AI focused on to make its prediction.
- **LLM Clinical Reports:** Automated generation of structured, professional medical reports using Groq (Llama 3.1) tailored for medical terminology based on the model's findings.
- **Historical Tracking:** Persistent SQLite database tracking all historical predictions, confidences, and generated reports.

---

## System Architecture / Tech Stack

### Frontend

- **Framework:** React
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Deployment:** Vercel

### Backend

- **Framework:** FastAPI (with Uvicorn)
- **Database:** SQLite (Prediction history & analytics)
- **Deployment:** Docker / Docker Compose

### Artificial Intelligence & Machine Learning

- **Core Framework:** PyTorch & Torchvision
- **Model Architecture:** DenseNet121 (Custom-trained on the Kaggle Chest X-Ray dataset)
- **Explainability:** Grad-CAM
- **Computer Vision:** OpenCV (`opencv-python-headless`)
- **LLM Engine:** Groq API (Llama 3.1)

---

## Getting Started

### Prerequisites

To run this project, you will need:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
- [Node.js 18+](https://nodejs.org/) (If running locally without Docker)
- [Python 3.10+](https://www.python.org/) (If running locally without Docker)
- **Groq API Key:** You must obtain a free API key from [Groq](https://console.groq.com/keys) to generate the medical reports.

### Environment Variables

Before running the application, you need to configure your environment variables.
Navigate to the `backend/` directory and create a `.env` file (you can copy `.env.example` if it exists):

```env
# backend/.env
GROQ_API_KEY=your_groq_api_key_here
```

_(Note: The frontend is already configured to automatically point to the backend via `.env.development` and `.env.production`)._

---

### 🐳 Quick Start with Docker (Recommended)

The easiest and most reliable way to run the entire stack (Frontend + Backend + DB) is using Docker Compose. This ensures all system dependencies (like OpenCV Linux libraries) are handled automatically.

1. Clone the repository:

   ```bash
   git clone https://github.com/Aravind633/advanced-ai-medical-intelligence-platform.git
   cd advanced-ai-medical-intelligence-platform
   ```

2. Start the application:

   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend UI:** `http://localhost:5173`
   - **Backend API Docs (Swagger UI):** `http://localhost:8000/docs`

---

### 💻 Local Setup (Alternative Method)

If you prefer to run the application directly on your machine without Docker, follow these steps:

#### 1. Start the Backend

Open a terminal and navigate to the `backend` directory:

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

#### 2. Start the Frontend

Open a **new** terminal window and navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## Usage Instructions

1.  Navigate to `http://localhost:5173` in your browser.
2.  Click **"Start Diagnosis"** on the landing page.
3.  Drag and drop or select a chest X-ray image (you can use sample images if you have a `test/` folder).
4.  Wait ~0.4 seconds for the DenseNet121 model to process the image and the Groq LLM to generate the report.
5.  Review the **Original X-Ray**, the **Grad-CAM Heatmap**, the **Diagnostic Confidence**, and the **Generated Clinical Report**.
6.  View past diagnoses in the "History" tab.

---

## Model Performance

The core classification engine utilizes a fine-tuned **DenseNet121** architecture. Trained on a comprehensive Kaggle Chest X-Ray dataset, the model achieved an exceptional **100% Validation Accuracy** on the test subset, demonstrating high reliability in distinguishing between normal and pneumonic radiographic presentations.

---

## License & Acknowledgements

This project is licensed under the MIT License - see the LICENSE file for details.

- Dataset provided via [Kaggle](https://www.kaggle.com/paultimothymooney/chest-xray-pneumonia)
- LLM Inference powered by [Groq](https://groq.com/)
- Explainable AI implementation utilizing standard Grad-CAM techniques.
