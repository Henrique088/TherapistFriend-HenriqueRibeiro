// src/application/use-cases/notificacao/ListarNotificacoesUseCase.spec.ts

import { ListarNotificacoesUseCase } from './ListarNotificacoesUseCase';
import { NotificacaoEntity } from '../../../domain/entities/NotificacaoEntity';

const mockNotificacaoRepo = {
    listar: jest.fn(),
};

describe('ListarNotificacoesUseCase', () => {
    let sut: ListarNotificacoesUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new ListarNotificacoesUseCase(mockNotificacaoRepo as any);
    });

    it('deve retornar uma lista de notificações paginada para o usuário', async () => {
        // ARRANGE
        const usuarioId = 10;
        const page = 1;
        const limit = 5;
        const filtro = [''];
        
        const notificacoesMock = [
            new NotificacaoEntity({ usuario_id: 10, titulo: 'Nota 1', mensagem: '...', tipo: 'SISTEMA', lida: false }),
            new NotificacaoEntity({ usuario_id: 10, titulo: 'Nota 2', mensagem: '...', tipo: 'CHAT', lida: true }),
        ];

        mockNotificacaoRepo.listar.mockResolvedValue(notificacoesMock);

        // ACT
        const resultado = await sut.execute({usuarioId, page, limit, filtro});

        // ASSERT
        expect(resultado).toHaveLength(2);
        expect(mockNotificacaoRepo.listar).toHaveBeenCalledWith(usuarioId, page, limit, [""]);
        // expect(resultado[0]).toBeInstanceOf(NotificacaoEntity);
    });

    it('deve retornar uma lista vazia se o repositório não encontrar notificações', async () => {
        mockNotificacaoRepo.listar.mockResolvedValue([]);
        const resultado = await sut.execute({usuarioId: 10, page: 1, limit: 10, filtro: []});
        expect(resultado).toEqual([]);
    });
});