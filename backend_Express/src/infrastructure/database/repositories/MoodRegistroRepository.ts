// src/infrastructure/database/repositories/MoodRegistroRepository.ts

import { IMoodRegistroRepository } from "../../../domain/repositories/IMoodRegistroRepository";
import { MoodRegistroEntity } from "../../../domain/entities/MoodRegistroEntity";
import { MoodRegistroModel } from "../models/mood_registro.model";
import { MoodRegistroMapper } from "../mappers/MoodRegistroMapper";

export class MoodRegistroRepository implements IMoodRegistroRepository {

    


    constructor(private ModelMoodRegistro: typeof MoodRegistroModel) {}

    async buscarDoPeriodo( usuarioId: number, data: Date, periodo: string): Promise<MoodRegistroEntity | null> {

        const model = await this.ModelMoodRegistro.findOne({
            where: {
                usuario_id: usuarioId,
                data_referencia: data,
                periodo
            }
        });

        if (!model) return null;

        return MoodRegistroMapper.toDomain(model);
    }

    async criar(entity: MoodRegistroEntity): Promise<void> {
        const persistence = MoodRegistroMapper.toPersistence(entity);

        await this.ModelMoodRegistro.create(persistence);
    }

    async atualizar(entity: MoodRegistroEntity): Promise<void> {
        const persistence = MoodRegistroMapper.toPersistence(entity);

        await this.ModelMoodRegistro.update(persistence, {
            where: { id: entity.id }
        });
    }

    async buscarUltimoDoDia(usuarioId: number): Promise<MoodRegistroEntity | null> {
    const hoje = new Date().toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

    const model = await this.ModelMoodRegistro.findOne({
        where: {
            usuario_id: usuarioId,
            data_referencia: hoje
        },
        // Ordena pelo ID ou criado_em decrescente para garantir que seja o último inserido
        order: [['id', 'DESC']] 
    });

    if (!model) return null;

    return MoodRegistroMapper.toDomain(model);
}
}
