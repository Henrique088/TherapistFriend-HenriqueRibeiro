// src/infrastructure/chat/events/handlers/EnviarSocketMensagemEditadaHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { MensagemEditada } from '../../../../domain/events/chat/MensagemEditada';

export default class EnviarSocketMensagemEditadaHandler implements EventHandlerInterface<MensagemEditada> {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handle(event: MensagemEditada): void {
        const { conversaId, mensagemId, novoTexto } = event.eventData;

        this.io.to(`conversa_${conversaId}`).emit('edicao_mensagem', { 
            mensagemId, 
            novoTexto 
        });

        console.log(`[Socket.io] ✏️ Mensagem ${mensagemId} editada na sala conversa_${conversaId}`);
    }
}