import torch
import cv2
from torchvision import transforms
from model_loader import model, device

emotion_map = {
    0: "raiva",
    1: "nojo",
    2: "medo",
    3: "felicidade",
    4: "tristeza",
    5: "surpresa",
    6: "neutro"
}

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])

def predict_emotion(face_image):

    image = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(image)
        _, pred = torch.max(output, 1)

    return emotion_map[pred.item()]
