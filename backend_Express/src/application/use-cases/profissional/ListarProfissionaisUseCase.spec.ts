// src/application/use-cases/profissional/ListarProfissionaisUseCase.spec.ts

import { ListarProfissionalUseCase } from '../../../../src/application/use-cases/profissional/ListarProfissionaisUseCase';
import { IProfissionalRepository } from '../../../../src/domain/repositories/IProfissionalRepository';
import { ProfissionalEntity } from '../../../../src/domain/entities/ProfissionalEntity';
import AppError from '../../../../src/application/errors/AppError';

describe('ListarProfissionalUseCase', () => {
  let sut: ListarProfissionalUseCase;
  let profissionalRepositoryMock: jest.Mocked<IProfissionalRepository>;

  // Mock de uma entidade para o retorno
  const mockProfissional = new ProfissionalEntity({
    id: 1,
    id_usuario: 10,
    nome: 'Dr. Teste',
    email: 'teste@exemplo.com',
    cpf: '12345678900',
    crp: '06/12345',
    bio: 'Bio de teste',
    validado: true,
    especialidades: [],
    status: 'pendente',
    criado_em: new Date(),
    atualizado_em: new Date(),
  });

  beforeEach(() => {
    profissionalRepositoryMock = {
      buscarComFiltros: jest.fn(),
    } as any;

    sut = new ListarProfissionalUseCase(profissionalRepositoryMock);
  });

  it('deve listar profissionais com sucesso e retornar os dados formatados', async () => {
    // Arrange: Prepara o mock para retornar dados fakes
    profissionalRepositoryMock.buscarComFiltros.mockResolvedValue({
      data: [mockProfissional],
      total: 1,
      pagina: 1,
      totalPaginas: 1,
    });

    const params = { page: 1, limit: 10, nome: 'Teste' };

    // Act: Executa o caso de uso
    const result = await sut.execute(params);

    // Assert: Verifica se o repositório foi chamado corretamente
    expect(profissionalRepositoryMock.buscarComFiltros).toHaveBeenCalledWith({
      pagina: 1,
      limite: 10,
      nome: 'Teste',
      especialidade: undefined,
    });

    // Verifica o formato da resposta
    expect(result).toEqual({
      data: [mockProfissional],
      total: 1,
      pagina_atual: 1,
      paginas_totais: 1,
    });
  });

  it('deve garantir que a página mínima seja 1 mesmo que o input seja menor', async () => {
    profissionalRepositoryMock.buscarComFiltros.mockResolvedValue({
      data: [],
      total: 0,
      pagina: 1,
      totalPaginas: 0,
    });

    // Chamada com página 0 ou negativa
    await sut.execute({ page: -5, limit: 10 });

    expect(profissionalRepositoryMock.buscarComFiltros).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1 })
    );
  });

  it('deve lançar um AppError quando o repositório falhar', async () => {
    // Arrange: Faz o repositório lançar um erro
    profissionalRepositoryMock.buscarComFiltros.mockRejectedValue(new Error('DB Error'));

    // Act & Assert
    await expect(sut.execute({ page: 1, limit: 10 }))
      .rejects.toThrow(AppError);
    
    await expect(sut.execute({ page: 1, limit: 10 }))
      .rejects.toThrow('Erro ao listar profissionais: DB Error');
  });
});