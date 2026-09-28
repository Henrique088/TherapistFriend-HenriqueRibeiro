// src/application/use-cases/paciente/CriarPacienteUseCase.ts

import AppError from '../../errors/AppError';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import { PacienteCriarDTO, PacienteResponseDTO } from '../../dtos/PacienteDTO';


export class CriarPacienteUseCase {

    constructor(
        private pacienteRepository: IPacienteRepository
    ) { }

    async execute({ idUsuario }: PacienteCriarDTO, transaction?: any): Promise<PacienteResponseDTO> {
        if (!idUsuario) {
            throw new AppError("ID do Usuário é obrigatório para criar um registro de Paciente.", 400);
        }

        console.log("Criando Paciente para ID de Usuário:", idUsuario);

       // Cria o Paciente no repositório
        const pacienteEntity: PacienteEntity = await this.pacienteRepository.criar({
            idUsuario: idUsuario,
            codinome: null,
        }, transaction);

        return pacienteEntity.toJSON();
    }
}