// src/application/use-cases/usuario/AtualizarUsuarioUseCase.ts

import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IUsuarioData } from '../../../domain/entities/UsuarioEntity';
import { AtualizarUsuarioDTO } from '../../dtos/UsuarioDTO';

export class AtualizarUsuarioUseCase {
    constructor(
        private usuarioRepository: IUsuarioRepository
    ) { }

    async execute({ id, ...campos }: AtualizarUsuarioDTO): Promise<IUsuarioData> {
        // BUSCAR A ENTIDADE
        const usuarioEntity = await this.usuarioRepository.buscarPorId(id);

        if (!usuarioEntity) {
            throw new AppError('Usuário não encontrado', 404);
        }

        // APLICA AS MUDANÇAS NA ENTIDADE (Domain Logic)
        if (campos.nome) usuarioEntity.nome = campos.nome;
        if (campos.ativo !== undefined) usuarioEntity.ativo = campos.ativo;

        // PERSISTIR
        const usuarioAtualizado = await this.usuarioRepository.salvar(usuarioEntity);

        return usuarioAtualizado.toJSON();
    }
}