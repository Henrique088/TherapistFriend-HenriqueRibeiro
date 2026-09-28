// tests/unit/use-cases/paciente/CriarPacienteUseCase.test.ts

import { CriarPacienteUseCase } from './CriarPacienteUseCase';
import AppError from '../../errors/AppError';
import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { PacienteCriarDTO } from '../../dtos/PacienteDTO';

describe('CriarPacienteUseCase', () => {
    let sut: CriarPacienteUseCase;
    let mockPacienteRepository: jest.Mocked<IPacienteRepository>;

    const ID_USUARIO_FAKE = 123;

    beforeEach(() => {
        // Mock do Repositório (Tipado e Simplificado)
        mockPacienteRepository = {
            criar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorUsuarioId: jest.fn(),
            salvar: jest.fn(),
            iniciarTransacao: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
        } as any;

        sut = new CriarPacienteUseCase(mockPacienteRepository);
        jest.clearAllMocks();
    });

    // =================================================================
    // SUCESSO
    // =================================================================
    test('Deve criar um registro de Paciente com sucesso e retornar o JSON sanitizado', async () => {
        // Arrange
        const fakePacienteEntity = new PacienteEntity({
            id: 1,
            idUsuario: ID_USUARIO_FAKE,
            codinome: null,
            criadoEm: new Date(),
            atualizadoEm: new Date(),
        });

        mockPacienteRepository.criar.mockResolvedValue(fakePacienteEntity);

       
        const dto: PacienteCriarDTO = { idUsuario: ID_USUARIO_FAKE };
        const transactionToken = 'FAKE_TX_ID';

        // Act
        const result = await sut.execute(dto, transactionToken);

        // Assert
        // Verifica se o repositório foi chamado com o payload correto e a transação
        expect(mockPacienteRepository.criar).toHaveBeenCalledWith(
            expect.objectContaining({
                idUsuario: ID_USUARIO_FAKE,
                codinome: null,
            }),
            transactionToken
        );

        // Verifica se o retorno é um objeto puro (JSON) e não a classe bruta
        expect(result).not.toBeInstanceOf(PacienteEntity);
        expect(result).toEqual(expect.objectContaining({
            idUsuario: ID_USUARIO_FAKE,
            id: 1
        }));
    });

    // =================================================================
    // FALHA
    // =================================================================
    test('Deve lançar AppError 400 se o idUsuario estiver ausente no DTO', async () => {
        // Arrange
        const dtoInvalido = { idUsuario: undefined as any };

        // Act & Assert
        await expect(sut.execute(dtoInvalido))
            .rejects.toThrow("ID do Usuário é obrigatório para criar um registro de Paciente.");
        
        expect(mockPacienteRepository.criar).not.toHaveBeenCalled();
    });

    test('Deve propagar erro se o repositório falhar', async () => {
        // Arrange
        mockPacienteRepository.criar.mockRejectedValue(new Error("Database error"));
        const dto: PacienteCriarDTO = { idUsuario: ID_USUARIO_FAKE };

        // Act & Assert
        await expect(sut.execute(dto)).rejects.toThrow("Database error");
    });
});