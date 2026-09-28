// // src/application/use-cases/sessao/ParticipanteDesconectouUseCase.ts

// // Possivelmente irei apagar 
// import EventDispatcher from "../../../domain/@shared/events/EventDispatcher";
// import { ParticipantOffline } from "../../../domain/events/sessao/ParticipantOffline";



// interface DTO {

//     sessaoId: string;

//     usuarioId: number;

// }

// export class ParticipanteDesconectouUseCase {

//     constructor(

//         private readonly eventDispatcher: EventDispatcher

//     ) { }

//     async execute({

//     sessaoId,

//     usuarioId

// }: DTO): Promise<void> {


//     console.log(

//         `🔴 Participante ${usuarioId} desconectou.`

//     );

//     /**
//      * Notifica imediatamente a UI.
//      */
//     this.eventDispatcher.notify(

//         new ParticipantOffline({

//             sessaoId,

//             usuarioId

//         })

//     );

// }

// }