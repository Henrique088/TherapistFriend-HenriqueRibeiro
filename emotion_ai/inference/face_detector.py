from retinaface import RetinaFace
import cv2

def detect_face(frame):

    detections = RetinaFace.detect_faces(frame)

    if isinstance(detections, dict):

        # pega o rosto com maior confiança
        face = list(detections.values())[0]

        x1, y1, x2, y2 = face["facial_area"]

        face_crop = frame[y1:y2, x1:x2]

        return face_crop

    return None
