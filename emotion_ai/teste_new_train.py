import cv2
from ultralytics import YOLO

def rodar_inferencia_webcam(path_modelo="psico_ai/affectnet_96px_otimizado/weights/best.pt"):
    """
    Abre a webcam, captura os frames, aplica o redimensionamento ideal
    e executa o modelo YOLOv8 com o threshold de confiança otimizado.
    """
    # 1. Carregar o modelo treinado (.pt)
    print(f"[INFO] Carregando o modelo de: {path_modelo}...")
    model = YOLO(path_modelo)

    # 2. Inicializar a captura da Webcam (0 costuma ser a câmera padrão)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("[ERRO] Não foi possível abrir a webcam.")
        return

    print("[INFO] Webcam iniciada com sucesso. Pressione 'q' para sair.")

    while True:
        # Captura o frame atual da câmera
        ret, frame = cap.read()
        if not ret:
            print("[ERRO] Falha ao capturar o frame da webcam.")
            break

        # 3. Simular o comportamento do Front-end (Redimensionamento Quadrado)
        frame_otimizado = cv2.resize(frame, (480, 480))

        # 4. Executar a inferência com o threshold ideal descoberto na curva F1 (0.54)
        # O YOLOv8 gerencia internamente o upscaling para os 224px do treino de forma eficiente
        results = model.predict(source=frame_otimizado, conf=0.54, verbose=False)

        # 5. Extração dos dados brutos (Ideal para o empacotamento do gRPC)
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Captura os dados de classe e acurácia da detecção atual
                class_id = int(box.cls[0])
                label_nome = model.names[class_id]
                confianca = float(box.conf[0])
                
                # Exemplo de payload pronto para estruturar sua mensagem gRPC/Redis
                payload_grpc = {
                    "emocao": label_nome,
                    "confianca": round(confianca, 4),
                    "coordenadas_face": box.xyxy[0].tolist() # [xmin, ymin, xmax, ymax]
                }
                
                # print(f"[gRPC Payload]: {payload_grpc}")

        # 6. Renderizar os resultados visuais na tela (Caixas e Textos nativos do YOLO)
        # O método plot() desenha as bounding boxes e os nomes das emoções automaticamente
        frame_anotado = results[0].plot()

        # Mostra o frame processado em uma janela do Windows/Ubuntu
        cv2.imshow("Monitoramento Psicológico - IA (YOLOv8)", frame_anotado)

        # 7. Condição de Parada: Pressione a tecla 'q' no teclado para fechar a câmera
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Liberar os recursos da máquina ao encerrar
    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Aplicação encerrada com sucesso.")

if __name__ == "__main__":
    
    caminho_do_peso = "./train_yolo/psico_ai_02/affectnet_96px_otimizado_02/weights/best.pt" 
    
    rodar_inferencia_webcam(path_modelo=caminho_do_peso)