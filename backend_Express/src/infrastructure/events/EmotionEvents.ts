// src/infrastructure/events/EmotionEvents.ts


import { EventEmitter } from 'events';

export const emotionEvents = new EventEmitter();

export const EMOTION_EVENT_TYPES = {
    EMOTION_PROCESSADA: 'EMOTION_PROCESSADA',
    SESSAO_FINALIZADA: 'SESSAO_FINALIZADA'
};