// src/infrastructure/database/mappers/ConversaMapper.ts

import { ConversaEntity } from '../../../domain/entities/ConversaEntity';
import { ConversaModel } from '../models/conversa.model';

export class ConversaMapper {
    public static toEntity(model: ConversaModel): ConversaEntity {
        return new ConversaEntity({
            id: model.id,
            relato_id_origem: model.relato_id_origem,
            pacienteId: model.paciente_id,
            profissionalId: model.profissional_id,
            status: model.status,
            pacienteCodinome: (model as any).paciente?.paciente?.codinome,
            profissionalNome: (model as any).profissional?.nome,
            createdAt: (model as any).createdAt
        });
    }
}