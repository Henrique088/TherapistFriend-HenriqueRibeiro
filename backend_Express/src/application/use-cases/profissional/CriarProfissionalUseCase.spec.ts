// src/application/use-cases/profissional/CriarProfissionalUseCase.spec.ts

import { CriarProfissionalUseCase } from './CriarProfissionalUseCase';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import AppError from '../../errors/AppError';

describe('CriarProfissionalUseCase', () => {
    let sut: CriarProfissionalUseCase;
    let profissionalRepositoryMock: jest.Mocked<IProfissionalRepository>;

    beforeEach(() => {
        profissionalRepositoryMock = {
            criar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorUsuario: jest.fn(),
            atualizar: jest.fn(),
            vincularEspecialidades: jest.fn(),
            buscarComFiltros: jest.fn(),
            iniciarTransacao: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
        } as any;

        sut = new CriarProfissionalUseCase(profissionalRepositoryMock);
    });

    it('deve criar um registro de profissional com sucesso', async () => {
        // Arrange
        const idUsuario = 1;
        const mockEntity = {
            id: 10,
            id_usuario: idUsuario,
            validado: false,
            // toJSON: () => ({ id: 10, id_usuario: idUsuario, validado: false }) 
        };

        profissionalRepositoryMock.criar.mockResolvedValue(mockEntity as any);

        // Act
        const result = await sut.execute({ idUsuario });

        // Assert
        expect(profissionalRepositoryMock.criar).toHaveBeenCalledWith(
            expect.objectContaining({
                id_usuario: idUsuario,
                cpf: null,
                crp: null,
                bio: null,
                validado: false
            }),
            expect.any(Object)
        );
        expect(result).toEqual(mockEntity);
    });

    it('deve lançar erro se o ID do usuário não for fornecido', async () => {
        

        await expect(sut.execute({ idUsuario: 0 }))
            .rejects
            .toThrow(new AppError("ID do Usuário é obrigatório para criar um registro de Profissional.", 400));
    });

    it('deve repassar a transação para o repositório se fornecida', async () => {
        // Arrange
        const idUsuario = 1;
        const mockTransaction = { id: 'fake-transaction' };
        
        profissionalRepositoryMock.criar.mockResolvedValue({
            id: 10,
            id_usuario: idUsuario,
            validado: false
        } as any);
        
        // Act
        await sut.execute({ idUsuario }, mockTransaction);

        // Assert
        expect(profissionalRepositoryMock.criar).toHaveBeenCalledWith(
            expect.anything(),
            { transaction: mockTransaction }
        );
    });
});