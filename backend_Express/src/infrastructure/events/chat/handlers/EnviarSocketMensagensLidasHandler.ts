// src/infrastructure/events/chat/handlers/EnviarSocketMensagensLidasHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { MensagensLidas } from '../../../../domain/events/chat/MensagensLidas';

export default class EnviarSocketMensagensLidasHandler implements EventHandlerInterface<MensagensLidas> {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handle(event: MensagensLidas): void {
        const { conversaId, mensagemIds, lidoPor } = event.eventData;

        // Notifica a sala que as mensagens específicas foram lidas
        this.io.to(`conversa_${conversaId}`).emit('mensagens_lidas', { 
            conversaId, 
            mensagemIds, 
            lidoPor 
        });

        console.log(`[Socket.io] ✅ ${mensagemIds.length} mensagens lidas na sala conversa_${conversaId}`);
    }
}