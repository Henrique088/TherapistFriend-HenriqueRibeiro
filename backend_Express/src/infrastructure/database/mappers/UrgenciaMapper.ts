// src/infrastructure/database/mappers/UrgenciaMapper.ts

import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';

export class UrgenciaMapper {
    public static toEntity(model: any): UrgenciaEntity {
        return new UrgenciaEntity({
            id: model.id,
            pacienteId: model.paciente_id,
            profissionalId: model.profissional_id,
            codinome: model?.paciente?.codinome || undefined,
            motivo: model.motivo,
            janelaDeTempo: model.janela_de_tempo as any,
            status: model.status as any,
            aprovadaEm: model.aprovada_em || undefined
        });
    }
}