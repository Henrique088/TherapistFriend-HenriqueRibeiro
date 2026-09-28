import os
import sys
import warnings
from pathlib import Path
from concurrent import futures
from datetime import datetime

import grpc
import cv2
import numpy as np
from ultralytics import YOLO

import analisador_pb2
import analisador_pb2_grpc


# ============================================================
# Configurações
# ============================================================

warnings.filterwarnings("ignore", category=FutureWarning)
os.environ["YOLO_VERBOSE"] = "False"


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent


# ------------------------------------------------------------
# Modelo YOLO para DETECÇÃO DE ROSTO
# ------------------------------------------------------------

face_model_path = (
    BASE_DIR
    / "models"
    / "yolov8n-face.pt"
)


# ------------------------------------------------------------
# Modelo YOLO para DETECÇÃO DE EMOÇÃO
# ------------------------------------------------------------

emotion_model_path = (
    BASE_DIR
    / "train_yolo"
    / "psico_ai_02"
    / "affectnet_96px_otimizado_02"
    / "weights"
    / "best.pt"
)


# ------------------------------------------------------------
# Pasta onde os frames recebidos serão salvos
# ------------------------------------------------------------

frames_dir = BASE_DIR / "frames_recebidos"
frames_dir.mkdir(parents=True, exist_ok=True)


# ------------------------------------------------------------
# Pasta onde os rostos recortados serão salvos
# ------------------------------------------------------------

face_crops_dir = BASE_DIR / "face_crops"
face_crops_dir.mkdir(parents=True, exist_ok=True)


print(
    f"[INIT] Frames recebidos serão salvos em: {frames_dir}",
    flush=True
)

print(
    f"[INIT] Crops dos rostos serão salvos em: {face_crops_dir}",
    flush=True
)


# ============================================================
# Configurações do detector facial
# ============================================================

FACE_IMGSZ = 640

# Threshold do detector facial.
# 0.30 permite encontrar rostos menores/distantes.
FACE_CONF = 0.30

# Margem adicionada ao redor do rosto antes do crop.
FACE_MARGIN = 0.15


# ============================================================
# Configurações do detector de emoção
# ============================================================

# Treinamento foi feito usando imgsz=224.
EMOTION_IMGSZ = 224

EMOTION_CONF = 0.54


# ============================================================
# Carrega YOLO de detecção facial
# ============================================================

print(
    "[INIT] Carregando YOLO de detecção facial...",
    flush=True
)

try:

    if not face_model_path.exists():

        raise FileNotFoundError(
            f"Modelo facial não encontrado: "
            f"{face_model_path}"
        )

    face_model = YOLO(
        str(face_model_path)
    )

    print(
        "[INIT] ✅ Modelo facial carregado com sucesso:",
        flush=True
    )

    print(
        f"[INIT]     {face_model_path}",
        flush=True
    )

    print(
        f"[INIT] Classes do detector facial: "
        f"{face_model.names}",
        flush=True
    )

except Exception as e:

    print(
        f"[INIT] ❌ ERRO CRÍTICO ao carregar "
        f"modelo facial: {e}",
        flush=True
    )

    sys.exit(1)


# ============================================================
# Carrega YOLO de emoções
# ============================================================

print(
    "[INIT] Carregando YOLO de emoções...",
    flush=True
)

try:

    if not emotion_model_path.exists():

        raise FileNotFoundError(
            f"Modelo de emoções não encontrado: "
            f"{emotion_model_path}"
        )

    emotion_model = YOLO(
        str(emotion_model_path)
    )

    print(
        "[INIT] ✅ Modelo de emoções carregado com sucesso:",
        flush=True
    )

    print(
        f"[INIT]     {emotion_model_path}",
        flush=True
    )

    print(
        f"[INIT] Classes de emoção: "
        f"{emotion_model.names}",
        flush=True
    )

except Exception as e:

    print(
        f"[INIT] ❌ ERRO CRÍTICO ao carregar "
        f"modelo de emoções: {e}",
        flush=True
    )

    sys.exit(1)


# ============================================================
# Serviço gRPC
# ============================================================

class AnalisadorService(
    analisador_pb2_grpc.AnalisadorServiceServicer
):

    def __init__(self):

        self.face_model = face_model
        self.emotion_model = emotion_model

    # ========================================================
    # DetectEmotion
    # ========================================================

    def DetectEmotion(self, request, context):

        try:

            # =================================================
            # 1. Recebe o frame
            # =================================================

            nparr = np.frombuffer(
                request.imagem,
                np.uint8
            )

            frame = cv2.imdecode(
                nparr,
                cv2.IMREAD_COLOR
            )

            if frame is None:

                print(
                    "[gRPC] ❌ Não foi possível "
                    "decodificar o frame",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Sem Frame",
                    confianca=0.0
                )


            # =================================================
            # Informações do frame
            # =================================================

            frame_height, frame_width = frame.shape[:2]

            print(
                f"[gRPC] 📥 Frame recebido: "
                f"{frame_width}x{frame_height}",
                flush=True
            )


            # =================================================
            # 2. Salva o frame original
            # =================================================

            timestamp = datetime.now().strftime(
                "%Y%m%d_%H%M%S_%f"
            )

            frame_filename = (
                frames_dir
                / f"frame_{timestamp}.jpg"
            )

            # saved = cv2.imwrite(
            #     str(frame_filename),
            #     frame
            # )

            # if saved:

            #     print(
            #         f"[gRPC] 📸 Frame salvo: "
            #         f"{frame_filename}",
            #         flush=True
            #     )

            # else:

            #     print(
            #         f"[gRPC] ⚠️ Não foi possível salvar: "
            #         f"{frame_filename}",
            #         flush=True
            #     )


            # =================================================
            # 3. YOLO FACE
            #
            # Detecta somente os rostos.
            # =================================================

            print(
                "[gRPC] 🔎 Procurando rosto...",
                flush=True
            )

            face_results = self.face_model.predict(
                source=frame,
                imgsz=FACE_IMGSZ,
                conf=FACE_CONF,
                verbose=False
            )


            # =================================================
            # 4. Verifica se encontrou algum rosto
            # =================================================

            if (
                len(face_results) == 0
                or face_results[0].boxes is None
                or len(face_results[0].boxes) == 0
            ):

                print(
                    "[gRPC] ⚠️ Nenhum rosto detectado",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Rosto Não Detectado",
                    confianca=0.0
                )


            face_result = face_results[0]


            # =================================================
            # 5. Mostra todas as faces encontradas
            # =================================================

            print(
                f"[gRPC] 👥 Rostos encontrados: "
                f"{len(face_result.boxes)}",
                flush=True
            )


            # =================================================
            # 6. Seleciona o maior rosto
            #
            # Atualmente o sistema considera a pessoa
            # principal como sendo o maior rosto encontrado.
            # =================================================

            best_face_index = None
            best_face_area = 0


            for i, box in enumerate(
                face_result.boxes
            ):

                coords = (
                    box.xyxy[0]
                    .cpu()
                    .numpy()
                )

                x1, y1, x2, y2 = (
                    coords.astype(int)
                )

                width = max(
                    0,
                    x2 - x1
                )

                height = max(
                    0,
                    y2 - y1
                )

                area = width * height

                confidence = float(
                    box.conf.item()
                )

                print(
                    f"[gRPC] 👤 Face {i}: "
                    f"conf={confidence:.3f} "
                    f"box=({x1},{y1})-({x2},{y2}) "
                    f"size={width}x{height}",
                    flush=True
                )

                if area > best_face_area:

                    best_face_area = area
                    best_face_index = i


            # =================================================
            # 7. Segurança
            # =================================================

            if best_face_index is None:

                print(
                    "[gRPC] ❌ Não foi possível "
                    "selecionar um rosto",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Rosto Não Detectado",
                    confianca=0.0
                )


            # =================================================
            # 8. Bounding box do maior rosto
            # =================================================

            face_box = face_result.boxes[
                best_face_index
            ]

            coords = (
                face_box.xyxy[0]
                .cpu()
                .numpy()
            )

            x1, y1, x2, y2 = (
                coords.astype(int)
            )

            face_detection_conf = float(
                face_box.conf.item()
            )


            # =================================================
            # 9. Calcula tamanho do rosto
            # =================================================

            face_width = x2 - x1
            face_height = y2 - y1


            # =================================================
            # 10. Adiciona margem
            # =================================================

            margin_x = int(
                face_width * FACE_MARGIN
            )

            margin_y = int(
                face_height * FACE_MARGIN
            )

            x1_crop = max(
                0,
                x1 - margin_x
            )

            y1_crop = max(
                0,
                y1 - margin_y
            )

            x2_crop = min(
                frame_width,
                x2 + margin_x
            )

            y2_crop = min(
                frame_height,
                y2 + margin_y
            )


            # =================================================
            # 11. Crop do rosto
            # =================================================

            face_crop = frame[
                y1_crop:y2_crop,
                x1_crop:x2_crop
            ]


            if face_crop.size == 0:

                print(
                    "[gRPC] ❌ Crop facial vazio",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Erro no Crop",
                    confianca=0.0
                )


            # =================================================
            # 12. Salva crop facial
            # =================================================

            # crop_filename = (
            #     face_crops_dir
            #     / f"face_{timestamp}.jpg"
            # )

            # crop_saved = cv2.imwrite(
            #     str(crop_filename),
            #     face_crop
            # )

            # if crop_saved:

            #     print(
            #         f"[gRPC] 👤 Crop salvo: "
            #         f"{crop_filename}",
            #         flush=True
            #     )


            crop_height, crop_width = (
                face_crop.shape[:2]
            )

            print(
                f"[gRPC] 👤 Face original: "
                f"{face_width}x{face_height}",
                flush=True
            )

            print(
                f"[gRPC] 👤 Crop com margem: "
                f"{crop_width}x{crop_height}",
                flush=True
            )

            print(
                f"[gRPC] 👤 Confiança facial: "
                f"{face_detection_conf:.3f}",
                flush=True
            )


            # =================================================
            # 13. YOLO EMOTION
            #
            # Aqui o best.pt recebe SOMENTE o rosto.
            #
            # =================================================

            print(
                "[gRPC] 🧠 Analisando emoção...",
                flush=True
            )

            emotion_results = (
                self.emotion_model.predict(
                    source=face_crop,
                    imgsz=EMOTION_IMGSZ,
                    conf=EMOTION_CONF,
                    verbose=False
                )
            )


            # =================================================
            # 14. Verifica resultado
            # =================================================

            if len(emotion_results) == 0:

                print(
                    "[gRPC] ⚠️ Modelo de emoção "
                    "não retornou resultado",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Neutro",
                    confianca=0.0
                )


            emotion_result = (
                emotion_results[0]
            )


            # =================================================
            # 15. Nenhuma emoção detectada
            # =================================================

            if (
                emotion_result.boxes is None
                or len(emotion_result.boxes) == 0
            ):

                print(
                    "[gRPC] ⚠️ Nenhuma emoção "
                    "detectada pelo YOLO",
                    flush=True
                )

                return analisador_pb2.FrameResponse(
                    emocao="Neutro",
                    confianca=0.0
                )


            # =================================================
            # 16. Seleciona a emoção com maior confiança
            # =================================================

            best_emotion_index = int(
                emotion_result.boxes.conf.argmax()
            )

            emotion_box = (
                emotion_result.boxes[
                    best_emotion_index
                ]
            )


            # =================================================
            # 17. Dados da emoção
            # =================================================

            class_id = int(
                emotion_box.cls.item()
            )

            emotion_confidence = float(
                emotion_box.conf.item()
            )

            emotion_label = (
                self.emotion_model.names[
                    class_id
                ]
            )


            # =================================================
            # 18. Resultado final
            # =================================================

            print(
                f"[gRPC] ✅ EMOÇÃO: "
                f"{emotion_label} "
                f"({emotion_confidence:.3f})",
                flush=True
            )


            print(
                f"[gRPC] 📊 Face conf: "
                f"{face_detection_conf:.3f} | "
                f"Emotion conf: "
                f"{emotion_confidence:.3f}",
                flush=True
            )


            return analisador_pb2.FrameResponse(
                emocao=emotion_label,
                confianca=emotion_confidence
            )


        except Exception as e:

            print(
                f"[gRPC] ❌ Erro no processamento: "
                f"{e}",
                flush=True
            )

            return analisador_pb2.FrameResponse(
                emocao="Erro",
                confianca=0.0
            )


    # ========================================================
    # Resumo consolidado
    # ========================================================

    def ObterResumoConsolidado(
        self,
        request,
        context
    ):

        return analisador_pb2.ResumoResponse(
            emocaoDominante="Neutro",
            picosAnsiedade=0,
            jsonGraficos="{}"
        )


# ============================================================
# Servidor gRPC
# ============================================================

def serve():

    server = grpc.server(
        futures.ThreadPoolExecutor(
            max_workers=10
        )
    )


    analisador_pb2_grpc.add_AnalisadorServiceServicer_to_server(
        AnalisadorService(),
        server
    )


    server.add_insecure_port(
        "[::]:50051"
    )


    server.start()


    print(
        "🚀 Servidor gRPC ativo na porta 50051",
        flush=True
    )

    print(
        "🧠 Pipeline:",
        flush=True
    )

    print(
        "   1. YOLO Face → detecta rosto",
        flush=True
    )

    print(
        "   2. Crop → recorta rosto",
        flush=True
    )

    print(
        "   3. YOLO Emotion → identifica emoção",
        flush=True
    )

    print(
        f"📁 Frames: {frames_dir}",
        flush=True
    )

    print(
        f"📁 Faces: {face_crops_dir}",
        flush=True
    )


    server.wait_for_termination()


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    serve()