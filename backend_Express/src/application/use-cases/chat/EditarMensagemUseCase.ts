// src/application/use-cases/chat/EditarMensagemUseCase.ts

import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { EditarMensagemDTO } from '../../dtos/MensagemDTO';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { MensagemEditada } from '../../../domain/events/chat/MensagemEditada';
import AppError from '../../errors/AppError';

export class EditarMensagemUseCase {
    private readonly LIMITE_MINUTOS = 5;

    constructor(
        private mensagemRepository: IMensagemRepository,
        private eventDispatcher: EventDispatcherInterface
    ) { }

    async execute({ mensagemId, usuarioId, novoTexto }: EditarMensagemDTO): Promise<void> {
        const mensagem = await this.mensagemRepository.buscarPorId(mensagemId);

        if (!mensagem) throw new AppError('Mensagem não encontrada', 404);
        if (mensagem.remetenteId !== usuarioId) throw new AppError('Não autorizado', 403);

        // Regra dos 5 minutos
        mensagem.podeDeletar();

        await this.mensagemRepository.atualizarTexto(mensagemId, novoTexto);

        // Criar e notificar o evento de mensagem editada
        const mensagemEditadaEvent = new MensagemEditada({
            conversaId: mensagem.conversaId,
            mensagemId,
            novoTexto
        });

        // O Dispatcher notifica quem quer que esteja ouvindo (Socket, Logs, etc)
        this.eventDispatcher.notify(mensagemEditadaEvent);
    }
}