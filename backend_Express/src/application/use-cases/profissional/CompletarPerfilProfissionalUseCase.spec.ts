// src/application/use-cases/Profissional/CompletarPerfilProfissionalUseCase.spec.ts

import { CompletarPerfilProfissionalUseCase } from './CompletarPerfilProfissionalUseCase';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import AppError from '../../errors/AppError';

describe('CompletarPerfilProfissionalUseCase', () => {
    let sut: CompletarPerfilProfissionalUseCase;
    let repositoryMock: jest.Mocked<IProfissionalRepository>;
    let transactionMock: any;

    const mockIdUsuario = 1;
    const mockDados = {
        cpf: '12345678901',
        crp: '06/1234',
        bio: 'Minha biografia profissional',
        especialidadesIds: [1, 2]
    };

    const mockProfissionalEntity = {
        id: 10,
        id_usuario: mockIdUsuario,
        completarDados: jest.fn(), // Mock do método da entidade
    };

    beforeEach(() => {
        transactionMock = { commit: jest.fn(), rollback: jest.fn() };
        
        repositoryMock = {
            buscarPorUsuario: jest.fn(),
            iniciarTransacao: jest.fn().mockResolvedValue(transactionMock),
            atualizar: jest.fn(),
            vincularEspecialidades: jest.fn(),
        } as any;

        sut = new CompletarPerfilProfissionalUseCase(repositoryMock);
    });

    it('deve completar o perfil profissional com sucesso', async () => {
        // GIVEN
        repositoryMock.buscarPorUsuario.mockResolvedValueOnce(mockProfissionalEntity as any); // Primeiro find
        repositoryMock.buscarPorUsuario.mockResolvedValueOnce({ ...mockProfissionalEntity, ...mockDados } as any); // Find final pós-commit

        // WHEN
        const result = await sut.execute(mockIdUsuario, mockDados);

        // THEN
        expect(repositoryMock.buscarPorUsuario).toHaveBeenCalledWith(mockIdUsuario);
        expect(mockProfissionalEntity.completarDados).toHaveBeenCalledWith(mockDados.cpf, mockDados.crp, mockDados.bio);
        expect(repositoryMock.atualizar).toHaveBeenCalledWith(mockProfissionalEntity, { transaction: transactionMock });
        expect(repositoryMock.vincularEspecialidades).toHaveBeenCalledWith(10, [1, 2], transactionMock);
        expect(transactionMock.commit).toHaveBeenCalled();
        expect(result).toHaveProperty('cpf', mockDados.cpf);
    });

    it('deve lançar erro se os dados forem inválidos (falha no Joi)', async () => {
        const dadosInvalidos = { ...mockDados, cpf: '123' }; // CPF muito curto

        await expect(sut.execute(mockIdUsuario, dadosInvalidos as any))
            .rejects
            .toBeInstanceOf(AppError);
        
        expect(repositoryMock.iniciarTransacao).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o profissional não existir', async () => {
        repositoryMock.buscarPorUsuario.mockResolvedValue(null);

        await expect(sut.execute(mockIdUsuario, mockDados))
            .rejects
            .toThrow(new AppError("Perfil profissional não encontrado para este usuário.", 404));
    });

    it('deve fazer rollback da transação em caso de erro na persistência', async () => {
        // GIVEN
        repositoryMock.buscarPorUsuario.mockResolvedValue(mockProfissionalEntity as any);
        repositoryMock.atualizar.mockRejectedValue(new Error("Erro de banco"));

        // WHEN
        await expect(sut.execute(mockIdUsuario, mockDados))
            .rejects
            .toThrow(AppError);

        // THEN
        expect(transactionMock.rollback).toHaveBeenCalled();
        expect(transactionMock.commit).not.toHaveBeenCalled();
    });
});