// src/modules/professionals/application/use-cases/ListarProfissionalParaAdminUseCase.spec.ts

import { ListarProfissionalParaAdminUseCase } from './ListarProfissionaisParaAdminUseCase';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';

describe('ListarProfissionalParaAdminUseCase', () => {
  let listarProfissionalUseCase: ListarProfissionalParaAdminUseCase;
  let mockProfissionalRepo: jest.Mocked<IProfissionalRepository>;

  beforeEach(() => {
    mockProfissionalRepo = {
      listarProfissionaisParaAdmin: jest.fn(),
    } as any;

    listarProfissionalUseCase = new ListarProfissionalParaAdminUseCase(mockProfissionalRepo);
  });

  it('deve retornar uma lista paginada de profissionais para o admin', async () => {
    const dto = {
      page: 1,
      limit: 5,
      filtro: { nome: 'Dr. Silva', crp: '12345' }
    };

    const mockResponse = {
      dados: [
        { id: 1, nome: 'Dr. Silva', crp: '12345', especialidade: 'TCC', ativo: true }
      ],
      total: 1,
      pages: 1
    };

    mockProfissionalRepo.listarProfissionaisParaAdmin.mockResolvedValue(mockResponse as any);

    const resultado = await listarProfissionalUseCase.execute(dto);

    // Valida se os parâmetros de paginação e o objeto de filtro foram repassados corretamente
    expect(mockProfissionalRepo.listarProfissionaisParaAdmin).toHaveBeenCalledWith(
      1,
      5,
      expect.objectContaining({ nome: 'Dr. Silva', crp: '12345' })
    );

    expect(resultado).toEqual(mockResponse);
    expect(resultado.dados).toHaveLength(1);
  });

  it('deve retornar lista vazia e metadados zerados quando nenhum profissional for encontrado', async () => {
    mockProfissionalRepo.listarProfissionaisParaAdmin.mockResolvedValue({
      profissionais: [],
      total: 0,
      pages: 0
    } as any);

    const resultado = await listarProfissionalUseCase.execute({ page: 1, limit: 10 });

    expect(resultado.dados).toEqual(undefined);
    expect(resultado.total).toBe(0);
  });

  it('deve propagar erros caso o repositório falhe', async () => {
    mockProfissionalRepo.listarProfissionaisParaAdmin.mockRejectedValue(new Error("Database failure"));

    await expect(listarProfissionalUseCase.execute({ page: 1, limit: 10 }))
      .rejects.toThrow("Database failure");
  });
});