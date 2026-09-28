// src/application/use-cases/usuario/ListarUsuarioParaAdminUsecase.spec.ts

import { ListarUsuarioParaAdminUsecase } from './ListarUsuarioParaAdminUsecase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';

describe('ListarUsuarioParaAdminUsecase', () => {
    let useCase: ListarUsuarioParaAdminUsecase;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;

    beforeEach(() => {
        mockUsuarioRepo = {
            listar: jest.fn(),
        } as any;

        useCase = new ListarUsuarioParaAdminUsecase(mockUsuarioRepo);
    });

    it('deve retornar a lista de usuários paginada corretamente', async () => {
        const mockResponse = {
            data: [
                { id: 1, nome: 'Henrique', email: 'henrique@teste.com' },
                { id: 2, nome: 'Admin System', email: 'admin@teste.com' }
            ],
            total: 2,
            pagina: 1,
            totalPaginas: 1
        };

        mockUsuarioRepo.listar.mockResolvedValue(mockResponse as any);

        const resultado = await useCase.execute(1, 10, { busca: 'Henrique' });

        expect(mockUsuarioRepo.listar).toHaveBeenCalledWith(1, 10, { busca: 'Henrique' });
        
        // Valida se o Use Case renomeou 'data' para 'usuarios' conforme o seu return
        expect(resultado.usuarios).toHaveLength(2);
        expect(resultado.total).toBe(2);
        expect(resultado.pagina).toBe(1);
    });

    it('deve retornar uma lista vazia quando nenhum usuário for encontrado', async () => {
        mockUsuarioRepo.listar.mockResolvedValue({
            data: [],
            total: 0,
            pagina: 1,
            totalPaginas: 0
        } as any);

        const resultado = await useCase.execute(1, 10, {});

        expect(resultado.usuarios).toEqual([]);
        expect(resultado.total).toBe(0);
    });

    it('deve propagar erros do repositório', async () => {
        mockUsuarioRepo.listar.mockRejectedValue(new Error("Erro de banco de dados"));

        await expect(useCase.execute(1, 10, {}))
            .rejects.toThrow("Erro de banco de dados");
    });
});