// src/contexts/CardsContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';

type Periodo = 'manha' | 'tarde' | 'noite';

export interface CardEmocional {

  titulo: string;

  descricao: string;

  tipo: 'dica' | 'estatistica' | 'motivacao' | 'respiracao' | 'reflexao';
}

export interface CardsDoPeriodo {

  periodo: Periodo;

  cards: CardEmocional[];
}


interface CardsContextType {

  cardsAtuais: CardsDoPeriodo | null;

  setCardsAtuais: (cards: CardsDoPeriodo) => void;
}


const CardsContext = createContext<CardsContextType | null>(null);

interface Props {

  children: ReactNode;
}

const STORAGE_KEY = 'emocional_cards_periodo';

export function CardsProvider({ children }: Props) {

  const socket = useSocket();
  const [cardsAtuais, setCardsAtuaisState] = useState<CardsDoPeriodo | null>(null);

  // Restaurar do sessionStorage ao iniciar
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCardsAtuaisState(JSON.parse(saved));
      } catch { }
    }
  }, []);

  // Persistir sempre que mudar
  const setCardsAtuais = (cards: CardsDoPeriodo) => {

    setCardsAtuaisState(cards);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  };

  const getPeriodoAtual = (): Periodo => {

    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'manha';
    if (hora >= 12 && hora < 18) return 'tarde';
    return 'noite';
  };

  function mapTipo(title: string): CardEmocional['tipo'] {

    const t = title.toLowerCase();

    if (t.includes('dica')) return 'dica';
    if (t.includes('estat')) return 'estatistica';
    if (t.includes('motiv')) return 'motivacao';
    return 'reflexao';
  }

  // Escutar worker enviando cards prontos
  useEffect(() => {
    
    if (!socket) return;

    const handler = (payload: any) => {
      console.log('Recebido cards via socket:', payload);

      if (!payload || !payload.cards || !payload.cards.cards) return;

      const periodoAtual = getPeriodoAtual();

      // se backend não mandar período, usa o atual
      const periodoPayload: Periodo =
        payload.cards.periodo && payload.cards.periodo !== ''
          ? payload.cards.periodo
          : periodoAtual;

      // mapper backend → front
      const cardsMapeados: CardEmocional[] = payload.cards.cards.map((c: any) => ({
        titulo: c.title,
        descricao: c.content,
        tipo: mapTipo(c.title)
      }));

      setCardsAtuais({
        periodo: periodoPayload,
        cards: cardsMapeados
      });
    };


    socket.on('cards_gerados', handler);

    return () => {
      socket.off('cards_gerados', handler);
    };
  }, [socket]);

  return (
    <CardsContext.Provider value={{ cardsAtuais, setCardsAtuais }}>
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (!context) throw new Error('useCards deve ser usado dentro do CardsProvider');
  return context;
}
