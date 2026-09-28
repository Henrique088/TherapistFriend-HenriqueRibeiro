// src/application/use-cases/usuario/CriarUsuarioUseCase.test.ts

import { CriarUsuarioUseCase } from './CriarUsuarioUseCase';
import { Sequelize } from 'sequelize';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ICriptografiaService } from '../../../domain/services/ICriptografiaService';
import { UsuarioEntity } from '../../../domain/entities/UsuarioEntity';
import { IEntidadeRelacionadaFactory } from '../../factories/IEntidadeRelacionadaFactory';
import { UsuarioRegistroDTO } from '../../dtos/UsuarioDTO';

describe("CriarUsuarioUseCase", () => {
    let sut: CriarUsuarioUseCase;

    // MOCKS DE DEPENDÊNCIAS
    const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
        buscarPorEmail: jest.fn(),
        buscarPorTelefone: jest.fn(),
        criar: jest.fn(),
        iniciarTransacao: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        buscarPorId: jest.fn(),
        salvar: jest.fn(),
        deletar: jest.fn(),
    } as any;

    const mockDetalhesFactory: jest.Mocked<IEntidadeRelacionadaFactory> = {
        criarDetalhes: jest.fn(),
    };

    const mockCriptografiaService: jest.Mocked<ICriptografiaService> = {
        hash: jest.fn(),
        comparar: jest.fn(),
    };

    const mockSequelize: jest.Mocked<Sequelize> = {
        transaction: jest.fn(),
    } as any;

    // DADOS DE TESTE
    const userData: UsuarioRegistroDTO = {
        nome: "Henrique",
        email: "test@test.com",
        telefone: '11999999999',
        senha: "password123",
        tipo_usuario: "paciente",
        ativo: true
    };

    const TRANSACTION_TOKEN = 'FAKE_TX_ID';

    beforeEach(() => {
        jest.clearAllMocks();
        sut = new CriarUsuarioUseCase(
            mockUsuarioRepository,
            mockDetalhesFactory,
            mockCriptografiaService,
            mockSequelize
            
        );

        // Configurações padrão de sucesso
        mockCriptografiaService.hash.mockResolvedValue("hashed_pwd");
        mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
        mockUsuarioRepository.iniciarTransacao.mockResolvedValue(TRANSACTION_TOKEN);
    });

    // ==============================
    // CAMINHO DE SUCESSO
    // ==============================
    test("Deve criar usuário e detalhes com sucesso usando transação", async () => {
        // Arrange
        const createdUser = new UsuarioEntity({
            id: 1,
            nome: userData.nome,
            email: userData.email,
            telefone: userData.telefone,
            senha_hash: "hashed_pwd",
            tipo_usuario: userData.tipo_usuario,
            ativo: true
        });

        mockUsuarioRepository.criar.mockResolvedValue(createdUser);
        mockDetalhesFactory.criarDetalhes.mockResolvedValue({ id: 100, detalhes: "Paciente OK" });

        // Act
        const resultado = await sut.execute(userData);

        // Assert
        // Verificações de Orquestração
        expect(mockUsuarioRepository.iniciarTransacao).toHaveBeenCalled();
        expect(mockCriptografiaService.hash).toHaveBeenCalledWith(userData.senha);

        // Verificação da Transação sendo repassada
        expect(mockUsuarioRepository.criar).toHaveBeenCalledWith(
            expect.objectContaining({
                nome: userData.nome,
                email: userData.email,
                tipo_usuario: userData.tipo_usuario
            }),
            TRANSACTION_TOKEN
        );
        expect(mockDetalhesFactory.criarDetalhes).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1 }),
            TRANSACTION_TOKEN
        );

        // Verificação do Commit
        expect(mockUsuarioRepository.commit).toHaveBeenCalledWith(TRANSACTION_TOKEN);

        // expect(resultado).toHaveProperty('usuario');
        expect(resultado).toEqual({
            id: 1,
            nome: 'Henrique',
            email: 'test@test.com',
            telefone: '11999999999',
            tipo_usuario: 'paciente',
            verificado_email: false,
            verificado_telefone: false,
            ativo: true,
            data_cadastro: null,
            entidadeRelacionada: {
                id: 100,
                detalhes: 'Paciente OK'
            }
        });
        expect(resultado).toHaveProperty('entidadeRelacionada');
    });

    // ==============================
    // CAMINHO DE FALHA (ROLLBACK)
    // ==============================
    test("Deve fazer rollback se a criação dos detalhes falhar", async () => {
        // Arrange
        const createdUser = new UsuarioEntity({ id: 1, ...userData, senha_hash: "hash", ativo: true } as any);
        mockUsuarioRepository.criar.mockResolvedValue(createdUser);

        const erroTransacional = new Error("Falha no Banco");
        mockDetalhesFactory.criarDetalhes.mockRejectedValue(erroTransacional);

        // Act & Assert
        await expect(sut.execute(userData)).rejects.toThrow();

        // Garante que o Rollback foi chamado com o token correto
        expect(mockUsuarioRepository.rollback).toHaveBeenCalledWith(TRANSACTION_TOKEN);
        expect(mockUsuarioRepository.commit).not.toHaveBeenCalled();
    });

    test("Deve lançar erro 409 se o email já estiver em uso", async () => {
        // Arrange
        mockUsuarioRepository.buscarPorEmail.mockResolvedValue(new UsuarioEntity({} as any));

        // Act & Assert
        await expect(sut.execute(userData)).rejects.toThrow('E-mail já registrado');

        // Não deve nem iniciar transação se o e-mail já existe
        expect(mockUsuarioRepository.iniciarTransacao).not.toHaveBeenCalled();
    });
});