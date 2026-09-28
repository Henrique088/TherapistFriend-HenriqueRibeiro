// src/application/use-cases/chat/ListarMensagensUseCase.spec.ts

import { ListarMensagensUseCase } from './ListarMensagensUseCase';
import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import AppError from '../../errors/AppError';

describe('ListarMensagensUseCase', () => {
    let useCase: ListarMensagensUseCase;
    let mockMensagemRepo: jest.Mocked<IMensagemRepository>;
    let mockConversaRepo: jest.Mocked<IConversaRepository>;

    const conversaIdMock = 1;
    const usuarioIdMock = 10;

    beforeEach(() => {
        mockMensagemRepo = { buscarPorConversa: jest.fn() } as any;
        mockConversaRepo = { buscarPorId: jest.fn() } as any;

        useCase = new ListarMensagensUseCase(mockMensagemRepo, mockConversaRepo);
    });

    it('deve listar mensagens usando cursor (data) corretamente', async () => {
        const dataCursor = '2026-03-25T10:00:00.000Z';
        const conversaMock = {
            id: conversaIdMock,
            pacienteId: usuarioIdMock,
            profissionalId: 20
        };

        const mensagensMock = [
            { id: 1, texto: 'Olá', criadoEm: new Date() },
            { id: 2, texto: 'Como vai?', criadoEm: new Date() }
        ];

        mockConversaRepo.buscarPorId.mockResolvedValue(conversaMock as any);
        mockMensagemRepo.buscarPorConversa.mockResolvedValue(mensagensMock as any);

        const resultado = await useCase.execute({
            conversaId: conversaIdMock,
            usuarioId: usuarioIdMock,
            limit: 20,
            cursor: new Date(dataCursor)
        });

        // Verifica se a string do cursor foi convertida para Date
        expect(mockMensagemRepo.buscarPorConversa).toHaveBeenCalledWith(
            conversaIdMock,
            20,
            new Date(dataCursor)
        );
        expect(resultado).toHaveLength(2);
    });

    it('deve usar o limite padrão de 50 quando nenhum for informado', async () => {
        mockConversaRepo.buscarPorId.mockResolvedValue({
            id: conversaIdMock,
            pacienteId: usuarioIdMock
        } as any);

        await useCase.execute({
            conversaId: conversaIdMock,
            usuarioId: usuarioIdMock
        });

        expect(mockMensagemRepo.buscarPorConversa).toHaveBeenCalledWith(
            conversaIdMock,
            50, // Default definido no use case
            undefined
        );
    });

    it('deve lançar erro 403 se o usuário não pertencer à conversa', async () => {
        mockConversaRepo.buscarPorId.mockResolvedValue({
            id: conversaIdMock,
            pacienteId: 999, // Outro usuário
            profissionalId: 888 // Outro profissional
        } as any);

        const exec = useCase.execute({
            conversaId: conversaIdMock,
            usuarioId: usuarioIdMock // Usuário tentando bisbilhotar
        });

        await expect(exec).rejects.toEqual(new AppError('Você não tem permissão para ver estas mensagens.', 403));
        expect(mockMensagemRepo.buscarPorConversa).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 se a conversa não existir', async () => {
        mockConversaRepo.buscarPorId.mockResolvedValue(null);

        const exec = useCase.execute({
            conversaId: 52,
            usuarioId: 1
        });

        await expect(exec).rejects.toEqual(new AppError('Conversa não encontrada.', 404));
    });
});