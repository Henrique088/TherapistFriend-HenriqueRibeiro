// // src/application/use-cases/sessao/NotificarParticipantesUseCase.ts

// export class NotificarParticipantesUseCase {
//     async execute(sessao: SessaoEntity) {
//         const link = `https://app.suaplataforma.com.br/sessao/${sessao.id}`;
        
//         // 1. Notifica Profissional (Email/Push/Socket)
//         await this.emailProvider.send({
//             to: sessao.profissionalEmail,
//             subject: "Sua sessão vai começar",
//             body: `Acesse o consultório virtual: ${link}`
//         });

//         // 2. Notifica Paciente
//         await this.emailProvider.send({
//             to: sessao.pacienteEmail,
//             subject: "Hora da sua consulta",
//             body: `Clique aqui para entrar na sala: ${link}`
//         });
//     }
// }