import cv2
import time
from face_detector import detect_face
from emotion_predictor import predict_emotion

cap = cv2.VideoCapture(0)

# reduz resolução → ganho absurdo de FPS
cap.set(3, 640)
cap.set(4, 480)

last_inference = 0
face_crop = None
emotion = None

while True:

    ret, frame = cap.read()
    if not ret:
        break

    current_time = time.time()

    # roda detecção + emoção a cada 3 segundos
    if current_time - last_inference >= 3:

        detected_face = detect_face(frame)

        if detected_face is not None:
            face_crop = detected_face
            emotion = predict_emotion(face_crop)
            print("Emoção:", emotion)

        last_inference = current_time

    # mostra emoção na tela (sem rodar inferência toda hora)
    if emotion is not None:
        cv2.putText(
            frame,
            f"Emocao: {emotion}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    cv2.imshow("Camera", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
