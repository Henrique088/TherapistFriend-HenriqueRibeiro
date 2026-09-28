// src/infrastructure/database/mappers/AgendamentoMapper.ts

import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import { AgendamentoModel } from '../models/agendamento.model';

export class AgendamentoMapper {
    // Converte Model (Banco) -> Entity (Domínio)
    static toDomain(model: AgendamentoModel): AgendamentoEntity {
        return new AgendamentoEntity({
            id: model.id,
            pacienteId: model.paciente_id,
            profissionalId: model.profissional_id,
            dataInicio: model.data_inicio,
            dataFim: model.data_fim,
            status: model.status,
            tipo: model.tipo,
            observacoes: model.observacoes,
            valor: model.valor ? Number(model.valor) : undefined,
            codinome: model.paciente?.codinome ?? ''
        });
    }

    // Converte Entity (Domínio) -> Objeto para o Sequelize (Banco)
    static toPersistence(entity: AgendamentoEntity) {
        return {
            id: entity.id,
            paciente_id: entity.pacienteId,
            profissional_id: entity.profissionalId,
            data_inicio: entity.dataInicio,
            data_fim: entity.dataFim,
            status: entity.status,
            tipo: entity.tipo,
            observacoes: entity.observacoes,
            valor: entity.valor
        };
    }
}