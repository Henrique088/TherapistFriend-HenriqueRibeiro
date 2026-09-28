// src/infrastructure/queue/workers/index.ts

import { setupIAWorker } from './IAWorker';
import { setupEmailWorker } from './EmailWorker';
import { setupSmsWorker } from './SmsWorker';
import { setupSessaoWorker } from './SessaoWorker';

import { NodemailerEmailProvider } from '../../services/NodemailerEmailProvider';
import { TwilioSmsProvider } from '../../services/TwilioSmsProvider';
import { AnalisarGravidade } from '../../services/IAAnalisarGravidade';
import { redisAnalysisRepository, relatoRepository, sessaoRepository } from '../../container/repositoryContainer';
import { IACardsFlaskService } from '../../services/IACardsFlaskService';

import { eventDispatcher } from '../../container/eventContainer';
import { setupConsolidarAnaliseWorker } from './ConsolidarAnaliseWorker';
import { setupDisconnectTimeoutWorker } from './DisconnectTimeoutWorker';

import { disconnectTimeoutUseCase, verificarTimeoutSessaoUseCase } from '../../container/useCaseContainer';

export function registerAllWorkers() {
   
    const emailProvider = new NodemailerEmailProvider();
    const smsProvider = new TwilioSmsProvider();
    const analisarGravidade = new AnalisarGravidade(relatoRepository);
    const iaCardsFlaskService = new IACardsFlaskService;
    // const sessionReportService = new SessionReportService(sessionReportRepository, sessionRepository);
    // const analisadorGrpcClient = new AnalisadorGrpcClient();
    



    // Inicializa  Workers
    setupIAWorker(analisarGravidade, iaCardsFlaskService);
    setupEmailWorker(emailProvider);
    setupSmsWorker(smsProvider);
    // setupSessionReportWorker(sessionReportService);
    setupConsolidarAnaliseWorker(eventDispatcher, redisAnalysisRepository);
    setupSessaoWorker();
    setupDisconnectTimeoutWorker(disconnectTimeoutUseCase);
    // new SessionMonitorWorker(verificarTimeoutSessaoUseCase);
    
    console.log('👷 Todos os workers (IA, Email, SMS, SessionReport) foram inicializados.');
}