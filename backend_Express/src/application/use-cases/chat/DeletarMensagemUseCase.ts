// src/application/use-cases/chat/DeletarMensagemUseCase.ts

import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { DeletarMensagemDTO } from '../../dtos/MensagemDTO';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { MensagemDeletada } from '../../../domain/events/chat/MensagemDeletada';
import AppError from '../../errors/AppError';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';

export class DeletarMensagemUseCase {

    constructor(
        private mensagemRepository: IMensagemRepository,
        private conversaRepository: IConversaRepository,
        private eventDispatcher: EventDispatcherInterface

    ) { }

    async execute({ mensagemId, usuarioId }: DeletarMensagemDTO): Promise<void> {
        const mensagem = await this.mensagemRepository.buscarPorId(mensagemId);

        if (!mensagem) throw new AppError('Mensagem não encontrada', 404);
        if (mensagem.remetenteId !== usuarioId) throw new AppError('Não autorizado', 403);

        const conversa = await this.conversaRepository.buscarPorId(mensagem.conversaId);
        if (!conversa) {
            throw new AppError('Conversa não encontrada.', 404);
        }

        // Validação do Timer
        const agora = new Date();
        const dataEnvio = new Date(mensagem.dataEnvio);
        const diferencaMinutos = (agora.getTime() - dataEnvio.getTime()) / (1000 * 60);

        if (diferencaMinutos > 5) {
            throw new AppError('O tempo para deletar a mensagem expirou', 400);
        }

        await this.mensagemRepository.deletarMensagem(mensagemId);

        // Criar e notificar o evento de mensagem deletada
        const mensagemDeletadaEvent = new MensagemDeletada({
            conversaId: mensagem.conversaId,
            mensagemId,
            remetenteId: mensagem.remetenteId,
            destinatarioId: conversa.getDestinatarioId(mensagem.remetenteId),
            lida: mensagem.lida
        });

        // O Dispatcher notifica quem quer que esteja ouvindo (Socket, Logs, etc)
        this.eventDispatcher.notify(mensagemDeletadaEvent);
    }
}