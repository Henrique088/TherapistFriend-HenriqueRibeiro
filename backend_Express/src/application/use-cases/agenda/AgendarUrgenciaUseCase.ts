//src/application/use-cases/agenda/AgendarUrgenciaUseCase.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import AppError from '../../errors/AppError';

interface AgendarUrgenciaInput {
    urgenciaId: number;
    profissionalId: number;
    dataInicio: Date;
    dataFim: Date;
}

export class AgendarUrgenciaUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository,
        private urgenciaRepository: IUrgenciaRepository
    ) {}

    async execute(dados: AgendarUrgenciaInput): Promise<AgendamentoEntity> {
        // Valida se a urgência existe e está apta para agendamento
        const urgencia = await this.urgenciaRepository.buscarPorId(dados.urgenciaId);

        if (!urgencia) {
            throw new AppError("Solicitação de urgência não encontrada.", 404);
        }

        if (urgencia.status !== 'aprovada_aguardando_vaga') {
            throw new AppError("Esta urgência não está aprovada para agendamento.", 400);
        }

        if (urgencia.profissionalId !== dados.profissionalId) {
            throw new AppError("Você não tem permissão para agendar esta urgência.", 403);
        }

        // Cria a entidade de Agendamento (marcada como tipo 'urgencia')
        const novoAgendamento = new AgendamentoEntity({
            pacienteId: urgencia.pacienteId,
            profissionalId: urgencia.profissionalId,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim,
            status: 'confirmado', // Urgências já entram confirmadas pelo profissional
            tipo: 'urgencia',
            observacoes: `Agendamento de urgência: ${urgencia.motivo}`
        });

        // Concluir a Urgência (regra de negócio na entidade)
        urgencia.concluir();

        // Persistência
        const agendamentoSalvo = await this.agendamentoRepository.criar(novoAgendamento);
        await this.urgenciaRepository.atualizar(urgencia);

        return agendamentoSalvo;
    }
}