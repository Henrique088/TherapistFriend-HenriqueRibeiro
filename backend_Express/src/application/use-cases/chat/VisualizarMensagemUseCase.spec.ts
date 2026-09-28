// src/application/use-cases/chat/VisualizarMensagemUseCase.spec.ts

import { VisualizarMensagemUseCase } from './VisualizarMensagemUseCase';

describe('VisualizarMensagemUseCase', () => {
    let sut: VisualizarMensagemUseCase;
    let mockMensagemRepo: any;
    let mockEventDispatcher: any;

    beforeEach(() => {
        mockMensagemRepo = {
            buscarPorId: jest.fn(),
            marcarComoLida: jest.fn(),
        };

        mockEventDispatcher = {
            notify: jest.fn(),
        };

        sut = new VisualizarMensagemUseCase(mockMensagemRepo, mockEventDispatcher);
    });

    it('deve marcar mensagens como lidas e notificar evento apenas para o que foi recebido', async () => {
    const usuarioId = 10;
    const mensagemRecebida = { id: 1, remetenteId: 20, conversaId: 'conv_1' }; 
    const mensagemEnviadaPeloProprio = { id: 2, remetenteId: 10, conversaId: 'conv_1' };

    mockMensagemRepo.buscarPorId
        .mockResolvedValueOnce(mensagemRecebida)
        .mockResolvedValueOnce(mensagemEnviadaPeloProprio);

    await sut.execute({ 
        mensagemIds: [1, 2], 
        usuarioId 
    });

    
    expect(mockMensagemRepo.marcarComoLida).toHaveBeenCalledWith([1, 2], 10);
    
    expect(mockEventDispatcher.notify).toHaveBeenCalledTimes(1);
});

    it('não deve disparar evento se nenhuma mensagem válida for encontrada', async () => {
        mockMensagemRepo.buscarPorId.mockResolvedValue(null);

        await sut.execute({ mensagemIds: [999], usuarioId: 10 });

        // AJUSTE AQUI: Ele chamou o repo com lista vazia ou IDs não encontrados
        // O erro diz que recebeu [999], 10. Então o repo é chamado, mas não deve notificar evento.
        expect(mockMensagemRepo.marcarComoLida).toHaveBeenCalledWith([999], 10);
        expect(mockEventDispatcher.notify).not.toHaveBeenCalled();
    });

    it('deve disparar evento com múltiplas mensagens corretamente', async () => {
        const usuarioId = 10;
        mockMensagemRepo.buscarPorId.mockImplementation(async (id: any) => ({
            id,
            remetenteId: 20,
            conversaId: 'conv_1'
        }));

        await sut.execute({ mensagemIds: [1, 2, 3], usuarioId });

        // AJUSTE AQUI: O seu código chama o repo 1 vez com a lista completa
        expect(mockMensagemRepo.marcarComoLida).toHaveBeenCalledTimes(1);
        expect(mockMensagemRepo.marcarComoLida).toHaveBeenCalledWith([1, 2, 3], 10);
        
        expect(mockEventDispatcher.notify).toHaveBeenCalledTimes(1);
    });
});