// src/infrastructure/container/eventContainer.ts

import { Server } from 'socket.io';
import EventDispatcher from '../../domain/@shared/events/EventDispatcher';
import EnviarSocketMensagemEnviadaHandler from '../events/chat/handlers/EnviarSocketMensagemEnviadaHandler';
import EnviarSocketMensagemEditadaHandler from '../events/chat/handlers/EnviarSocketMensagemEditadaHandler';
import EnviarSocketMensagemDeletadaHandler from '../events/chat/handlers/EnviarSocketMensagemDeletadaHandler';
import EnviarSocketMensagensLidasHandler from '../events/chat/handlers/EnviarSocketMensagensLidasHandler';

import EnviarNotificacaoAgendamentoHandler from '../events/agenda/handlers/EnviarNotificacaoAgendamentoHandler';
import EnviarNotificacaoRespostaAgendamentoHandler from '../events/agenda/handlers/EnviarNotificacaoRespostaAgendamentoHandler';

import { notificacaoRepository, redisAnalysisRepository, sessaoRepository, sessionReportRepository } from './repositoryContainer';
import EnviarNotificacaoCancelamentoHandler from '../events/agenda/handlers/EnviarNotificacaoCancelamentoHandler';
import EnviarNotificacaoUrgenciaConfirmadaHandler from '../events/agenda/handlers/EnviarNotificacaoUrgenciaConfirmadaHandler';

import EnviarNotificacaoSolicitacaoConversaHandler from '../events/relato/handlers/EnviarNotificacaoSolicitacaoConversaHandler';
import EnviarNotificacaoVinculoConfirmadoHandler from '../events/relato/handlers/EnviarNotificacaoVinculoConfirmadoHandler';

import EnviarCardsViaSocketHandler from '../events/ia/handlers/EnviarCardsViaSocketHandler';
import { setupQueueListeners } from '../events/QueueListeners';
import PersistirRelatorioSessaoHandler from '../events/analysis/handlers/PersistirRelatorioSessaoHandler';
// import SalvarRelatorioSessaoHandler from '../events/analysis/handlers/SalvarRelatorioSessaoHandler';
import NotificarProfissionalRelatorioProntoHandler from '../events/analysis/handlers/NotificarProfissionalRelatorioProntoHandler';

import NotificarParticipantesSessaoIniciandoHandler from '../events/sessao/NotificarParticipantesSessaoIniciandoHandler';
import { setupSessaoQueueListeners } from '../events/QueueListenersSessao';

import PersistirFrameNoRedisHandler from '../events/analysis/handlers/PersistirFrameNoRedisHandler';
import { setupRelatorioQueueListeners } from '../events/QueueRelatorioSessao';
import { ParticipantOnlineHandler } from '../events/sessao/ParticipantOnlineHandler';
import { ParticipantOfflineHandler } from '../events/sessao/ParticipantOfflineHandler';
import { SessionTimeoutHandler } from '../events/sessao/SessionTimeoutHandler';
import { SessionFinishedHandler } from '../events/sessao/SessionFinishedHandler';
import { bullMQService } from './bullMQContainer';
import { getSignalingService } from './signalingContainer';
import { registerSchedulers } from '../queue/registerSchedulers';
import { EncerrarSessaoUseCase } from '../../application/use-cases/sessao/EncerrarSessaoUseCase';

interface DomainEventDependencies {

    encerrarSessaoUseCase: EncerrarSessaoUseCase;

}
// Exporta a instância única (Singleton)
export const eventDispatcher = new EventDispatcher();

/**
 * Função para acoplar a infraestrutura (Socket.io) aos handlers.
 * Registra os handlers de eventos de domínio para que eles possam reagir aos eventos emitidos.
 */
export const setupDomainEvents = (io: Server, deps: DomainEventDependencies): void => {
    // Registra os handlers 
    const enviarSocketHandler = new EnviarSocketMensagemEnviadaHandler(io);
    const editarSocketHandler = new EnviarSocketMensagemEditadaHandler(io);
    const deletarSocketHandler = new EnviarSocketMensagemDeletadaHandler(io);
    const mensagensLidasHandler = new EnviarSocketMensagensLidasHandler(io);

    eventDispatcher.register("MensagemEnviada", enviarSocketHandler);
    eventDispatcher.register("MensagemEditada", editarSocketHandler);
    eventDispatcher.register("MensagemDeletada", deletarSocketHandler);
    eventDispatcher.register("MensagensLidas", mensagensLidasHandler);

    // Handlers de Agenda
    const enviarNotificacaoAgendamentoHandler = new EnviarNotificacaoAgendamentoHandler(io, notificacaoRepository);
    const enviarNotificacaoRespostaAgendamentoHandler = new EnviarNotificacaoRespostaAgendamentoHandler(io, notificacaoRepository);
    const enviarNotificacaoCancelamentoHandler = new EnviarNotificacaoCancelamentoHandler(io, notificacaoRepository);
    const enviarNotificacaoUrgenciaConfirmadaHandler = new EnviarNotificacaoUrgenciaConfirmadaHandler(io, notificacaoRepository);

    eventDispatcher.register("AgendamentoSolicitado", enviarNotificacaoAgendamentoHandler);
    eventDispatcher.register("AgendamentoRespondido", enviarNotificacaoRespostaAgendamentoHandler);
    eventDispatcher.register("AgendamentoCancelado", enviarNotificacaoCancelamentoHandler);
    eventDispatcher.register("UrgenciaConfirmada", enviarNotificacaoUrgenciaConfirmadaHandler);


    // Handlers de Relato
    const enviarNotificacaoSolicitacaoConversaHandler = new EnviarNotificacaoSolicitacaoConversaHandler(io, notificacaoRepository);
    const enviarNotificacaoVinculoConfirmadoHandler = new EnviarNotificacaoVinculoConfirmadoHandler(io, notificacaoRepository);

    eventDispatcher.register("SolicitacaoConversaRecebida", enviarNotificacaoSolicitacaoConversaHandler);
    eventDispatcher.register("VinculoRelatoConfirmado", enviarNotificacaoVinculoConfirmadoHandler);


    // Handlers de IA
    const enviarCardsViaSocketHandler = new EnviarCardsViaSocketHandler(io);
    eventDispatcher.register("CardsIAGerados", enviarCardsViaSocketHandler);

    // Configura os listeners de fila, passando o eventDispatcher para que possam disparar eventos de domínio
    setupQueueListeners(eventDispatcher);

    setupSessaoQueueListeners(eventDispatcher);

    setupRelatorioQueueListeners(eventDispatcher);


    // Handler de Persistência (Banco)
    eventDispatcher.register("RelatorioSessaoFinalizado", new PersistirRelatorioSessaoHandler(sessionReportRepository, io, notificacaoRepository,sessaoRepository));
    // eventDispatcher.register("RelatorioSessaoFinalizado",new SalvarRelatorioSessaoHandler(sessaoRepository));

    // Handler de Notificação (Socket)
    eventDispatcher.register("RelatorioSessaoFinalizado",new NotificarProfissionalRelatorioProntoHandler(io));


    // Handler de Notificação 
    eventDispatcher.register("SessaoIniciando", new NotificarParticipantesSessaoIniciandoHandler(io, notificacaoRepository));

    // Handler de persistencia no redis
    eventDispatcher.register("FrameAnalisadoIA", new PersistirFrameNoRedisHandler(redisAnalysisRepository));

    // const nsp = io.of('/sessao-signaling');

    eventDispatcher.register("RelatorioSessaoGerado", new PersistirRelatorioSessaoHandler(sessionReportRepository, io, notificacaoRepository, sessaoRepository));
    eventDispatcher.register("ParticipantOnline", new ParticipantOnlineHandler(getSignalingService()));
    eventDispatcher.register("ParticipantOffline", new ParticipantOfflineHandler(getSignalingService()));
    eventDispatcher.register("SessionTimeout", new SessionTimeoutHandler(getSignalingService(), deps.encerrarSessaoUseCase));
    eventDispatcher.register("SessionFinished", new SessionFinishedHandler(bullMQService, getSignalingService()));
    


registerSchedulers(bullMQService);


};