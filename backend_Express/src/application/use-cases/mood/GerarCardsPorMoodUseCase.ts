// src/application/use-cases/mood/GerarCardsPorMoodUseCase.ts

import { IMoodRegistroRepository } from "../../../domain/repositories/IMoodRegistroRepository";
import { IQueueService } from "../../services/IQueueService";


export class GerarCardsPorMoodUseCase {

  constructor(
    private moodRepository: IMoodRegistroRepository,
    private queueService: IQueueService
  ) { }

  async execute(usuarioId: number) {

    // pega registro mais recente do dia
    const registro = await this.moodRepository.buscarUltimoDoDia(usuarioId);

    if (!registro) {
      // cards genéricos para quem não registrou mood
      try {
        await this.queueService.addJob(
          'ia-analise-geracao', // Nome da Fila (Queue)
          'gerar-cards', // Nome do Job (Ação específica)
          { usuarioId, mood: null, intensidade: null, periodo: null }
        );
      } catch (error) {
        // Log de erro, mas não interrompe o fluxo
        console.error('Erro ao adicionar job na fila de IA:', error);
      }
    } else{
      try {
      await this.queueService.addJob(
        'ia-analise-geracao', // Nome da Fila (Queue)
        'gerar-cards', // Nome do Job (Ação específica)
        { usuarioId ,mood: registro.mood, intensidade: registro.intensidade, periodo: registro.periodo }
      );
    } catch (error) {
      // Log de erro, mas não interrompe o fluxo
      console.error('Erro ao adicionar job na fila de IA:', error);
    }
    }

  
  }
}
