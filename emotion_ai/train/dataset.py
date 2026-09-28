import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset
from torchvision import transforms
import cv2

class FERDataset(Dataset):
    def __init__(self, csv_file, usage="Training"):
        self.data = pd.read_csv(csv_file)
        self.data = self.data[self.data["Usage"] == usage]

        # Aumento de resolução para 240x240 para o polimento final
        target_size = (240, 240)

        self.train_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(target_size), # Resolução maior
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(5), # Reduzido para ser mais preciso
            transforms.ColorJitter(brightness=0.05, contrast=0.05), # Suave
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self.val_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(target_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        self.usage = usage

    def __len__(self): return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        pixels = np.array(row["pixels"].split(), dtype="uint8")
        image = pixels.reshape(48, 48)
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        image = self.train_transform(image) if self.usage == "Training" else self.val_transform(image)
        return image, torch.tensor(int(row["emotion"]), dtype=torch.long)