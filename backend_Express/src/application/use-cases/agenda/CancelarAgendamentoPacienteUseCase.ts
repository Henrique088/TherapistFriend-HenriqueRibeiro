// src/application/use-cases/agenda/CancelarAgendamentoPacienteUseCase.ts

import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { AgendamentoCancelado } from '../../../domain/events/agenda/AgendamentoCancelado';
import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import AppError from '../../errors/AppError';

export class CancelarAgendamentoPacienteUseCase {
    constructor(private agendamentoRepository: IAgendamentoRepository,
        private eventDispatcher: EventDispatcherInterface
    ) {}

    async execute(agendamentoId: number): Promise<void> {
        const agendamento = await this.agendamentoRepository.buscarPorId(agendamentoId);

        if (!agendamento) {
            throw new AppError("Agendamento não encontrado.");
        }

        // A regra das 24h é executada dentro da Entity para garantir o encapsulamento
        agendamento.cancelarPeloPaciente(24); 

        // Dispara o evento de cancelamento

        const agendamentoCanceladoEvent = new AgendamentoCancelado({
            agendamentoId: agendamento.id,
            pacienteId: agendamento.pacienteId,
            profissionalId: agendamento.profissionalId,
            dataInicio: agendamento.dataInicio,
            canceladoPor: 'paciente'
           
        });
        
        this.eventDispatcher.notify(agendamentoCanceladoEvent);

        await this.agendamentoRepository.atualizar(agendamento);
    }
}