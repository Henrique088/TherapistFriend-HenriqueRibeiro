// tests/unit/infrastructure/analysis/handlers/NotificarProfissionalRelatorioProntoHandler.spec.ts

import NotificarProfissionalRelatorioProntoHandler from '../../../../../src/infrastructure/events/analysis/handlers/NotificarProfissionalRelatorioProntoHandler';

describe('NotificarProfissionalRelatorioProntoHandler', () => {
    let mockIo: any;
    let mockEmit: jest.Mock;
    let mockTo: jest.Mock;

    beforeEach(() => {
        mockEmit = jest.fn();
        mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
        mockIo = { to: mockTo };
    });

    it('deve emitir evento de socket exclusivamente para a sala do profissional', async () => {
        const handler = new NotificarProfissionalRelatorioProntoHandler(mockIo);
        
        const event = {
            eventData: {
                sessaoId: 'sessao_123',
                profissionalId: 50,
                dadosConsolidados: {
                    emocaoDominante: 'alegria',
                    picosAnsiedade: 0
                }
            }
        } as any;

        await handler.handle(event);

        // Verifica se direcionou para a sala certa
        expect(mockTo).toHaveBeenCalledWith('usuario_50');
        
        // Verifica se o evento e os dados estão corretos
        expect(mockEmit).toHaveBeenCalledWith('relatorio_finalizado', expect.objectContaining({
            sessaoId: 'sessao_123',
            resumo: expect.any(Object)
        }));
    });
});