// src/application/use-cases/usuario/BuscarUsuarioPorEmailUseCase.ts

import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IUsuarioData, UsuarioEntity } from '../../../domain/entities/UsuarioEntity'; // Importa a Entidade completa
import { BuscarPorEmailUsuarioDTO } from '../../dtos/UsuarioDTO';

export class BuscarUsuarioPorEmailUseCase { 
    
    constructor(
        private usuarioRepository: IUsuarioRepository
    ) { }

    /**
     * Busca um usuário pelo e-mail. Retorna a Entidade Completa, incluindo senha_hash.
     * @param email O e-mail a ser buscado.
     * @returns A Entidade do Usuário (UsuarioEntity).
     */
    async execute({email} : BuscarPorEmailUsuarioDTO): Promise<IUsuarioData> { 
        
        // Busca a ENTIDADE no repositório.
        const usuarioEntity: UsuarioEntity | null = await this.usuarioRepository.buscarPorEmail(email);

        if (!usuarioEntity) {
            // Lança um erro de domínio se não for encontrado
            throw new AppError('Usuário não encontrado', 404);
        }

        // Retorna a ENTIDADE.
        return usuarioEntity.toJSON();
    }
}