// src/infrastructure/mappers/SessaoMapper.ts

import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
import { SessaoModel } from '../models/sessao.model';

export class SessaoMapper {
    static toEntity(model: SessaoModel): SessaoEntity {
        return new SessaoEntity({
            id: model.id,
            paciente_id: model.paciente_id,
            profissional_id: model.profissional_id,
            status: model.status,
            data_inicio: model.data_inicio,
            data_fim: model.data_fim,
            data_inicio_real: model.data_inicio_real
        });
    }

    static toDatabase(entity: SessaoEntity): any {
        return {
            id: entity.id,
            paciente_id: entity.paciente_id,
            profissional_id: entity.profissional_id,
            status: entity.status,
            data_inicio: entity.data_inicio,
            data_fim: entity.data_fim,
        };
    }
}