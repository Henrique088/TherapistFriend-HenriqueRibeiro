// // tests/unit/infrastructure/analysis/handlers/SalvarRelatorioSessaoHandler.spec.ts

// import SalvarRelatorioSessaoHandler from '../../../../../src/infrastructure/events/analysis/handlers/SalvarRelatorioSessaoHandler';
// import { ISessaoRepository } from '../../../../../src/domain/repositories/ISessaoRepository';
// import { RelatorioSessaoFinalizado } from '../../../../../src/domain/events/analysis/RelatorioSessaoFinalizado';

// describe('SalvarRelatorioSessaoHandler', () => {
//     let mockSessaoRepo: jest.Mocked<ISessaoRepository>;
//     let sut: SalvarRelatorioSessaoHandler;

//     beforeEach(() => {
//         mockSessaoRepo = {
//             salvarAnaliseFinal: jest.fn(),
//             buscarPorId: jest.fn(),
//             encerrarSessao: jest.fn(),
//             listarPorUsuario: jest.fn(),
//         } as any;

//         sut = new SalvarRelatorioSessaoHandler(mockSessaoRepo);
//     });

//     it('deve persistir os dados consolidados no banco de dados via repositório', async () => {
//         // GIVEN
//         const dadosFake = {
//             emocaoDominante: 'alegria',
//             picosAnsiedade: 1,
//             jsonGraficos: '{"labels": ["T1", "T2"], "values": [0.1, 0.8]}'
//         };

//         const event = new RelatorioSessaoFinalizado({
//             sessaoId: 'sessao_123',
//             pacienteId: 1,
//             profissionalId: 2,
//             dadosConsolidados: dadosFake
//         });

//         // WHEN
//         await sut.handle(event);

//         // THEN
//         expect(mockSessaoRepo.salvarAnaliseFinal).toHaveBeenCalledWith(
//             'sessao_123',
//             dadosFake
//         );
//         expect(mockSessaoRepo.salvarAnaliseFinal).toHaveBeenCalledTimes(1);
//     });

//     it('deve lançar erro se o repositório falhar', async () => {
//         // GIVEN
//         mockSessaoRepo.salvarAnaliseFinal.mockRejectedValue(new Error('DB Error'));
//         const event = new RelatorioSessaoFinalizado({ sessaoId: '1', dadosConsolidados: {} });

//         // WHEN & THEN
//         await expect(sut.handle(event)).rejects.toThrow('DB Error');
//     });
// });