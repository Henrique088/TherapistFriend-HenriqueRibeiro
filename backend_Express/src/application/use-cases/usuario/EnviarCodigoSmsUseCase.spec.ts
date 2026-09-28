// src/application/use-cases/usuario/EnviarCodigoSmsUseCase.spec.ts

import { EnviarCodigoSmsUseCase } from './EnviarCodigoSmsUseCase';
import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IQueueService } from '../../services/IQueueService';
import AppError from '../../errors/AppError';

describe('EnviarCodigoSmsUseCase', () => {
    let useCase: EnviarCodigoSmsUseCase;
    let mockValidacaoRepo: jest.Mocked<IValidacaoRepository>;
    let mockUsuarioRepo: jest.Mocked<IUsuarioRepository>;
    let mockQueueService: jest.Mocked<IQueueService>;

    beforeEach(() => {
        mockValidacaoRepo = { salvarCodigo: jest.fn() } as any;
        mockUsuarioRepo = { buscarPorEmail: jest.fn() } as any;
        mockQueueService = { addJob: jest.fn() } as any;

        useCase = new EnviarCodigoSmsUseCase(
            mockValidacaoRepo,
            mockUsuarioRepo,
            mockQueueService
        );

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('deve formatar o número de telefone e enfileirar o job de SMS corretamente', async () => {
        const usuarioMock = {
            id: 5,
            email: 'henrique@teste.com',
            telefone: '(11) 98888-7777',
            telefone_validado: false
        };

        mockUsuarioRepo.buscarPorEmail.mockResolvedValue(usuarioMock as any);

        await useCase.execute({ email: 'henrique@teste.com' });

        // Verifica a formatação do telefone (+55 + apenas números)
        expect(mockQueueService.addJob).toHaveBeenCalledWith(
            'sms-queue',
            'enviar_sms_verificacao',
            expect.objectContaining({
                to: '+5511988887777',
                message: expect.stringContaining('Seu código TherapistFriend:')
            })
        );

        // Verifica se salvou com o tempo de 15 minutos
        expect(mockValidacaoRepo.salvarCodigo).toHaveBeenCalledWith(
            5,
            expect.stringMatching(/^\d{6}$/),
            'SMS',
            15
        );
    });

    it('deve lançar erro se o usuário não possuir telefone cadastrado', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({
            id: 5,
            telefone: null,
            telefone_validado: false
        } as any);

        await expect(useCase.execute({ email: 'sem-tel@teste.com' }))
            .rejects.toEqual(new AppError('Telefone não cadastrado para este usuário', 400));
    });

    it('deve lançar erro se o telefone já tiver sido validado anteriormente', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({
            telefone: '11999999999',
            telefone_validado: true
        } as any);

        await expect(useCase.execute({ email: 'ja-validado@teste.com' }))
            .rejects.toEqual(new AppError('Telefone já verificado.', 400));
    });

    it('deve tratar falhas no serviço de fila sem interromper a execução', async () => {
        mockUsuarioRepo.buscarPorEmail.mockResolvedValue({
            id: 1,
            telefone: '11999998888',
            telefone_validado: false
        } as any);

        mockQueueService.addJob.mockRejectedValue(new Error("Queue Connection Timeout"));

        await expect(useCase.execute({ email: 'teste@teste.com' })).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalled();
    });
});