// src/application/use-cases/relato/AssumirRelatoUseCase.ts

import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import AppError from '../../errors/AppError';
import { SolicitacaoConversaRecebida } from '../../../domain/events/relato/SolicitacaoConversaRecebida';


import { AssumirRelatosDTO } from '../../dtos/RelatoDTO';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';

export class AssumirRelatoUseCase {
    constructor(
        private relatoRepository: IRelatoRepository,
        private eventDispatcher: EventDispatcherInterface) { }

    async execute({ relatoId, profissionalId }: AssumirRelatosDTO) {

        // Busca relato 
        const relato = await this.relatoRepository.buscarPorId(relatoId);

        if (!relato) {
            throw new AppError('Relato não encontrado', 404);
        }

        // Validações de Regra de Negócio
        if (relato.status !== 'pendente') {
            throw new AppError('Este relato já não está disponível', 400);
        }

        if (relato.ids_profissionais_recusados.includes(profissionalId)) {
            throw new AppError('Você não pode assumir este relato novamente', 403);
        }

        // Atualiza a entidade em memória (Domain Logic)
        relato.solicitarConversa(profissionalId);

        // Persistência
        await this.relatoRepository.vincularProfissional(relatoId, profissionalId);

        const dadosNotificacao = await this.relatoRepository.buscarDadosParaNotificacao(relatoId);

        if (dadosNotificacao) {
            // Emite o evento de domínio para notificar o paciente
            const evento = new SolicitacaoConversaRecebida({
                relatoId: relato.id,
                pacienteId: dadosNotificacao.paciente_id,
                profissionalId: profissionalId,
                nomeProfissional: dadosNotificacao.nomeProfissional,
                tituloRelato: dadosNotificacao.titulo
            });

            this.eventDispatcher.notify(evento);
        }

        return relato;
    }
}