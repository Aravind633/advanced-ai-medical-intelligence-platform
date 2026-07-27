import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime

from database import engine, get_db, Base, History
from ml_service import predict_and_explain
from llm_service import generate_medical_report

app = FastAPI(title="Advanced AI Medical Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
HEATMAP_DIR = os.path.join(os.path.dirname(__file__), "heatmaps")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(HEATMAP_DIR, exist_ok=True)

# Mount static files so frontend can fetch images directly
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/heatmaps", StaticFiles(directory=HEATMAP_DIR), name="heatmaps")

@app.post("/api/predict")
async def predict_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    
    image_filename = f"{file_id}.{ext}"
    heatmap_filename = f"{file_id}_heatmap.jpg"
    
    image_path = os.path.join(UPLOAD_DIR, image_filename)
    heatmap_path = os.path.join(HEATMAP_DIR, heatmap_filename)
    
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Run ML Inference and Grad-CAM
        result = predict_and_explain(image_path, heatmap_path)
        
        # Save initial prediction to DB (without report yet, or generate immediately)
        # To keep it fast, we can return the prediction and let the frontend request the report in a separate call, 
        # or do it here. Let's do it here for simplicity.
        
        report = generate_medical_report(result["class"], result["confidence"])
        
        history_record = History(
            file_name=file.filename,
            predicted_class=result["class"],
            confidence=result["confidence"],
            llm_report=report,
            original_image_path=f"/uploads/{image_filename}",
            heatmap_image_path=f"/heatmaps/{heatmap_filename}"
        )
        
        db.add(history_record)
        db.commit()
        db.refresh(history_record)
        
        return {
            "id": history_record.id,
            "predicted_class": history_record.predicted_class,
            "confidence": history_record.confidence,
            "report": history_record.llm_report,
            "original_image_url": f"/uploads/{image_filename}",
            "heatmap_image_url": f"/heatmaps/{heatmap_filename}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    records = db.query(History).order_by(History.timestamp.desc()).all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "file_name": r.file_name,
            "predicted_class": r.predicted_class,
            "confidence": r.confidence,
            "report": r.llm_report,
            "original_image_url": f"{r.original_image_path}",
            "heatmap_image_url": f"{r.heatmap_image_path}"
        }
        for r in records
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
