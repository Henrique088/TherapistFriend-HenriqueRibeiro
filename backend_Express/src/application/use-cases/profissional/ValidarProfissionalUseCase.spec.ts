// src/modules/professionals/application/use-cases/ValidarProfissionalUseCase.spec.ts

import { ValidarProfissionalUseCase } from './ValidarProfissionalUseCase';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { IHistoricoValidacaoRepository } from '../../../domain/repositories/IHistoricoValidacao';
import AppError from '../../errors/AppError';

describe('ValidarProfissionalUseCase', () => {
  let validarUseCase: ValidarProfissionalUseCase;
  let mockProfissionalRepo: jest.Mocked<IProfissionalRepository>;
  let mockHistoricoRepo: jest.Mocked<IHistoricoValidacaoRepository>;

  beforeEach(() => {
    mockProfissionalRepo = {
      buscarPorUsuarioId: jest.fn(),
      validarProfissional: jest.fn(),
    } as any;

    mockHistoricoRepo = {
      save: jest.fn(),
    } as any;

    validarUseCase = new ValidarProfissionalUseCase(mockProfissionalRepo, mockHistoricoRepo);
  });

  it('deve validar um profissional e registrar no histórico com sucesso', async () => {
    const profissionalMock = {
      id: 1,
      validar: jest.fn(),
    };

    mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(profissionalMock as any);

    const dto = {
      profissionalId: 1,
      adminId: 10,
      status: 'validado' as const,
      motivo: 'Documentação CRP conferida'
    };

    await validarUseCase.execute(dto);

    // Verificações de lógica de domínio e persistência
    expect(profissionalMock.validar).toHaveBeenCalledWith(10);
    expect(mockProfissionalRepo.validarProfissional).toHaveBeenCalledWith(profissionalMock);
    
    // Verificação de Auditoria
    expect(mockHistoricoRepo.save).toHaveBeenCalledWith({
      profissional_id: 1,
      admin_id: 10,
      status: 'validado',
      motivo: 'Documentação CRP conferida',
    });
  });

  it('deve revogar um profissional quando o status for diferente de validado', async () => {
    const profissionalMock = {
      id: 1,
      revogar: jest.fn(),
    };

    mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(profissionalMock as any);

    const dto = {
      profissionalId: 1,
      adminId: 10,
      status: 'revogado' as const,
      motivo: 'CRP Inválido'
    };

    await validarUseCase.execute(dto);

    expect(profissionalMock.revogar).toHaveBeenCalledWith(10);
    expect(mockHistoricoRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'revogado',
        motivo: 'CRP Inválido'
    }));
  });

  it('deve lançar erro se o profissional não for encontrado', async () => {
    mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(validarUseCase.execute({ 
        profissionalId: 999, 
        adminId: 1, 
        status: 'validado' 
    })).rejects.toEqual(new AppError("Profissional não encontrado."));
    
    expect(mockProfissionalRepo.validarProfissional).not.toHaveBeenCalled();
    expect(mockHistoricoRepo.save).not.toHaveBeenCalled();
  });

  it('deve usar motivo padrão caso nenhum seja fornecido', async () => {
    const profissionalMock = { id: 1, validar: jest.fn() };
    mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(profissionalMock as any);

    await validarUseCase.execute({ 
        profissionalId: 1, 
        adminId: 10, 
        status: 'validado' 
        // motivo omitido
    });

    expect(mockHistoricoRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        motivo: 'Sem motivo especificado'
    }));
  });
});