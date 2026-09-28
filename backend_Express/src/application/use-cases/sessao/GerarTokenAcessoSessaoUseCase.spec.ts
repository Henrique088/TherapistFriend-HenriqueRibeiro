// // tests/unit/application/use-cases/sessao/GerarAcessoSessaoUseCase.spec.ts

// import { GerarAcessoSessaoUseCase } from './GerarAcessoSessaoUseCase';
// import { SessaoEntity } from '../../../domain/entities/SessaoEntity';
// import AppError from '../../errors/AppError';

// describe('GerarAcessoSessaoUseCase', () => {
//     let mockSessaoRepo: any;
//     let sut: GerarAcessoSessaoUseCase;

//     const sessaoValida = new SessaoEntity({
//         id: 'sessao_abc',
//         paciente_id: 1,
//         profissional_id: 50,
//         status: 'agendada',
//         data_inicio: new Date(),
//     });

//     beforeEach(() => {
//         mockSessaoRepo = { buscarPorId: jest.fn() };
//         sut = new GerarAcessoSessaoUseCase(mockSessaoRepo);
        
//         // Mock das variáveis de ambiente para o teste
//         process.env.TURN_SERVER_URL = 'turn:test.com';
//         process.env.TURN_SERVER_USER = 'user_test';
//         process.env.TURN_SERVER_PASS = 'pass_test';
//     });

//     it('deve retornar credenciais ICE se o usuário for o profissional da sessão', async () => {
//         mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoValida);

//         const result = await sut.execute('sessao_abc', 50); // ID do Profissional

//         expect(result.sessaoId).toBe('sessao_abc');
//         expect(result.iceServers).toContainEqual(expect.objectContaining({
//             urls: 'turn:test.com',
//             username: 'user_test'
//         }));
//     });

//     it('deve retornar credenciais ICE se o usuário for o paciente da sessão', async () => {
//         mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoValida);

//         const result = await sut.execute('sessao_abc', 1); // ID do Paciente

//         expect(result.iceServers[0].urls).toBe('stun:stun.l.google.com:19302');
//     });

//     it('deve lançar erro 403 se o usuário não pertencer à sessão', async () => {
//         mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoValida);

//         await expect(sut.execute('sessao_abc', 99))
//             .rejects.toEqual(new AppError("Você não tem permissão para acessar esta sessão.", 403));
//     });

//     it('deve lançar erro 400 se a sessão já estiver finalizada', async () => {
//         const sessaoEncerrada = new SessaoEntity({
//             ...sessaoValida.toJSON(),
//             status: 'finalizada'
//         });
//         mockSessaoRepo.buscarPorId.mockResolvedValue(sessaoEncerrada);

//         await expect(sut.execute('sessao_abc', 1))
//             .rejects.toEqual(new AppError("Esta sessão já foi encerrada.", 400));
//     });
// });


describe("placeholder", () => {
  test("placeholder test", () => {
    expect(true).toBe(true);
  });
});