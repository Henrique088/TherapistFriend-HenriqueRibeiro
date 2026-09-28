// src/application/use-cases/usuario/AtualizarUsuarioUseCase.test.ts

import { AtualizarUsuarioUseCase } from './AtualizarUsuarioUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { AtualizarUsuarioDTO } from '../../dtos/UsuarioDTO';

// 1. MOCK DO REPOSITÓRIO
const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
    buscarPorId: jest.fn(),
    salvar: jest.fn(),
    buscarPorEmail: jest.fn(),
} as any;

describe("AtualizarUsuarioUseCase", () => {
    let sut: AtualizarUsuarioUseCase;

    // Dados base para os testes
    const userId = 1;
    const initialUserData = { 
        id: userId, 
        nome: "Antigo", 
        email: "antigo@email.com", 
        telefone: "11999999999",
        senha_hash: "old_hash", 
        tipo_usuario: "paciente" as any, 
        ativo: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new AtualizarUsuarioUseCase(mockUsuarioRepository);
    });

    // Helper para criar o DTO de entrada
    const makeDto = (overrides?: Partial<AtualizarUsuarioDTO>): AtualizarUsuarioDTO => ({
        id: userId,
        nome: "Novo Nome",
        ...overrides
    });

    it("Deve atualizar o nome do usuário com sucesso", async () => {
        // Arrange
        const initialEntity = new UsuarioEntity(initialUserData);
        mockUsuarioRepository.buscarPorId.mockResolvedValue(initialEntity);
        
        // Simula o salvamento retornando a própria entidade (que o Use Case modificou)
        mockUsuarioRepository.salvar.mockImplementation(async (entity) => entity);

        const dto = makeDto({ nome: "Novo Nome" });

        // Act
        const resultado = await sut.execute(dto);

        // Assert
        expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(userId);
        
        // Verifica se o repositório salvou a entidade com o nome novo
        expect(mockUsuarioRepository.salvar).toHaveBeenCalledWith(
            expect.objectContaining({ nome: "Novo Nome" })
        );

        expect(resultado.nome).toBe("Novo Nome");
        expect(resultado.id).toBe(userId);
    });

    it("Deve desativar o usuário se o campo ativo for passado como false", async () => {
        // Arrange
        const initialEntity = new UsuarioEntity(initialUserData);
        mockUsuarioRepository.buscarPorId.mockResolvedValue(initialEntity);
        mockUsuarioRepository.salvar.mockImplementation(async (entity) => entity);

        const dto = makeDto({ ativo: false });

        // Act
        const resultado = await sut.execute(dto);

        // Assert
        expect(resultado.ativo).toBe(false);
        expect(mockUsuarioRepository.salvar).toHaveBeenCalledWith(
            expect.objectContaining({ ativo: false })
        );
    });

    it("Deve lançar AppError 404 se o usuário não existir", async () => {
        // Arrange
        mockUsuarioRepository.buscarPorId.mockResolvedValue(null);
        const dto = makeDto();

        // Act & Assert
        await expect(sut.execute(dto))
            .rejects.toThrow('Usuário não encontrado');
            
        expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });
});