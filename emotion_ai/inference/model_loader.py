import torch
import torch.nn as nn
from torchvision import models

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.resnet50(weights=None)

num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 7)

model.load_state_dict(torch.load("../models/best_emotion.pt", map_location=device))
model.to(device)
model.eval()
