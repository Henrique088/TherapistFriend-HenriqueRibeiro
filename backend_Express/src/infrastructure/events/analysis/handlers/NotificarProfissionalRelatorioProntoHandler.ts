// src/infrastructure/analysis/handlers/NotificarProfissionalRelatorioProntoHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { RelatorioSessaoFinalizado } from '../../../../domain/events/analysis/RelatorioSessaoFinalizado';

export default class NotificarProfissionalRelatorioProntoHandler implements EventHandlerInterface<RelatorioSessaoFinalizado> {
    constructor(private io: Server) {}

    async handle(event: RelatorioSessaoFinalizado): Promise<void> {
        const { sessaoId, profissionalId, dadosConsolidados } = event.eventData;

        console.log(`[SocketHandler] Notificando profissional ${profissionalId} sobre relatório da sessão ${sessaoId}`);

        // Emite apenas para a "room" privada do profissional
        this.io.to(`usuario_${profissionalId}`).emit('relatorio_finalizado', {
            sessaoId,
            mensagem: 'A análise da sessão foi concluída e o relatório está disponível.',
            resumo: {
                emocaoDominante: dadosConsolidados.emocaoDominante,
                picosAnsiedade: dadosConsolidados.picosDeAnsiedade
            }
        });
    }
}