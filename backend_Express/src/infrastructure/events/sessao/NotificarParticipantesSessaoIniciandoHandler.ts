// src/infrastructure/sessao/handlers/NotificarParticipantesSessaoIniciandoHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../domain/@shared/events/EventHandlerInterface';
import { SessaoIniciando } from '../../../domain/events/sessao/SessaoIniciando';
import { INotificacaoRepository } from '../../../domain/repositories/INotificacaoRepository';

export default class NotificarParticipantesSessaoIniciandoHandler implements EventHandlerInterface<SessaoIniciando> {
    constructor(
        private io: Server,
        private notificacaoRepo: INotificacaoRepository
    ) {}

    async handle(event: SessaoIniciando): Promise<void> {
    const { usuarios, mensagem, link, agendamentoId, horaInicio, nomePaciente, nomeProfissional } = event.eventData;
    

    console.log(`[SocketHandler] Notificando participantes da sessão ${agendamentoId}`);

    try {
        // Mapeia todas as promises
        const promises = usuarios.map(async (usuarioId) => {
            // Cria notificação
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: usuarioId,
                titulo: 'Sessão prestes a começar',
                mensagem: mensagem,
                tipo: 'SESSAO',
                lida: false,
                metadata: { link, agendamentoId, dataInicio: horaInicio, nomePaciente, nomeProfissional }
            });

            // Emite socket
            this.io.to(`usuario_${usuarioId}`).emit('sessao_iniciando', {
                agendamentoId,
                mensagem,
                link,
                tipo: 'ALERTA_SESSAO',
                notificacaoId: notificacao.id,
                horaInicio,
                nomePaciente,
                nomeProfissional
            });

            return { usuarioId, notificacaoId: notificacao.id };
        });

        // Executa todas em paralelo
        const resultados = await Promise.all(promises);
        
        console.log(`[SocketHandler] Notificações enviadas:`, resultados);
        
    } catch (error) {
        console.error("[SocketHandler] Erro:", error);
    }
}
}