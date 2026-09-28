// src/infrastructure/database/mappers/RelatoMapper.ts

import { RelatoEntity } from '../../../domain/entities/RelatoEntity';

export class RelatoMapper {
    public static toEntity(model: any): RelatoEntity {
        return new RelatoEntity({
            id: model.id,
            paciente_id: model.paciente_id,
            profissional_id: model.profissional_id,
            titulo: model.titulo,
            texto: model.texto,
            categoria: model.categoria,
            anonimo: model.anonimo,
            status: model.status,
            ids_profissionais_recusados: model.ids_profissionais_recusados || [],
            resultado_ia: model.resultado_ia,
            data_envio: model.data_envio,
            quantidadeLikes: model.getDataValue && model.getDataValue('quantidadeLikes') ? Number(model.getDataValue('quantidadeLikes')) : (model.quantidadeLikes ? Number(model.quantidadeLikes) : 0),
            jaCurtiu: !!model.curtidas && model.curtidas.length > 0,
            codinomePaciente: model.paciente?.paciente?.codinome
        });
    }
}