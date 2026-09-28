// src/application/use-cases/agenda/SolicitarUrgenciaUseCase.ts

import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';
import { SolicitarUrgenciaDTO } from '../../dtos/UrgenciaDTO';


export class SolicitarUrgenciaUseCase {
    constructor(private urgenciaRepository: IUrgenciaRepository) {}

    async execute(dados: SolicitarUrgenciaDTO): Promise<UrgenciaEntity> {
        // Verifica se já existe uma solicitação ativa (evita duplicidade)
        const solicitacaoExistente = await this.urgenciaRepository.buscarAtivaPorPaciente(
            dados.pacienteId, 
            dados.profissionalId
        );

        if (solicitacaoExistente) {
            // chama a função do dominio para verificar se existe uma urgência pedente ou ativa
            solicitacaoExistente.verificar();
        }

        // Criar a nova entidade de urgência
        const novaUrgencia = new UrgenciaEntity({
            pacienteId: dados.pacienteId,
            profissionalId: dados.profissionalId,
            motivo: dados.motivo,
            janelaDeTempo: dados.janelaDeTempo,
            status: 'pendente_aprovacao'
        });

        // Persistir no banco
        return await this.urgenciaRepository.criar(novaUrgencia);
    }
}