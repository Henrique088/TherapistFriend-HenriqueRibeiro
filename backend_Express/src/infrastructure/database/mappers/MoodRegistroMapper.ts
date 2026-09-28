// src/infrastructure/mappers/MoodRegistroMapper.ts

import { MoodRegistroEntity } from "../../../domain/entities/MoodRegistroEntity";
import {MoodRegistroModel} from "../models/mood_registro.model";

export class MoodRegistroMapper {

  static toDomain(model: MoodRegistroModel): MoodRegistroEntity {
    return new MoodRegistroEntity({
      id: model.id,
      usuario_id: model.usuario_id,
      mood: model.mood,
      intensidade: model.intensidade,
      periodo: model.periodo,
      data_referencia: model.data_referencia,
      criado_em: model.criado_em,
      atualizado_em: model.atualizado_em
    });
  }

  static toPersistence(entity: MoodRegistroEntity) {
    const props = entity.toJSON();

    return {
      id: props.id,
      usuario_id: props.usuario_id,
      mood: props.mood,
      intensidade: props.intensidade,
      periodo: props.periodo,
      data_referencia: props.data_referencia
    };
  }
}
