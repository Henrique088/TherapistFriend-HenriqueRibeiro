// // src/infrastructure/analysis/handlers/SalvarRelatorioSessaoHandler.ts

// import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
// import { RelatorioSessaoFinalizado } from '../../../../domain/events//analysis/RelatorioSessaoFinalizado';
// import { ISessaoRepository } from '../../../../domain/repositories/ISessaoRepository';

// export default class SalvarRelatorioSessaoHandler implements EventHandlerInterface<RelatorioSessaoFinalizado> {
//     constructor(private sessaoRepo: ISessaoRepository) {}

//     async handle(event: RelatorioSessaoFinalizado): Promise<void> {
//         const { sessaoId, dadosConsolidados } = event.eventData;

//         try {
//             console.log(`[Handler] Salvando análise final da sessão ${sessaoId} no banco de dados.`);

//             // Persistência usando o repositório especializado
//             await this.sessaoRepo.salvarAnaliseFinal(sessaoId, dadosConsolidados);

//             console.log(`[Handler] Análise da sessão ${sessaoId} salva com sucesso.`);
//         } catch (error) {
//             // Como este é um processo de background, o log é vital
//             console.error(`[Critical] Falha ao salvar relatório da sessão ${sessaoId}:`, error);
            
//             // Em uma arquitetura mais madura, aqui você poderia disparar um 
//             // alerta para um sistema de monitoramento (ex: Sentry)
//             throw error; 
//         }
//     }
// }