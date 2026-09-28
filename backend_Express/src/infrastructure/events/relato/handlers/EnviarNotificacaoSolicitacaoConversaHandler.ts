// src/infrastructure/events/relato/handlers/EnviarNotificacaoSolicitacaoConversaHandler.ts
import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { SolicitacaoConversaRecebida } from '../../../../domain/events/relato/SolicitacaoConversaRecebida';
import { INotificacaoRepository } from '../../../../domain/repositories/INotificacaoRepository';

export default class EnviarNotificacaoSolicitacaoConversaHandler implements EventHandlerInterface<SolicitacaoConversaRecebida> {
    constructor(
        private io: Server,
        private notificacaoRepo: INotificacaoRepository
    ) {}

    async handle(event: SolicitacaoConversaRecebida): Promise<void> {
        const { eventData } = event;
        try {
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: eventData.pacienteId,
                titulo: 'Nova Solicitação de Conversa',
                mensagem: `${eventData.nomeProfissional} quer conversar sobre o relato: "${eventData.tituloRelato}"`,
                tipo: 'SOLICITACAO_VINCULO',
                lida: false,
                metadata: { 
                    relatoId: eventData.relatoId, 
                    profissionalId: eventData.profissionalId 
                }
            });

            this.io.to(`usuario_${eventData.pacienteId}`).emit('nova_notificacao', notificacao);
        } catch (error) {
            console.error("Erro no Handler de SolicitacaoConversa:", error);
        }
    }
}