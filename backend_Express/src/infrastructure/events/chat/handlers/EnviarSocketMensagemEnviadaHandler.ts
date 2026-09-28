// src/infrastructure/events/chat/handlers/EnviarSocketMensagemEnviadaHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { MensagemEnviada } from '../../../../domain/events/chat/MensagemEnviada';

export default class EnviarSocketMensagemEnviadaHandler implements EventHandlerInterface<MensagemEnviada> {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handle(event: MensagemEnviada): void {
        const { conversaId, mensagem, destinatarioId } = event.eventData;

        // O Handler traduz o Evento de Domínio para uma ação de Infraestrutura (Socket.io)
        this.io.to(`conversa_${conversaId}`).emit('nova_mensagem', mensagem);

        console.log("remetente:", mensagem.remetenteId);
        console.log("destinatario:", destinatarioId)

        
        this.io.to(`usuario_${destinatarioId}`).emit('nova_mensagem_chat', {
            id: mensagem.id,
            conversaId: conversaId,
            texto: mensagem.texto,
            remetenteId: mensagem.remetenteId,
        });

        console.log(
            `[Socket.io] 💬 Mensagem ${mensagem.id} enviada via evento de domínio para sala conversa_${conversaId}`
        );
    }
}