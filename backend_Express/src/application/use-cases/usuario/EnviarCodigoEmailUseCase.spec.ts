// src/application/use-cases/usuario/EnviarCodigoEmailUseCase.spec.ts

import { EnviarCodigoEmailUseCase } from './EnviarCodigoEmailUseCase';
import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IQueueService } from '../../services/IQueueService';
import AppError from '../../errors/AppError';

describe('EnviarCodigoEmailUseCase', () => {
    let useCase: EnviarCodigoEmailUseCase;
    let mockValidacaoRepo: jest.Mocked<IValidacaoRepository>;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockQueueService: jest.Mocked<IQueueService>;

    beforeEach(() => {
        mockValidacaoRepo = { salvarCodigo: jest.fn() } as any;
        mockUsuarioRepo = { buscarPorEmail: jest.fn() } as any;
        mockQueueService = { addJob: jest.fn() } as any;

        useCase = new EnviarCodigoEmailUseCase(
            mockValidacaoRepo,
            mockUsuarioRepo,
            mockQueueService
        );

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deve gerar um código, salvar no repositório e adicionar à fila de e-mail', async () => {
        const usuarioMock = {
            id: 1,
            nome: 'Henrique',
            email: 'teste@teste.com',
            email_validado: false
        };

        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioMock as any);

        await useCase.execute({ email: 'teste@teste.com' });

        // Verifica se o código de 6 dígitos foi salvo (Regex para conferir se é string de 6 números)
        expect(mockValidacaoRepo.salvarCodigo).toHaveBeenCalledWith(
            1,
            expect.stringMatching(/^\d{6}$/),
            'EMAIL',
            30
        );

        // Verifica se o job foi para a fila correta
        expect(mockQueueService.addJob).toHaveBeenCalledWith(
            'email-queue',
            'enviar_email_verificacao',
            expect.objectContaining({
                to: 'teste@teste.com',
                subject: expect.stringContaining('Código de Verificação')
            })
        );
    });

    it('deve lançar erro 404 se o usuário não for encontrado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(null);

        await expect(useCase.execute({ email: 'inexistente@email.com' }))
            .rejects.toEqual(new AppError('Usuário não encontrado.', 404));
        
        expect(mockValidacaoRepo.salvarCodigo).not.toHaveBeenCalled();
    });

    it('deve lançar erro 400 se o e-mail já estiver validado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({
            email_validado: true
        } as any);

        await expect(useCase.execute({ email: 'ja_validado@email.com' }))
            .rejects.toEqual(new AppError('Email já verificado.', 400));
    });

    it('deve capturar erro da fila sem interromper o fluxo do caso de uso', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({
            id: 1,
            nome: 'User',
            email: 'user@email.com',
            email_validado: false
        } as any);

        mockQueueService.addJob.mockRejectedValue(new Error("Redis offline"));

        // Não deve dar throw, pois o catch interno trata
        await expect(useCase.execute({ email: 'user@email.com' })).resolves.not.toThrow();
        
        expect(console.error).toHaveBeenCalledWith(
            "Erro ao enfileirar Email:", 
            expect.any(Error)
        );
    });
});