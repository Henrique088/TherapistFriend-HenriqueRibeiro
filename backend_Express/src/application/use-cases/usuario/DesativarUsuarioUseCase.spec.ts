// src/application/use-cases/usuario/DesativarUsuarioUseCase.test.ts

import { DesativarUsuarioUseCase } from "./DesativarUsuarioUseCase";
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioEntity } from "../../../domain/entities/UsuarioEntity";
import { DesativarUsuarioDTO } from "../../dtos/UsuarioDTO";

describe("DesativarUsuarioUseCase", () => {
    let sut: DesativarUsuarioUseCase;

    // MOCK DO REPOSITÓRIO (Simplificado e tipado)
    const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
        buscarPorId: jest.fn(),
        salvar: jest.fn(),
        buscarPorEmail: jest.fn(),
        criar: jest.fn(),
        deletar: jest.fn(),
        iniciarTransacao: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
    } as any;

    const userId = 1;

    beforeEach(() => {
        sut = new DesativarUsuarioUseCase(mockUsuarioRepository);
        jest.clearAllMocks();
    });

    // ==============================
    // CAMINHO DE SUCESSO
    // ==============================
    test("Deve desativar o usuário com sucesso e retornar o status inativo", async () => {
        // Arrange
        const entity = new UsuarioEntity({
            id: userId,
            nome: "Usuario Ativo",
            email: "ativo@test.com",
            telefone: "11900001111",
            senha_hash: "hash",
            tipo_usuario: "paciente" as any,
            ativo: true
        });

        mockUsuarioRepository.buscarPorId.mockResolvedValue(entity);
        mockUsuarioRepository.salvar.mockImplementation(async (e) => e);

        // Entrada como objeto DTO
        const dto: DesativarUsuarioDTO = { id: userId };

        // Act
        const resultado = await sut.execute(dto);

        // Assert
        expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith(userId);
        
        // Verifica se o repositório salvou a entidade com status ativo: false
        expect(mockUsuarioRepository.salvar).toHaveBeenCalledWith(
            expect.objectContaining({ id: userId, ativo: false })
        );

        expect(resultado).toEqual({
            id: userId,
            ativo: false
        });
    });

    // ==============================
    // FALHA: USUÁRIO NÃO ENCONTRADO
    // ==============================
    test("Deve lançar AppError 404 se o usuário não for encontrado", async () => {
        // Arrange
        mockUsuarioRepository.buscarPorId.mockResolvedValue(null);
        const dto: DesativarUsuarioDTO = { id: 999 };

        // Act & Assert
        await expect(sut.execute(dto))
            .rejects.toThrow('Usuário não encontrado para desativação');
            
        expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    // ==============================
    // REGRA DE NEGÓCIO: JÁ INATIVO
    // ==============================
    test("Não deve chamar o repositório de salvar se o usuário já estiver inativo", async () => {
        // Arrange
        const entity = new UsuarioEntity({
            id: userId,
            nome: "Usuario Inativo",
            email: "inativo@test.com",
            telefone: "11900002222",
            senha_hash: "hash",
            tipo_usuario: "paciente" as any,
            ativo: false // Já começa inativo
        });

        mockUsuarioRepository.buscarPorId.mockResolvedValue(entity);

        // Act
        const resultado = await sut.execute({ id: userId });

        // Assert
        expect(resultado.ativo).toBe(false);
        expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });
});