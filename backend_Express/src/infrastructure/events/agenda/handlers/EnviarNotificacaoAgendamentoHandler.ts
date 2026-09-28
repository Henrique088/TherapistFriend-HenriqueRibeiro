// src/infrastructure/events/agenda/handlers/EnviarNotificacaoAgendamentoHandler.ts

import { Server, Namespace } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { AgendamentoSolicitado } from '../../../../domain/events/agenda/AgendamentoSolicitado';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoAgendamentoHandler implements EventHandlerInterface<AgendamentoSolicitado> {
    constructor(
        private io: Server | Namespace,
        private notificacaoRepo: INotificacaoRepository
    ) {}

    async handle(event: AgendamentoSolicitado): Promise<void> {
        const { eventData } = event;

        try {
      
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: eventData.profissionalId,
                titulo: 'Nova Solicitação de Agendamento',
                mensagem: `O paciente ${eventData.codinome} solicitou um horário.`,
                tipo: 'AGENDA',
                lida: false,
                metadata: {
                    agendamentoId: eventData.agendamentoId,
                    pacienteId: eventData.pacienteId,
                    dataInicio: eventData.dataInicio.toISOString()
                }
            });

           
            this.io.to(`usuario_${eventData.profissionalId}`).emit('nova_notificacao', notificacao);

        } catch (error) {
            console.error("Erro ao processar Handler de AgendamentoSolicitado:", error);
        }
    }
}