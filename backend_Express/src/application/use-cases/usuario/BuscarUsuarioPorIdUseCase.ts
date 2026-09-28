// src/application/use-cases/usuario/BuscarUsuarioPorIdUseCase.ts

import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity, IUsuarioData } from '../../../domain/entities/UsuarioEntity'; // Importa a Entidade e o DTO de dados (IUsuarioData)
import { BuscarPorIdUsuarioDTO } from '../../dtos/UsuarioDTO';

export class BuscarUsuarioPorIdUseCase {
      
    constructor(
        private usuarioRepository: IUsuarioRepository
    ) {}

    /**
     * Busca um usuário pelo ID e retorna um DTO limpo (sem senha_hash).
     * @param id O ID numérico do usuário.
     * @returns O DTO limpo do Usuário (IUsuarioData).
     */
    async execute({id}: BuscarPorIdUsuarioDTO): Promise<IUsuarioData> { 
        
        // Busca a ENTIDADE no repositório.
        // O IUsuarioRepository.buscarPorId deve retornar Promise<UsuarioEntity | null>
        const usuarioEntity: UsuarioEntity | null = await this.usuarioRepository.buscarPorId(id); 

        if (!usuarioEntity) {
            // Lança um erro de domínio se não for encontrado
            throw new AppError('Usuário não encontrado', 404);
        }

        // Retorna o DTO limpo (IUsuarioData).
        return usuarioEntity.toJSON();
    }
}