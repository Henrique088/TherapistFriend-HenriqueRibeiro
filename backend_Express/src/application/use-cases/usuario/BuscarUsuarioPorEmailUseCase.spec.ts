// src/application/use-cases/usuario/BuscarUsuarioPorEmailUseCase.test.ts

import { BuscarUsuarioPorEmailUseCase } from './BuscarUsuarioPorEmailUseCase';
import AppError from '../../errors/AppError';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { BuscarPorEmailUsuarioDTO } from '../../dtos/UsuarioDTO';

describe("BuscarUsuarioPorEmailUseCase", () => {
    let sut: BuscarUsuarioPorEmailUseCase;
    
    // Mock do Repositório (simplificado com jest.mocked)
    const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
        buscarPorEmail: jest.fn(),
        buscarPorId: jest.fn(),
        salvar: jest.fn(),
    } as any;

    const userEmail = "busca@email.com";
    const fakeUsuarioData = {
        id: 10, 
        nome: "Email Finder", 
        email: userEmail, 
        telefone: "11988887777",
        senha_hash: "hashed123", 
        tipo_usuario: "paciente" as any, 
        ativo: true,
    };

    beforeEach(() => {
        sut = new BuscarUsuarioPorEmailUseCase(mockUsuarioRepository);
        jest.clearAllMocks();
    });

    test("Deve retornar os dados limpos do usuário se o email existir", async () => {
        // Arrange
        const fakeUsuarioEntity = new UsuarioEntity(fakeUsuarioData);
        mockUsuarioRepository.buscarPorEmail.mockResolvedValue(fakeUsuarioEntity);

        
        const dto: BuscarPorEmailUsuarioDTO = { email: userEmail };

        // Act
        const resultado = await sut.execute(dto);

        // Assert
        expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith(userEmail);
        
       
        expect(resultado.email).toBe(userEmail);
        expect(resultado.id).toBe(10);
        expect(resultado).not.toHaveProperty('senha_hash');
    });

    test("Deve lançar AppError 404 se o usuário não for encontrado", async () => {
        // Arrange
        mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
        const dto: BuscarPorEmailUsuarioDTO = { email: "naoexiste@test.com" };

        // Act & Assert
        await expect(sut.execute(dto))
            .rejects.toThrow('Usuário não encontrado');

        expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith(dto.email);
    });
});