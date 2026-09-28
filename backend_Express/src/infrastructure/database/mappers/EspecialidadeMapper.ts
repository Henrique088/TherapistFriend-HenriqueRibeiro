// src/infrastructure/database/mappers/EspecialidadeMapper.ts

import { EspecialidadeEntity } from '../../../domain/entities/EspecialidadeEntity';
import { EspecialidadeModel, EspecialidadeAttributes } from '../models/especialidade.model';

export class EspecialidadeMapper {
    public static toEntity(record: EspecialidadeModel): EspecialidadeEntity {
        const data = record.toJSON() as EspecialidadeAttributes;
        
        return new EspecialidadeEntity({
            id: data.id,
            nome: data.nome,
            criadoEm: data.criado_em,
            atualizadoEm: data.atualizado_em,
        });
    }
}