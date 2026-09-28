// src/infrastructure/agenda/events/handlers/EnviarNotificacaoRespostaAgendamentoHandler.ts

import { Server, Namespace } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { AgendamentoRespondido } from '../../../../domain/events/agenda/AgendamentoRespondido';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoRespostaAgendamentoHandler implements EventHandlerInterface<AgendamentoRespondido> {
    constructor(
        private io: Server | Namespace,
        private notificacaoRepo: INotificacaoRepository
    ) {}

    async handle(event: AgendamentoRespondido): Promise<void> {
        const { eventData } = event;

        try {
            
            const statusTraduzido = eventData.status === 'confirmado' ? 'confirmou' : 'recusou';

            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: eventData.pacienteId,
                titulo: `Agendamento ${eventData.status}`,
                mensagem: `O profissional ${eventData.nome} ${statusTraduzido} sua solicitação.`,
                tipo: 'AGENDA',
                lida: false,
                metadata: {
                    agendamentoId: eventData.agendamentoId,
                    status: eventData.status,
                    dataInicio: eventData.dataInicio.toISOString(),
                    dataFinal: eventData.dataFinal.toISOString()
                }
            });

            this.io.to(`usuario_${eventData.pacienteId}`).emit('nova_notificacao', notificacao);

            console.log(`[Agenda] Notificação de resposta enviada para o usuário ${eventData.pacienteId}`);

        } catch (error) {
            console.error("Erro ao processar Handler de AgendamentoRespondido:", error);
        }
    }
}