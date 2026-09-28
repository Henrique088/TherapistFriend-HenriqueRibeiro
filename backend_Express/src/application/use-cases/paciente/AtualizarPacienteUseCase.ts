// src/application/use-cases/paciente/AtualizarPacienteUseCase.ts

import AppError from '../../errors/AppError';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import { PacienteAtualizacaoDTO, PacienteResponseDTO } from '../../dtos/PacienteDTO';

export class AtualizarPacienteUseCase {

    constructor(
        private pacienteRepository: IPacienteRepository
    ) { }

    async execute(dados: PacienteAtualizacaoDTO): Promise<PacienteResponseDTO> {

        const { idUsuario, codinome } = dados;

        // Busca a Entidade pelo ID do Usuário vinculado
        const pacienteEntity = await this.pacienteRepository.buscarPorUsuarioId(idUsuario);

        const codinomeExistente = await this.pacienteRepository.buscarPorCodinome(codinome || '');
        
        if (codinomeExistente && codinomeExistente === true) {
            throw new AppError("Codinome já está em uso. Por favor, escolha outro.", 400);
        }

        if (!pacienteEntity) {
            throw new AppError("Paciente não encontrado.", 404);
        }

        // Aplica Regras de Negócio via Entidade (Encapsulamento)
        if (codinome !== undefined && codinome !== null) {
            pacienteEntity.definirCodinome(codinome);
        }

        // Persisti as alterações
        await this.pacienteRepository.salvar(pacienteEntity);

        // Retorna os dados sanitizados
        return pacienteEntity.toJSON();
    }
}