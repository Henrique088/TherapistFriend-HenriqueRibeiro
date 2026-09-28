// src/application/use-cases/pacientes/ListarPacienteParaAdminUseCase.spec.ts

import { ListarPacienteParaAdminUseCase } from './ListarPacienteParaAdminUseCase';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';

describe('ListarPacienteParaAdminUseCase', () => {
    let listarPacienteUseCase: ListarPacienteParaAdminUseCase;
    let mockPacienteRepo: jest.Mocked<IPacienteRepository>;

    beforeEach(() => {
        mockPacienteRepo = {
            listarPacienteParaAdmin: jest.fn(),
        } as any;

        listarPacienteUseCase = new ListarPacienteParaAdminUseCase(mockPacienteRepo);
    });

    it('deve retornar uma lista paginada de pacientes com metadados', async () => {
        const dto = {
            page: 1,
            limit: 10,
            filtro: { nome: 'Henrique' }
        };

        const mockResponse = {
            dados: [
                { id: 1, nome: 'Henrique Ribeiro', email: 'henrique@teste.com', ativo: true }
            ],
            total: 1,
            pages: 1
        };

        mockPacienteRepo.listarPacienteParaAdmin.mockResolvedValue(mockResponse as any);

        const resultado = await listarPacienteUseCase.execute(dto);

        // Verifica se o repositório recebeu os argumentos de paginação e o spread do filtro
        expect(mockPacienteRepo.listarPacienteParaAdmin).toHaveBeenCalledWith(
            1, 
            10, 
            { nome: 'Henrique' }
        );

        expect(resultado).toEqual(mockResponse);
        expect(resultado.dados).toHaveLength(1);
    });

    it('deve funcionar corretamente sem filtros opcionais', async () => {
        const dto = { page: 2, limit: 20 }; // filtro undefined

        mockPacienteRepo.listarPacienteParaAdmin.mockResolvedValue({
            pacientes: [],
            total: 0,
            pages: 0
        } as any);

        await listarPacienteUseCase.execute(dto);

        // O spread {...filtro} com filtro undefined resulta em um objeto vazio {}
        expect(mockPacienteRepo.listarPacienteParaAdmin).toHaveBeenCalledWith(2, 20, {});
    });

    it('deve propagar erros caso o repositório falhe na consulta', async () => {
        mockPacienteRepo.listarPacienteParaAdmin.mockRejectedValue(new Error("Erro de conexão"));

        await expect(listarPacienteUseCase.execute({ page: 1, limit: 10 }))
            .rejects.toThrow("Erro de conexão");
    });
});