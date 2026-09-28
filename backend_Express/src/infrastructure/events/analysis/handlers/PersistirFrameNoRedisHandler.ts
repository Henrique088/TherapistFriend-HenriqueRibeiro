import { EventHandlerInterface } from "../../../../domain/@shared/events/EventHandlerInterface";
import { FrameAnalisadoIA } from "../../../../domain/events/analysis/FrameAnalisadoIA";
import { IAnalysisCacheRepository } from "../../../../domain/repositories/IAnalysisCacheRepository";

/**
 * Este Handler é disparado a cada frame analisado pelo gRPC.
 * Ele salva o rascunho da emoção no Redis para processamento posterior (relatório).
 */
export default class PersistirFrameNoRedisHandler implements EventHandlerInterface<FrameAnalisadoIA> {
    
    constructor(private analysisCacheRepo: IAnalysisCacheRepository) {}

    async handle(event: FrameAnalisadoIA): Promise<void> {
        const { sessaoId, emocaoPredominante, confianca, timestamp } = event.eventData;
        console.log("[PersistirFrameNoRedis foi chamado]");
        try {
            
            const frameData = {
                emocao: emocaoPredominante,
                confianca: confianca,
                at: timestamp || Date.now()
            };

            console.log("Frame salvo no Banco: ", frameData);

            // Salva na lista do Redis associada à sessão
            await this.analysisCacheRepo.adicionarFrame(sessaoId, frameData);

            // console.log(`[RedisHandler] Frame estocado para sessão ${sessaoId}`);
        } catch (error) {
            console.error(`[RedisHandler] Falha ao persistir frame no cache:`, error);
            
        }
    }
}