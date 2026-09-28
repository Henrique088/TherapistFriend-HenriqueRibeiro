// src/application/use-cases/Profissional/CriarProfissionalUseCase.ts

import AppError from '../../errors/AppError';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ProfissionalEntity } from '../../../domain/entities/ProfissionalEntity';
import { ProfissionalCriarDTO, ProfissionalResponseDTO } from '../../dtos/ProfissionaisDTO';

export class CriarProfissionalUseCase {
   
    constructor(
        private profissionalRepository: IProfissionalRepository
    ) { }

    /**
     * Este Use Case é chamado pelo Orquestrador de Cadastro.
     * Ele cria apenas o registro inicial (casca) vinculado ao usuário.
     */
    async execute({idUsuario}: ProfissionalCriarDTO, transaction?: any): Promise<ProfissionalResponseDTO> {
        if (!idUsuario) {
            throw new AppError("ID do Usuário é obrigatório para criar um registro de Profissional.", 400);
        }

        try {
            // Cria a entidade com campos nulos, pois serão preenchidos no 'Completar Perfil'
            const profissionalEntity: ProfissionalEntity = await this.profissionalRepository.criar({
                id_usuario: idUsuario,
                cpf: null,
                crp: null,
                bio: null,
                validado: false // Sempre inicia como falso
            }, { transaction });

            // Retorna os dados da entidade (o repositório já faz o mapRecordToEntity)
            return {
                id: profissionalEntity.id,
                id_usuario: profissionalEntity.id_usuario,
                validado: profissionalEntity.validado
            };

        } catch (error) {
            throw new AppError('Erro ao criar registro inicial do profissional: ' + (error as Error).message, 500);
        }
    }
}