// src/infrastructure/handlers/analysis/PersistirRelatorioSessaoHandler.ts

import { EventHandlerInterface } from "../../../../domain/@shared/events/EventHandlerInterface";
import { RelatorioSessaoGerado } from "../../../../domain/events/analysis/RelatorioSessaoGerado";
import { ISessionReportRepository } from "../../../../domain/repositories/ISessionReportRepository";
import { SessionReportEntity } from "../../../../domain/entities/SessionReportEntity";
import { Server } from "socket.io";
import { INotificacaoRepository } from "../../../../domain/repositories/INotificacaoRepository";
import { ISessaoRepository } from "../../../../domain/repositories/ISessaoRepository";

export default class PersistirRelatorioSessaoHandler implements EventHandlerInterface<RelatorioSessaoGerado> {
    constructor(private sessionReportRepo: ISessionReportRepository,
        private io: Server,
        private notificacaoRepo: INotificacaoRepository,
        private sessaoRepo: ISessaoRepository) { }

    async handle(event: RelatorioSessaoGerado): Promise<void> {
        const { sessaoId, pacienteId, profissionalId, summary } = event.eventData;

        console.log(`[PersistirRelatorioHandler] Criando entidade de relatório para sessão ${sessaoId}`);


        try {
            const reportEntity = new SessionReportEntity({
                session_id: sessaoId,
                paciente_id: pacienteId,
                profissional_id: profissionalId,
                summary: summary,
            });

            await this.sessionReportRepo.criar(reportEntity);

            console.log(`[PersistirRelatorioHandler] Relatório persistido com sucesso.`);

            const dados = await this.sessaoRepo.buscarDadosParaNotificacaoRelatorio(sessaoId);

            if(!dados){
                console.warn(`[PersistirRelatorioHandler] Dados não encontrados para a sessão ${sessaoId}`);
                return;
            }
            const dataFormatada = new Intl.DateTimeFormat('pt-BR').format(new Date(dados.dataInicio));
            const notificacao = await this.notificacaoRepo.criar({
                usuario_id: profissionalId,
                titulo: 'Relatório da sessão está disponível',
                mensagem: `O relatório da sessão de ${dados.codinome} do dia ${dataFormatada} está disponível`,
                tipo: 'RELATORIO',
                lida: false,
                metadata: {
                    sessaoId: sessaoId,
                    
                }
            });

            // Emite socket
            this.io.to(`usuario_${profissionalId}`).emit('nova_notificacao', {
                sessaoId,
                tipo: 'RELATORIO',
                notificacaoId: notificacao.id
            });
        } catch (error) {
            console.error(`[PersistirRelatorioHandler] Erro ao salvar relatório:`, error);

        }
    }
}