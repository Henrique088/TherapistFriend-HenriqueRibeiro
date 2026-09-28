// src/application/use-cases/chat/VisualizarMensagemUseCase.ts

import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { MensagensLidas } from '../../../domain/events/chat/MensagensLidas';
import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { VisualizarMensagemDTO } from '../../dtos/MensagemDTO';
import AppError from '../../errors/AppError';


export class VisualizarMensagemUseCase {
    constructor(
        private mensagemRepository: IMensagemRepository,
        private eventDispatcher: EventDispatcherInterface
    ) {}

    async execute({ mensagemIds, usuarioId }: VisualizarMensagemDTO): Promise<void> {
        
        // Marca como lida
        await this.mensagemRepository.marcarComoLida(mensagemIds, usuarioId);

        // Notificar via Socket
        try {
            
            const primeiraMsg = await this.mensagemRepository.buscarPorId(mensagemIds[0]);
          
            if (primeiraMsg) {
                // Emitimos um evento de domínio para notificar os sockets
                const mensagensLidasEvent = new MensagensLidas({
                    conversaId: primeiraMsg.conversaId,
                    mensagemIds,
                    usuarioId
                });
                this.eventDispatcher.notify(mensagensLidasEvent);

            }
        } catch (error) {
            // Erro de socket não deve travar a requisição HTTP. 
            // Se o banco salvou, a mensagem está lida.
            console.error("Erro ao emitir socket de leitura:", error);
        }
    }
}