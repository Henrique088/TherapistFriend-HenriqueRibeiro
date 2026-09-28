// src/application/use-cases/paciente/BuscarPacientePorUsuarioIdUseCase.spec.ts

import { BuscarPacientePorUsuarioUseCase } from './BuscarPacientePorUsuarioUseCase';
import { IPacienteRepository } from '../../../../src/domain/repositories/IPacienteRepository';
import { PacienteEntity } from '../../../../src/domain/entities/PacienteEntity'; 
import {PacienteBuscarUsuarioDTO} from '../../dtos/PacienteDTO';

describe('BuscarPacientePorUsuarioIdUseCase', () => {
    let sut: BuscarPacientePorUsuarioUseCase;
    
    // Mock do Repositório (Tipado)
    const mockPacienteRepository: jest.Mocked<IPacienteRepository> = {
        buscarPorUsuarioId: jest.fn(), 
        criar: jest.fn(),
        buscarPorId: jest.fn(),
        salvar: jest.fn(),
        iniciarTransacao: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),    
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new BuscarPacientePorUsuarioUseCase(mockPacienteRepository);
    });

    // --- CENÁRIOS DE SUCESSO ---
    
    it('Deve retornar os dados limpos do Paciente quando encontrado', async () => {
        // Arrange
        const idUsuario = 1;
        const mockPacienteEntity = new PacienteEntity({ 
            id: 10, 
            idUsuario: idUsuario, 
            codinome: 'PacienteX',
            criadoEm: new Date(),
            atualizadoEm: new Date()
        });

        mockPacienteRepository.buscarPorUsuarioId.mockResolvedValue(mockPacienteEntity);

        const dto: PacienteBuscarUsuarioDTO = { idUsuario };

        // Act
        const result = await sut.execute(dto);

        // Assert
        expect(mockPacienteRepository.buscarPorUsuarioId).toHaveBeenCalledWith(idUsuario);
        
        expect(result).not.toBeInstanceOf(PacienteEntity);
        expect(result).toEqual(expect.objectContaining({
            idUsuario: 1,
            codinome: 'PacienteX'
        }));
    });
    
    it('Deve retornar null se nenhum paciente for encontrado para o ID de usuário', async () => {
        // Arrange
        const dto: PacienteBuscarUsuarioDTO = { idUsuario: 99 };
        mockPacienteRepository.buscarPorUsuarioId.mockResolvedValue(null);

        // Act
        const result = await sut.execute(dto);

        // Assert
        expect(result).toBeNull();
        expect(mockPacienteRepository.buscarPorUsuarioId).toHaveBeenCalledWith(99);
    });

    // --- CENÁRIOS DE FALHA ---
    
    it('Deve lançar erro se o idUsuario for inválido no DTO', async () => {
        // Arrange
        const dtoInvalido = { idUsuario: 0 };

        // Act & Assert
        await expect(sut.execute(dtoInvalido)).rejects.toThrow("ID de Usuário inválido.");
        expect(mockPacienteRepository.buscarPorUsuarioId).not.toHaveBeenCalled();
    });
});