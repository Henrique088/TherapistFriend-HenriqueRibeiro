// src/infrastructure/events/index.ts

import { Server } from 'socket.io';


export function registerAllEvents(io: Server) {
    console.log('[registerAllEvents] Iniciando registro de eventos...');
    
    // setupRelatoListeners(io, notificacaoRepo);
    
    // setupChatListeners(io);
   
    // setupAgendaListeners(io, notificacaoRepo);
    
    // setupCardsListeners(io);
    
    // setupQueueListeners();
    console.log('[registerAllEvents] Todos os eventos registrados');
}