import os
import torch
import torch.nn as nn
from torchvision.models import densenet121, DenseNet121_Weights
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

# Path to the weights
WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), 'model', 'medical_model_weights.pth')
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = ['Normal', 'Pneumonia']

# Load model
def load_model():
    model = densenet121(weights=None)
    num_ftrs = model.classifier.in_features
    model.classifier = nn.Linear(num_ftrs, 2)
    
    if os.path.exists(WEIGHTS_PATH):
        model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))
        print("Model weights loaded successfully.")
    else:
        print(f"Warning: Model weights not found at {WEIGHTS_PATH}. Predictions will be random.")
        
    model = model.to(DEVICE)
    model.eval()
    return model

model = load_model()

# Transforms matching ml_model.py (val_transforms)
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_and_explain(image_path: str, output_heatmap_path: str):
    image = Image.open(image_path).convert('RGB')
    input_tensor = preprocess(image).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, predicted_idx = torch.max(probabilities, 0)
        
    predicted_class = CLASS_NAMES[predicted_idx.item()]
    confidence_score = confidence.item()
    
    # Generate Grad-CAM
    # We use features.norm5 as the target layer for DenseNet121
    target_layers = [model.features.norm5]
    
    # Needs requires_grad for GradCAM
    model.train() # GradCAM temporarily changes requires_grad if needed, but we keep it in eval for model layers natively or just let GradCAM handle it. 
    # Actually, pytorch-grad-cam handles the eval mode internally. We can leave it.
    
    cam = GradCAM(model=model, target_layers=target_layers)
    targets = [ClassifierOutputTarget(predicted_idx.item())]
    
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]
    
    # Overlay on original image
    img_cv = cv2.imread(image_path)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    img_cv = cv2.resize(img_cv, (224, 224))
    img_float = np.float32(img_cv) / 255
    
    visualization = show_cam_on_image(img_float, grayscale_cam, use_rgb=True)
    
    # Convert back to BGR for saving with cv2
    visualization = cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_heatmap_path, visualization)
    
    model.eval() # ensure it's back in eval mode
    
    return {
        "class": predicted_class,
        "confidence": confidence_score
    }
