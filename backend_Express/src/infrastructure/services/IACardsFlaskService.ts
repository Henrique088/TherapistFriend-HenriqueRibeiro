// src/infrastructure/services/IACardsFlaskService.ts

import axios from "axios";
import { IIACardsService } from "../../domain/services/IIACardsService";


interface inputMod {
  usuarioId: number;
  mood: string;
  intensidade: number;
  periodo: string;
}

export class IACardsFlaskService implements IIACardsService {

  async gerarCardsMood({ usuarioId, mood, intensidade, periodo }: inputMod) {

    const response = await axios.get(
      `${process.env.IA_SERVICE_URL}/cards-dashboard`,

      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        params: {
          mood,
          intensidade,
          periodo
        }
      }
    );

    // console.log(`[IACardsFlaskService] Cards gerados para usuário ${usuarioId}:`, response.data);

    return {
      jobType: 'gerar-cards',
      usuarioId,
      cards: response.data
    };
  }
}
