// src/Components/Video/EmotionBadge.tsx

import React from 'react';
import styles from './EmotionBadge.module.css';

interface EmotionData {
  emocao: string;
  confianca: number;
}

interface EmotionBadgeProps {
  data: EmotionData | null | undefined;
}

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  data,
}) => {
  if (!data) {
    return null;
  }

  const confianca = Math.min(
    100,
    Math.max(0, Number(data.confianca) * 100)
  );

  const emotionClassMap: Record<string, string> = {
    Felicidade: styles.felicidade,
    Tristeza: styles.tristeza,
    Raiva: styles.raiva,
    Neutro: styles.neutro,
    Surpresa: styles.surpresa,
    Nojo: styles.nojo,
    Medo: styles.medo,
  };

  const emotionClass =
    emotionClassMap[data.emocao] || styles.defaultEmotion;

  return (
    <div
      className={`${styles.badge} ${emotionClass}`}
      role="status"
      aria-label={`Emoção detectada: ${data.emocao}, confiança de ${confianca.toFixed(0)} por cento`}
    >
      <span
        className={styles.indicator}
        aria-hidden="true"
      />

      <span className={styles.emotion}>
        {data.emocao}
      </span>

      <span className={styles.confidence}>
        {confianca.toFixed(0)}%
      </span>
    </div>
  );
};