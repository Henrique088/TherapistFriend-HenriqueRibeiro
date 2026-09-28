// src/infrastructure/database/mappers/DisponibilidadeMapper.ts

import { DisponibilidadeEntity } from '../../../domain/entities/DisponibilidadeEntity';
import { DisponibilidadeModel } from '../models/disponibilidade-profissional.model';

export class DisponibilidadeMapper {
    static toDomain(model: DisponibilidadeModel): DisponibilidadeEntity {
        return new DisponibilidadeEntity({
            id: model.id,
            profissionalId: model.profissional_id,
            diaSemana: model.dia_semana,
            horaInicio: model.hora_inicio,
            horaFim: model.hora_fim,
            ativo: model.ativo
        });
    }

    static toPersistence(entity: DisponibilidadeEntity) {
        return {
            id: entity.id,
            profissional_id: entity.profissionalId,
            dia_semana: entity.diaSemana,
            hora_inicio: entity.horaInicio,
            hora_fim: entity.horaFim,
            ativo: entity.ativo
        };
    }
}