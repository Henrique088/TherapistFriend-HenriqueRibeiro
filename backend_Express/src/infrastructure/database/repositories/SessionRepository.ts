// // src/infrastructure/repositories/SessionRepository.ts

// import { ISessionRepository } from "../../../domain/repositories/ISessionRepository";
// import { SessionEntity } from "../../../domain/entities/SessionEntity";
// import { SessionModelStatic } from "../models/session.model";
// import { SessionMapper } from "../mappers/SessionMapper";

// export class SessionRepository implements ISessionRepository {

//     constructor( 
//         private sessionModel: SessionModelStatic
//     ) {}

//     async create(session: SessionEntity): Promise<SessionEntity> {

//         const persistence = SessionMapper.toPersistence(session);

//         const created = await this.sessionModel.create(persistence);

//         return SessionMapper.toDomain(created);
//     }

//     async findById(id: number): Promise<SessionEntity | null> {

//         const session = await this.sessionModel.findByPk(id);

//         if (!session) return null;

//         return SessionMapper.toDomain(session);
//     }

//     async updateStatus(
//         id: number,
//         status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada',
//         started_at?: Date | null,
//         ended_at?: Date | null
//     ): Promise<void> {

//         await this.sessionModel.update(
//             {
//                 status,
//                 started_at: started_at ?? undefined,
//                 ended_at: ended_at ?? undefined
//             },
//             { where: { id } }
//         );
//     }
// }