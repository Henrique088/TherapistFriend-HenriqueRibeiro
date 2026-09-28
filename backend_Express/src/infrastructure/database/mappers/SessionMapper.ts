// // src/infrastructure/mappers/SessionMapper.ts

// import { SessionEntity } from "../../../domain/entities/SessionEntity";
// import { SessionModel } from "../models/session.model";

// export class SessionMapper {

//     static toDomain(model: SessionModel): SessionEntity {
//         return new SessionEntity({
//             id: model.id,
//             paciente_id: model.paciente_id,
//             profissional_id: model.profissional_id,
//             schedule_id: model.schedule_id,
//             status: model.status,
//             started_at: model.started_at,
//             ended_at: model.ended_at,
//             created_at: model.created_at
//         });
//     }

//     static toPersistence(entity: SessionEntity) {
//         const props = entity.toJSON();

//         return {
//             id: props.id ?? undefined,
//             paciente_id: props.paciente_id,
//             profissional_id: props.profissional_id,
//             schedule_id: props.schedule_id,
//             status: props.status,
//             started_at: props.started_at,
//             ended_at: props.ended_at
//         };
//     }
// }