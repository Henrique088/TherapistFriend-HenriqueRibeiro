// src/application/factories/IEntidadeRelacionadaFactory.ts

import { UsuarioEntity } from '../../domain/entities/UsuarioEntity';

export interface IEntidadeRelacionadaFactory {
    /**
     * Cria e retorna o DTO da entidade relacionada (Paciente/Profissional)
     * com base no tipo_usuario da entidade principal.
     */
    criarDetalhes(usuarioEntity: UsuarioEntity, transaction?: any): Promise<object | null>;
}