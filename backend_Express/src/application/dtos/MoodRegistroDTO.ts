// src/application/dtos/MoodRegistro.ts

export interface RegistrarMoodDTO {
  usuarioId: number;
  mood: "ansiedade" | "tristeza" | "raiva" | "medo" | "felicidade" | "neutral";
  intensidade: number;
}

