// // src/application/use-cases/chat/DeletarMensagemUseCase.spec.ts

// import { DeletarMensagemUseCase } from './DeletarMensagemUseCase';
// import AppError from '../../errors/AppError';

// describe('DeletarMensagemUseCase', () => {
//     let sut: DeletarMensagemUseCase;
//     let mockMensagemRepo: any;
//     let mockEventDispatcher: any; // Novo mock

//     // src/application/use-cases/chat/DeletarMensagemUseCase.spec.ts

//     beforeEach(() => {
//         mockMensagemRepo = {
//             buscarPorId: jest.fn(),
//             // Ajuste aqui para o nome que o erro apontou:
//             deletarMensagem: jest.fn(),
//         };

//         mockEventDispatcher = {
//             notify: jest.fn(),
//         };

//         sut = new DeletarMensagemUseCase(mockMensagemRepo, mockEventDispatcher);
//     });

//     const mensagemValida = {
//         id: 1,
//         conversaId: 'conversa_123', // Adicionado pois o evento precisa
//         remetenteId: 10,
//         dataEnvio: new Date(),
//         conteudo: 'Mensagem original'
//     };

//     it('deve marcar mensagem como deletada e disparar o evento com sucesso', async () => {
//         // Arrange
//         mockMensagemRepo.buscarPorId.mockResolvedValue(mensagemValida);

//         // Act
//         await sut.execute({ mensagemId: 1, usuarioId: 10 });

//         // Assert: Verifica a persistência
//         // Assert: Verifica se chamou deletarMensagem e não atualizarTexto
//         expect(mockMensagemRepo.deletarMensagem).toHaveBeenCalledWith(1);

//         // Assert: Verifica o evento
//         expect(mockEventDispatcher.notify).toHaveBeenCalled();

//         // Verifica se o evento disparado é o correto (MensagemDeletada)
//         const eventSpied = mockEventDispatcher.notify.mock.calls[0][0];
//         expect(eventSpied.constructor.name).toBe('MensagemDeletada');
//         expect(eventSpied.eventData.mensagemId).toBe(1);
//     });

//     it('deve lançar erro 404 se a mensagem não existir e não disparar evento', async () => {
//         mockMensagemRepo.buscarPorId.mockResolvedValue(null);

//         await expect(sut.execute({ mensagemId: 999, usuarioId: 10 }))
//             .rejects.toThrow(new AppError('Mensagem não encontrada', 404));

//         expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
//     });

//     it('deve lançar erro 403 se o usuário não for o remetente', async () => {
//         mockMensagemRepo.buscarPorId.mockResolvedValue(mensagemValida);

//         await expect(sut.execute({ mensagemId: 1, usuarioId: 20 }))
//             .rejects.toThrow(new AppError('Não autorizado', 403));

//         expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
//     });

//     it('deve lançar erro 400 se o tempo de 15 minutos já tiver passado', async () => {
//         const dataAntiga = new Date();
//         dataAntiga.setMinutes(dataAntiga.getMinutes() - 16);

//         mockMensagemRepo.buscarPorId.mockResolvedValue({
//             ...mensagemValida,
//             dataEnvio: dataAntiga
//         });

//         await expect(sut.execute({ mensagemId: 1, usuarioId: 10 }))
//             .rejects.toThrow(new AppError('O tempo para deletar a mensagem expirou', 400));

//         expect(mockMensagemRepo.deletarMensagem).not.toHaveBeenCalled();
//         expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
//     });
// });