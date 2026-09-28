// src/application/use-cases/relato/DecidirVinculoUseCase.ts

import { Sequelize, Transaction } from 'sequelize';
import { IRelatoRepository } from '../../../domain/repositories/IRelatoRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import AppError from '../../errors/AppError';
import { VinculoRelatoConfirmado } from '../../../domain/events/relato/VinculoRelatoConfirmado';
import { DecidirVinculoDTO } from '../../dtos/RelatoDTO';
import { RelatoEntity } from '../../../domain/entities/RelatoEntity';
import { ListarParaPacienteResponseDTO } from '../../dtos/RelatoDTO';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';

export class DecidirVinculoUseCase {
    constructor(
        private relatoRepository: IRelatoRepository,
        private conversaRepository: IConversaRepository,
        private sequelize: Sequelize,
        private eventDispatcher: EventDispatcherInterface
    ) { }

    async execute(dados: DecidirVinculoDTO) {
        // Buscas e Validações Iniciais
        const relato = await this.validarRelato(dados);

        // Roteamento da Decisão
        if (dados.decisao === 'aceitar') {
            await this.processarAceite(relato, dados.profissionalId);
        } else {
            await this.processarRecusa(relato, dados.profissionalId);
        }

        const dadosNotificacao = await this.relatoRepository.buscarDadosParaNotificacao(dados.relatoId);

        const relatosDTO: ListarParaPacienteResponseDTO = ({
            id: relato.id,
            paciente_id: relato.paciente_id,
            titulo: relato.titulo,
            categoria: relato.categoria,
            texto: relato.texto,
            data_envio: relato.data_envio,
            quantidadeLikes: relato.quantidadeLikes || 0,
            jaCurtiu: relato.jaCurtiu,
            codinomePaciente: relato.codinomePaciente || 'Anônimo'
        });

        // Emite o evento de domínio para notificar o profissional sobre a decisão do paciente
        const evento = new VinculoRelatoConfirmado({
            relatoId: relato.id,
            profissionalId: dados.profissionalId,
            pacienteId: dadosNotificacao?.paciente_id,
            nomeProfissional: dadosNotificacao?.nomeProfissional,
            codinomePaciente: dadosNotificacao?.codinomePaciente,
            decisao: dados.decisao === "aceitar" ? 'aceite' : '',
        });

        this.eventDispatcher.notify(evento);

        return relatosDTO;
    }

    // --- Métodos Auxiliares ---

    private async validarRelato(dados: DecidirVinculoDTO): Promise<RelatoEntity> {
        const relato = await this.relatoRepository.buscarPorId(dados.relatoId);
        if (!relato) throw new AppError('Relato não encontrado', 404);

        if (relato.paciente_id !== dados.pacienteId) {
            throw new AppError('Não tem permissão para decidir sobre este relato', 403);
        }

        if (relato.status !== 'aguardando_aprovacao') {
            throw new AppError('Este relato não possui uma solicitação pendente de aprovação', 400);
        }

        if (relato.profissional_id !== dados.profissionalId) {
            throw new AppError('Este profissional não está mais vinculado a este relato. Ele pode ter desistido.', 409);
        }

        return relato;
    }

    private async processarAceite(relato: RelatoEntity, profissionalId: number) {
        const t = await this.sequelize.transaction();

        try {

            if (!relato.id || !relato.paciente_id) {
                throw new AppError('Relato não encontrado', 404);
            }

            // Atualiza Relato
            await this.relatoRepository.confirmarVinculo(relato.id, profissionalId, t);

           const existe = await this.conversaRepository.buscarAtivaEntre(relato.paciente_id, profissionalId);
            
           // Cria Conversa (Vazia)
           if (!existe) {
               await this.conversaRepository.criar({
                   relato_id_origem: relato.id,
                   paciente_id: relato.paciente_id,
                   profissional_id: profissionalId,
                   status: 'ativa'
               }, t);     
           } 

            // Confirma no Banco
            await t.commit();

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    private async processarRecusa(relato: RelatoEntity, profissionalId: number) {

        if (!relato.id) {
            throw new AppError('Relato não encontrado', 404);
        }

        await this.relatoRepository.registrarRecusa(relato.id, profissionalId);


    }
}