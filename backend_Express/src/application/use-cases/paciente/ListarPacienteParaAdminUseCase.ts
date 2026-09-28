// src/application/use-cases/pacientes/ListarPacienteParaAdminUseCase.ts

import AppError from '../../errors/AppError';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteListarAdminDTO, PacienteListarAdminResponseDTO } from '../../dtos/PacienteDTO';


export class ListarPacienteParaAdminUseCase {

    constructor (
        private pacienteRepository: IPacienteRepository
    ){}

    async execute({page, limit, filtro}: PacienteListarAdminDTO) : Promise<PacienteListarAdminResponseDTO>{
        
        const resultado = await this.pacienteRepository.listarPacienteParaAdmin(page, limit, {...filtro});

        return resultado;

    }
}

