// src/infrastructure/database/mappers/UsuarioMapper.ts

import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { UsuarioModel, UsuarioAttributes } from '../models/usuario.model';

export class UsuarioMapper {
    public static toEntity(record: UsuarioModel): UsuarioEntity {
        const data = record.toJSON() as UsuarioAttributes;

        return new UsuarioEntity({
            id: data.id,
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            senha_hash: data.senha_hash,
            tipo_usuario: data.tipo_usuario,
            ativo: data.ativo,
            verificado_telefone: data.telefone_validado,
            verificado_email: data.email_validado,
            data_cadastro: data.data_cadastro,
        });
    }

    public static toDbData(entity: UsuarioEntity): Partial<UsuarioAttributes> {
        return {
            nome: entity.nome,
            email: entity.email,
            telefone: entity.telefone,
            ativo: entity.ativo,
            telefone_validado: entity.telefone_validado,
            email_validado: entity.email_validado,
            senha_hash: entity.senha_hash || undefined,
            tipo_usuario: entity.tipo_usuario,
        };
    }
}