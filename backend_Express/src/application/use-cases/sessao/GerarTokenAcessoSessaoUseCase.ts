// // src/application/use-cases/sessao/GerarTokenAcessoSessaoUseCase.ts

// export class GerarTokenAcessoSessaoUseCase {
//     async execute(sessaoId: string, usuarioId: number) {
//         const sessao = await this.sessaoRepository.buscarPorId(sessaoId);
        
//         // Validações de segurança
//         if (!sessao || (sessao.paciente_id !== usuarioId && sessao.profissional_id !== usuarioId)) {
//             throw new AppError("Acesso negado à sessão.", 403);
//         }

//         // Retorna os servidores STUN/TURN para o Front conseguir furar o NAT/Firewall
//         return {
//             iceServers: [
//                 { urls: 'stun:stun.l.google.com:19302' },
//                 { 
//                     urls: 'turn:seu-servidor-turn.com', 
//                     username: 'user', 
//                     credential: 'password' 
//                 }
//             ],
//             sessaoStatus: sessao.status
//         };
//     }
// }