// src/infrastructure/database/mappers/ProfissionalEspecialidadeMapper.ts

import { ProfissionalEspecialidadeEntity } from '../../../domain/entities/ProfissionalEspecialidadeEntity';
import { ProfissionalEspecialidadeModel, ProfissionalEspecialidadeAttributes } from '../models/profissional_especialidade.model';

export class ProfissionalEspecialidadeMapper {
    public static toEntity(record: ProfissionalEspecialidadeModel): ProfissionalEspecialidadeEntity {
        const data = record.get({ plain: true }) as ProfissionalEspecialidadeAttributes;

        return new ProfissionalEspecialidadeEntity({
            id: data.id,
            idProfissional: data.profissional_id,
            idEspecialidade: data.especialidade_id
        });
    }
}