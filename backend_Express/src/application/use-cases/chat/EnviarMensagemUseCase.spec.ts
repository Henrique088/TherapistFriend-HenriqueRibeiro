// src/application/use-cases/chat/EnviarMensagemUseCase.spec.ts

import { EnviarMensagemUseCase } from './EnviarMensagemUseCase';
import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { MensagemEntity } from '../../../domain/entities/MensagemEntity';
import AppError from '../../errors/AppError';

describe('EnviarMensagemUseCase', () => {
    let enviarMensagemUseCase: EnviarMensagemUseCase;
    let mockMensagemRepo: jest.Mocked<IMensagemRepository>;
    let mockConversaRepo: jest.Mocked<IConversaRepository>;
    let mockEventDispatcher: jest.Mocked<EventDispatcherInterface>;

    beforeEach(() => {
        mockMensagemRepo = { salvar: jest.fn() } as any;
        mockConversaRepo = { buscarPorId: jest.fn() } as any;
        mockEventDispatcher = { notify: jest.fn() } as any;

        enviarMensagemUseCase = new EnviarMensagemUseCase(
            mockMensagemRepo,
            mockConversaRepo,
            mockEventDispatcher
        );
    });

    it('deve enviar uma mensagem com sucesso, salvar no banco e disparar evento', async () => {
        const conversaId = 100;
        const remetenteId = 10; // Paciente
        const profissionalId = 20;

        const conversaMock = {
            props: { pacienteId: remetenteId, profissionalId: profissionalId },
            getDestinatarioId: jest.fn().mockReturnValue(profissionalId)
        };

        const mensagemMock = new MensagemEntity({
            conversaId,
            remetenteId,
            conteudo: 'Olá, doutor!',
            lida: false
        });

        mockConversaRepo.buscarPorId.mockResolvedValue(conversaMock as any);
        mockMensagemRepo.salvar.mockResolvedValue(mensagemMock);

        const resultado = await enviarMensagemUseCase.execute({
            conversaId,
            remetenteId,
            texto: 'Olá, doutor!'
        });

        expect(mockMensagemRepo.salvar).toHaveBeenCalledWith(expect.any(MensagemEntity));
        expect(conversaMock.getDestinatarioId).toHaveBeenCalledWith(remetenteId);
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
        expect(resultado.texto).toBe('Olá, doutor!');
    });

    it('deve lançar erro 403 se o remetente não pertencer à conversa', async () => {
        mockConversaRepo.buscarPorId.mockResolvedValue({
            props: { pacienteId: 1, profissionalId: 2 },
        } as any);

        const dados = { conversaId: 100, remetenteId: 999, texto: 'Invasão' };

        await expect(enviarMensagemUseCase.execute(dados))
            .rejects.toEqual(new AppError('Você não tem permissão para enviar mensagens nesta conversa.', 403));

        expect(mockMensagemRepo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 se a conversa não existir', async () => {
        mockConversaRepo.buscarPorId.mockResolvedValue(null);

        await expect(enviarMensagemUseCase.execute({
            conversaId: 1,
            remetenteId: 10,
            texto: 'Oi'
        })).rejects.toEqual(new AppError('Conversa não encontrada.', 404));
    });

    it('deve garantir que o destinatárioId no evento seja o oposto do remetente', async () => {
        // Cenário: Profissional (20) enviando para Paciente (10)
        const conversaMock = {
            props: { pacienteId: 10, profissionalId: 20 },
            getDestinatarioId: (id: number) => (id === 20 ? 10 : 20)
        };

        mockConversaRepo.buscarPorId.mockResolvedValue(conversaMock as any);

        const mensagemMock = new MensagemEntity({
            conversaId: 1,
            remetenteId: 20,
            conteudo: 'Oi',
            lida: false
        });

        mockMensagemRepo.salvar.mockResolvedValue(mensagemMock);

        await enviarMensagemUseCase.execute({ conversaId: 1, remetenteId: 20, texto: 'Oi' });

        // Ajustado de "payload" para "eventData" conforme o erro mostrou
        expect(mockEventDispatcher.notify).toHaveBeenCalledWith(
            expect.objectContaining({
                eventData: expect.objectContaining({
                    destinatarioId: 10
                })
            })
        );
    });
});