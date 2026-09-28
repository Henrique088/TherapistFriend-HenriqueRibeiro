// src/application/usecases/mood/RegistrarMoodUseCase.ts

import { MoodRegistroEntity } from "../../../domain/entities/MoodRegistroEntity";
import { IMoodRegistroRepository } from "../../../domain/repositories/IMoodRegistroRepository";
import { RegistrarMoodDTO } from "../../dtos/MoodRegistroDTO";
import AppError from "../../errors/AppError";
import { IQueueService } from "../../services/IQueueService";

export class RegistrarMoodUseCase {
  constructor(
    private moodRepository: IMoodRegistroRepository,
    private config: { moodCooldownMinutes: number },
    private queueService: IQueueService

  ) {}

  async execute(dto: RegistrarMoodDTO): Promise<MoodRegistroEntity> {
    const { usuarioId, mood, intensidade } = dto;

    // cria entity automaticamente (já calcula período)
    const novoRegistro = MoodRegistroEntity.criarAutomatico(
      usuarioId,
      mood,
      intensidade
    );

    const periodo = novoRegistro.periodo;
    const hoje = novoRegistro.data_referencia;

    // verifica se já existe registro nesse período
    const registroExistente =
      await this.moodRepository.buscarDoPeriodo(usuarioId, hoje, periodo);

    // se não existir → cria
    if (!registroExistente) {
      await this.moodRepository.criar(novoRegistro);

      try {
      console.log('Adicionando job para gerar cards com os dados do mood registrado...');
      await this.queueService.addJob(
        'ia-analise-geracao', // Nome da Fila (Queue)
        'gerar-cards', // Nome do Job (Ação específica)
        { usuarioId,mood: novoRegistro.mood, intensidade: novoRegistro.intensidade, periodo: novoRegistro.periodo }
      );
    } catch (error) {
      // Log de erro, mas não interrompe o fluxo
      console.error('Erro ao adicionar job na fila de IA:', error);
    }
      return novoRegistro;
    }

    // existe → aplicar regra de cooldown
    const cooldownMs = this.config.moodCooldownMinutes * 60 * 1000; 
    const agora = new Date();

    const ultimaAtualizacao = registroExistente.toJSON().atualizado_em;

    if (ultimaAtualizacao) {
      const diff = agora.getTime() - new Date(ultimaAtualizacao).getTime();

      if (diff < cooldownMs) {
        throw new AppError(
          "Você já registrou seu estado recentemente. Aguarde alguns minutos para atualizar novamente."
        );
      }
    }

    // passou cooldown → substitui
    registroExistente.atualizarMood(mood, intensidade);

    await this.moodRepository.atualizar(registroExistente);


    try {
      console.log('Adicionando job para gerar cards com os dados do mood registrado...');
      await this.queueService.addJob(
        'ia-analise-geracao', // Nome da Fila (Queue)
        'gerar-cards', // Nome do Job (Ação específica)
        { usuarioId,mood: registroExistente.mood, intensidade: registroExistente.intensidade, periodo: registroExistente.periodo }
      );
    } catch (error) {
      // Log de erro, mas não interrompe o fluxo
      console.error('Erro ao adicionar job na fila de IA:', error);
    }


    return registroExistente;
  }
}

