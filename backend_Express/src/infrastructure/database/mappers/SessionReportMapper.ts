// src/infrastructure/mappers/SessionReportMapper.ts

import { SessionReportEntity } from "../../../domain/entities/SessionReportEntity";
import { SessionReportModel } from "../models/sessao_report.model";

export class SessionReportMapper {

  static toDomain(model: SessionReportModel): SessionReportEntity {
    return new SessionReportEntity({
      id: model.id,
      session_id: model.session_id,
      paciente_id: model.paciente_id,
      profissional_id: model.profissional_id,
      summary: model.summary,
      profissional_comment: model.profissional_comment,
      created_at: model.created_at,
    });
  }

  static toPersistence(entity: SessionReportEntity) {
    const props = entity.toJSON();

    return {
      id: props.id ?? undefined,
      session_id: props.session_id,
      paciente_id: props.paciente_id,
      profissional_id: props.profissional_id,
      summary: props.summary,
      profissional_comment: props.profissional_comment
    };
  }
}