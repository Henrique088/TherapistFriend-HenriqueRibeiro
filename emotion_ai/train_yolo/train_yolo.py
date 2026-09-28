from ultralytics import YOLO
import torch

def train_psico_yolo_96px():
    # Carregar modelo Nano 
    model = YOLO("yolov8n.pt") 

    # Treinamento focado no dataset (96x96)
    model.train(
        data="/home/henrique088/Documentos/projeto/desacoplamento/TheraphistFriend_Docker_/emotion_ai/data/YOLO_format/data.yaml", 
        epochs=100, # Número total de vezes que o modelo vai passar por todo o conjunto de dados durante o treino.
        imgsz=224, # Redimensiona todas as imagens para o tamanho de 224x224 pixels antes de enviar para a rede.            
        batch=64,  # Número de imagens processadas por vez antes de atualizar os pesos do modelo.           
        device=0, # Rodar na GPU
        project="psico_ai_02",
        name="affectnet_96px_otimizado_02",
        save=True,
        
        # --- Ajustes para combater o Falso Positivo (Background) ---
        augment=True, #Ativa o aumento de dados automático (rotação, espelhamento, etc.) evita overfitting       
        close_mosaic=20, # Desliga o mosaico no final para limpar os ruídos das bordas
        optimizer="AdamW", # Define o algoritmo de otimização dos pesos
        lr0=0.001, # Taxa de aprendizado inicial. Controla o tamanho do "passo" que o otimizador dá ao corrigir os erros do modelo.          
        
        # Hiperparâmetros de regularização (opcional se o problema persistir)
        # box=8.5,            # Dá um pouco mais de peso para acertar o contorno exato do rosto
        # cls=0.4,            # Deixa a classificação um triz mais rigorosa para evitar "chutes"
    )

if __name__ == "__main__":
    train_psico_yolo_96px()