import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from dataset import FERDataset
from model import get_model
import numpy as np  
import os

# Configuração de dispositivo e escalonador
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- CARREGAMENTO ---
train_dataset = FERDataset("../data/fer2013.csv", usage="Training")
val_dataset = FERDataset("../data/fer2013.csv", usage="PublicTest")

train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True, num_workers=0, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False, num_workers=0, pin_memory=True)

model = get_model().to(device)

# Pesos para classes desequilibradas
labels = train_dataset.data["emotion"].values
counts = np.bincount(labels)
weights = torch.FloatTensor(len(counts) / (len(counts) * counts)).to(device)
criterion = nn.CrossEntropyLoss(weight=weights, label_smoothing=0.1)

# --- CARREGAR CHECKPOINT ---
checkpoint_path = "../models/checkpoint_fer.pth"
start_acc = 0
if os.path.exists(checkpoint_path):
    checkpoint = torch.load(checkpoint_path)
    model.load_state_dict(checkpoint['model_state_dict'])
    start_acc = checkpoint.get('best_acc', 0)
    print(f"Retomando do melhor resultado: {start_acc:.4f}")


try:
    scaler = torch.amp.GradScaler('cuda')
except:
    scaler = torch.cuda.amp.GradScaler()

def train_loop(epochs, model, loader, optimizer, scheduler=None, current_best=0):
    best_acc = current_best
    accumulation_steps = 8 

    for epoch in range(epochs):
        model.train()
        acc_loss, correct, total = 0, 0, 0
        optimizer.zero_grad()

        for i, (imgs, lbls) in enumerate(loader):
            imgs, lbls = imgs.to(device), lbls.to(device)

            with torch.amp.autocast('cuda'):
                outputs = model(imgs)
                loss = criterion(outputs, lbls)
                loss = loss / accumulation_steps 

            scaler.scale(loss).backward()

            if (i + 1) % accumulation_steps == 0:
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad()
                
            acc_loss += loss.item() * accumulation_steps
            _, p = torch.max(outputs, 1)
            correct += (p == lbls).sum().item()
            total += lbls.size(0)

        # Validação
        model.eval()
        v_correct, v_total = 0, 0
        with torch.no_grad():
            for v_imgs, v_lbls in val_loader:
                v_imgs, v_lbls = v_imgs.to(device), v_lbls.to(device)
                with torch.amp.autocast('cuda'):
                    v_out = model(v_imgs)
                _, vp = torch.max(v_out, 1)
                v_correct += (vp == v_lbls).sum().item()
                v_total += v_lbls.size(0)
        
        if scheduler:
            scheduler.step()

        v_acc = v_correct / v_total
        print(f"Epoch {epoch+1} | Loss: {acc_loss/len(loader):.3f} | Val Acc: {v_acc:.4f}")
        
        if v_acc > best_acc:
            best_acc = v_acc
            checkpoint = {
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'best_acc': best_acc,
            }
            torch.save(checkpoint, checkpoint_path)
            torch.save(model.state_dict(), "../models/best_emotion_v2.pt")
            print(f">> Novo Recorde: {best_acc:.4f}! Salvo.")
        
        torch.cuda.empty_cache()

if __name__ == '__main__':
    # Pula a Etapa 1 (cabeça) pois o modelo já está treinado.
    # Vamos direto para o polimento total.
    
    print("\nIniciando Etapa de Polimento Final (SGD + Resolução 240)...")
    for param in model.parameters(): param.requires_grad = True

    # LR cirúrgico e weight_decay para evitar overfitting
    optimizer = torch.optim.SGD(model.parameters(), lr=0.0005, momentum=0.9, weight_decay=5e-4)

    # Scheduler StepLR para reduzir o LR conforme a rede estabiliza
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    # Passamos o start_acc para ele saber o que bater
    train_loop(20, model, train_loader, optimizer, scheduler=scheduler, current_best=start_acc)