import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torchvision.models import densenet121, DenseNet121_Weights
from torch.utils.data import DataLoader
from google.colab import files
from tqdm import tqdm

# ==========================================
# 1. Path Resolution & Setup
# ==========================================
# Automatically handles both single and nested extraction directory structures
if os.path.exists('/content/chest_xray/chest_xray'):
    BASE_DIR = '/content/chest_xray/chest_xray'
else:
    BASE_DIR = '/content/chest_xray'

TRAIN_DIR = os.path.join(BASE_DIR, 'train')
VAL_DIR = os.path.join(BASE_DIR, 'val')

BATCH_SIZE = 32
MAX_EPOCHS = 25
LEARNING_RATE = 1e-4
EARLY_STOPPING_PATIENCE = 5
SAVE_PATH = '/content/medical_model_weights.pth'

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Target Execution Device: {DEVICE}")
print(f"Dataset Target Directory: {BASE_DIR}")

# ==========================================
# 2. Data Augmentation & Loaders
# ==========================================
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomRotation(10),
    transforms.RandomResizedCrop(224, scale=(0.95, 1.05)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=train_transforms)
val_dataset = datasets.ImageFolder(VAL_DIR, transform=val_transforms)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

# ==========================================
# 3. Class Imbalance Mitigation
# ==========================================
num_normal = len(os.listdir(os.path.join(TRAIN_DIR, 'NORMAL')))
num_pneumonia = len(os.listdir(os.path.join(TRAIN_DIR, 'PNEUMONIA')))
total_samples = num_normal + num_pneumonia

weight_normal = total_samples / (2.0 * num_normal)
weight_pneumonia = total_samples / (2.0 * num_pneumonia)
class_weights = torch.tensor([weight_normal, weight_pneumonia], dtype=torch.float32).to(DEVICE)

print(f"Class Distribution -> Normal: {num_normal} | Pneumonia: {num_pneumonia}")
print(f"Calculated Loss Weights -> Normal: {weight_normal:.3f} | Pneumonia: {weight_pneumonia:.3f}")

# ==========================================
# 4. Architecture Initialization & Fine-Tuning
# ==========================================
model = densenet121(weights=DenseNet121_Weights.DEFAULT)

# Strategic Unfreezing: Freeze early feature layers, unfreeze denseblock4 and classifier
for name, param in model.named_parameters():
    if "features.denseblock4" in name or "features.norm5" in name or "classifier" in name:
        param.requires_grad = True
    else:
        param.requires_grad = False

num_ftrs = model.classifier.in_features
model.classifier = nn.Linear(num_ftrs, 2)
model = model.to(DEVICE)

# ==========================================
# 5. Loss, Regularized Optimizer, and Scheduler
# ==========================================
criterion = nn.CrossEntropyLoss(weight=class_weights)

# L2 Regularization (weight_decay=1e-4) added to prevent overfitting
optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LEARNING_RATE,
    weight_decay=1e-4
)

# Reduces LR by half if validation loss fails to drop for 2 consecutive epochs
scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=2
)

# ==========================================
# 6. Dynamic Training Engine with Early Stopping
# ==========================================
print("\n--- Starting Dynamic Fine-Tuning Loop ---")
best_val_loss = float('inf')
epochs_no_improve = 0

for epoch in range(MAX_EPOCHS):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    loop = tqdm(train_loader, leave=True)
    for inputs, labels in loop:
        inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        
        loop.set_description(f"Epoch [{epoch+1}/{MAX_EPOCHS}]")
        loop.set_postfix(loss=loss.item(), acc=100. * correct / total)
        
    # --- Validation Loop ---
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0
    
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            val_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()
            
    epoch_val_loss = val_loss / len(val_loader)
    epoch_val_acc = 100. * val_correct / val_total
    
    # Step the learning rate scheduler based on current validation performance
    current_lr = optimizer.param_groups[0]['lr']
    scheduler.step(epoch_val_loss)
    
    print(f"Validation Summary -> Loss: {epoch_val_loss:.4f} | Accuracy: {epoch_val_acc:.2f}% | Current LR: {current_lr:.6f}")
    
    # --- Checkpoint & Early Stopping Evaluation ---
    if epoch_val_loss < best_val_loss:
        best_val_loss = epoch_val_loss
        torch.save(model.state_dict(), SAVE_PATH)
        epochs_no_improve = 0
        print("--> Checkpoint Saved: Optimal Validation Loss Attained.")
    else:
        epochs_no_improve += 1
        print(f"--> Validation loss did not improve. Patience counter: {epochs_no_improve}/{EARLY_STOPPING_PATIENCE}")
        
        if epochs_no_improve >= EARLY_STOPPING_PATIENCE:
            print(f"\n[!] Early Stopping Triggered: Convergence stabilized across {EARLY_STOPPING_PATIENCE} unimproved epochs.")
            break

# ==========================================
# 7. Model Export
# ==========================================
print(f"\nTraining Sequence Finished. Exporting optimal state dictionary: {SAVE_PATH}")
files.download(SAVE_PATH)