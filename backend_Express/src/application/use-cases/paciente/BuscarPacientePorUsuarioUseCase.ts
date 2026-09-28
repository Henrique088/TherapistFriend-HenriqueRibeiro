// src/application/use-cases/paciente/BuscarPacientePorUsuarioUseCase.ts

import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository'; 
import { PacienteBuscarUsuarioDTO, PacienteResponseDTO } from '../../dtos/PacienteDTO';
import  AppError  from '../../errors/AppError';



export class BuscarPacientePorUsuarioUseCase {
    
    constructor(
        private pacienteRepository: IPacienteRepository
    ) { }

    /**
     * Executa a lógica de aplicação para buscar um Paciente associado a um ID de Usuário.
     * @param idUsuario O ID do Usuário para buscar o Paciente relacionado.
     * @returns A entidade Paciente (PacienteEntity) ou null se não for encontrado.
     */
    async execute({idUsuario}: PacienteBuscarUsuarioDTO): Promise<PacienteResponseDTO | null> {
        
        if (!idUsuario || idUsuario <= 0) {
            throw new AppError("ID de Usuário inválido.");
        }
        
       // Buscar o Paciente pelo ID do Usuário vinculado
        const paciente = await this.pacienteRepository.buscarPorUsuarioId(idUsuario);
        
        if(!paciente){
            return null
        }
        
        
        return paciente.toJSON();
    }
}