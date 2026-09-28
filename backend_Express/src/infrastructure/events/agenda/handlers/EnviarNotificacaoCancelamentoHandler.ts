// src/infrastructure/events/agenda/handlers/EnviarNotificacaoCancelamentoHandler.ts

import { Server, Namespace } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { AgendamentoCancelado } from '../../../../domain/events/agenda/AgendamentoCancelado';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoCancelamentoHandler implements EventHandlerInterface<AgendamentoCancelado> {
    constructor(private io: Server | Namespace, private notificacaoRepo: INotificacaoRepository) {}

    async handle(event: AgendamentoCancelado): Promise<void> {
        const { eventData } = event;
        // Lógica: Se o paciente cancelou, o destino é o profissional, e vice-versa.
        const destinoId = eventData.canceladoPor === 'paciente' ? eventData.profissionalId : eventData.pacienteId;

        try {
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: destinoId,
                titulo: 'Agendamento Cancelado',
                mensagem: `O agendamento do dia ${eventData.dataInicio.toLocaleDateString()} foi cancelado pelo ${eventData.canceladoPor}.`,
                tipo: 'AGENDA',
                lida: false,
                metadata: { agendamentoId: eventData.agendamentoId }
            });

            this.io.to(`usuario_${destinoId}`).emit('nova_notificacao', notificacao);
        } catch (error) {
            console.error("Erro no Handler de Cancelamento:", error);
        }
    }
}