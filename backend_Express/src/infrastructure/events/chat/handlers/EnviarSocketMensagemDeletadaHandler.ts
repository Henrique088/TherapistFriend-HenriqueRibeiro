// src/infrastructure/events/chat/handlers/EnviarSocketMensagemDeletadaHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { MensagemDeletada } from '../../../../domain/events/chat/MensagemDeletada';

export default class EnviarSocketMensagemDeletadaHandler implements EventHandlerInterface<MensagemDeletada> {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handle(event: MensagemDeletada): void {
        const { conversaId, mensagemId, remetenteId, destinatarioId, lida } = event.eventData;

        const payload = {
            mensagemId,
            conversaId,
            remetenteId,
            destinatarioId,
            lida
        };

        // Atualiza quem está visualizando a conversa.
        this.io.to(`conversa_${conversaId}`).emit('excluir_mensagem', payload);

        // Atualiza o contador mesmo que o usuário não esteja dentro da conversa.
        this.io.to(`usuario_${destinatarioId}`).emit('excluir_mensagem', payload);

        console.log(`[Socket.io] 🗑️ Mensagem ${mensagemId} removida da sala conversa_${conversaId}`);
    }
}

