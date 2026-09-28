// src/application/use-cases/chat/EnviarMensagemUseCase.ts

import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { MensagemEntity } from '../../../domain/entities/MensagemEntity';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher'; 
import { MensagemEnviada } from '../../../domain/events/chat/MensagemEnviada';
import AppError from '../../errors/AppError';
import { EnviarMensagemDTO } from '../../dtos/MensagemDTO';

export class EnviarMensagemUseCase {
    constructor(
        private mensagemRepository: IMensagemRepository,
        private conversaRepository: IConversaRepository,
        private eventDispatcher: EventDispatcherInterface
    ) {}

    async execute({ conversaId, remetenteId, texto }: EnviarMensagemDTO): Promise<MensagemEntity> {
        const conversa = await this.conversaRepository.buscarPorId(conversaId);
        if (!conversa) {
            throw new AppError('Conversa não encontrada.', 404);
        }

        if (conversa.props.pacienteId !== remetenteId && conversa.props.profissionalId !== remetenteId) {
            throw new AppError('Você não tem permissão para enviar mensagens nesta conversa.', 403);
        }

        const novaMensagem = new MensagemEntity({
            conversaId: conversaId,
            remetenteId: remetenteId,
            conteudo: texto,
            lida: false
        });

        const mensagemSalva = await this.mensagemRepository.salvar(novaMensagem);

        console.log("conversa: ", conversa)
        
        // Cria o evento de domínio com os dados necessários
        const mensagemEnviadaEvent = new MensagemEnviada({
            conversaId,
            mensagem: mensagemSalva.toJSON(),
            destinatarioId: conversa.getDestinatarioId(remetenteId)
        });

        // O Dispatcher notifica quem quer que esteja ouvindo (Socket, Logs, etc)
        this.eventDispatcher.notify(mensagemEnviadaEvent);
        
        return mensagemSalva;
    }
}