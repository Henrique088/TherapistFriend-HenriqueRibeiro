// src/application/use-cases/usuario/DesativarUsuarioUseCase.ts

import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { DesativarUsuarioDTO, DesativarUsuarioRetornoDTO } from '../../dtos/UsuarioDTO';


export class DesativarUsuarioUseCase { 
    
    private usuarioRepository: IUsuarioRepository;

    constructor(usuarioRepository: IUsuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Desativa logicamente a conta de um usuário, invocando o comportamento de domínio.
     * @param id ID do usuário a ser desativado.
     * @returns ID e status 'ativo' do usuário atualizado.
     */
    async execute({id}: DesativarUsuarioDTO): Promise<DesativarUsuarioRetornoDTO> { 
        
        // BUSCA A ENTIDADE
        const usuarioEntity: UsuarioEntity | null = await this.usuarioRepository.buscarPorId(id);

        if (!usuarioEntity) {
            throw new AppError('Usuário não encontrado para desativação', 404);
        }



        if (!usuarioEntity.ativo) {
            return {
                id: usuarioEntity.id!,
                ativo: false
            };
        }
        
        // CHAMA O COMPORTAMENTO DE DOMÍNIO NA ENTIDADE
        usuarioEntity.marcarInativo(); 

        // PERSISTIR A ENTIDADE MODIFICADA
        const usuarioAtualizadoEntity: UsuarioEntity = await this.usuarioRepository.salvar(usuarioEntity); 

        // Retorna o DTO simples e limpo.
        return {
            id: usuarioAtualizadoEntity.id,
            ativo: usuarioAtualizadoEntity.ativo
        };
    }
}