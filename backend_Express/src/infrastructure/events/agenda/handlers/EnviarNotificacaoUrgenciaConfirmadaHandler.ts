// src/infrastructure/events/agenda/handlers/EnviarNotificacaoUrgenciaConfirmadaHandler.ts

import { Server, Namespace } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { UrgenciaConfirmada } from '../../../../domain/events/agenda/UrgenciaConfirmada';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoUrgenciaConfirmadaHandler implements EventHandlerInterface<UrgenciaConfirmada> {
    constructor(private io: Server | Namespace, private notificacaoRepo: INotificacaoRepository) {}

    async handle(event: UrgenciaConfirmada): Promise<void> {
        const { eventData } = event;

        try {
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: eventData.usuarioId,
                titulo: 'Solicitação de Urgência Aprovada!',
                mensagem: `Sua urgência para o profissional ${eventData.profissionalNome} foi aprovada.`,
                tipo: 'AGENDA',
                lida: false,
                metadata: { urgenciaId: eventData.urgenciaId }
            });

            this.io.to(`usuario_${eventData.usuarioId}`).emit('nova_notificacao', notificacao);
        } catch (error) {
            console.error("Erro no Handler de Urgência:", error);
        }
    }
}