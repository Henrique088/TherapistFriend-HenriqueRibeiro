// src/application/use-cases/usuario/BuscarUsuarioPorIdUseCase.test.ts

import { BuscarUsuarioPorIdUseCase } from './BuscarUsuarioPorIdUseCase';
import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { BuscarPorIdUsuarioDTO } from '../../dtos/UsuarioDTO'; // Certifique-se de ter criado este DTO

describe("BuscarUsuarioPorIdUseCase", () => {
    let sut: BuscarUsuarioPorIdUseCase;

    // Mock simplificado do repositório
    const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
        buscarPorId: jest.fn(),
        buscarPorEmail: jest.fn(),
        salvar: jest.fn(),
    } as any;

    const userId = 5;
    const fakeUsuarioData = { 
        id: userId, 
        nome: "Test User", 
        email: "test@id.com", 
        telefone: "11977776666",
        senha_hash: "secret_hash", 
        tipo_usuario: "paciente" as any, 
        ativo: true,
    };

    beforeEach(() => {
        sut = new BuscarUsuarioPorIdUseCase(mockUsuarioRepository);
        jest.clearAllMocks();
    });

    test("Deve retornar os dados limpos (JSON) se o ID existir", async () => {
        // Arrange
        const entity = new UsuarioEntity(fakeUsuarioData);
        mockUsuarioRepository.buscarPorId.mockResolvedValue(entity);

        // Entrada agora é um Objeto DTO
        const dto: BuscarPorIdUsuarioDTO = { id: userId };

        // Act
        const resultado = await sut.execute(dto);

        // Assert
        expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(userId);
        
        // Verifica se o resultado é o dado sanitizado
        expect(resultado).toEqual(expect.objectContaining({
            id: userId,
            nome: "Test User",
            email: "test@id.com"
        }));
        
       
        expect(resultado).not.toHaveProperty('senha_hash');
    });

    test("Deve lançar AppError 404 se o usuário não for encontrado", async () => {
        // Arrange
        mockUsuarioRepository.buscarPorId.mockResolvedValue(null);
        const dto: BuscarPorIdUsuarioDTO = { id: 999 };

        // Act & Assert
        await expect(sut.execute(dto))
            .rejects.toThrow('Usuário não encontrado');
            
        expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(999);
    });
});