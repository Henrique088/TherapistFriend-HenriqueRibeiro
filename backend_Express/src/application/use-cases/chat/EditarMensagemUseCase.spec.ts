// src/application/use-cases/chat/EditarMensagemUseCase.spec.ts

import { EditarMensagemUseCase } from './EditarMensagemUseCase';
import { IMensagemRepository } from '../../../domain/repositories/IMensagemRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import AppError from '../../errors/AppError';

describe('EditarMensagemUseCase', () => {
    let editarMensagemUseCase: EditarMensagemUseCase;
    let mockMensagemRepo: jest.Mocked<IMensagemRepository>;
    let mockEventDispatcher: jest.Mocked<EventDispatcherInterface>;

    beforeEach(() => {
        mockMensagemRepo = {
            buscarPorId: jest.fn(),
            atualizarTexto: jest.fn(),
        } as any;

        mockEventDispatcher = {
            notify: jest.fn(),
        } as any;

        editarMensagemUseCase = new EditarMensagemUseCase(mockMensagemRepo, mockEventDispatcher);
    });

    it('deve editar uma mensagem com sucesso e disparar o evento', async () => {
        const mensagemMock = {
            id: 1,
            remetenteId: 10,
            conversaId: 100,
            podeDeletar: jest.fn(), // Simula que a regra de tempo passou
        };

        mockMensagemRepo.buscarPorId.mockResolvedValue(mensagemMock as any);

        const dados = {
            mensagemId: 1,
            usuarioId: 10,
            novoTexto: 'Texto atualizado'
        };

        await editarMensagemUseCase.execute(dados);

        expect(mensagemMock.podeDeletar).toHaveBeenCalled();
        expect(mockMensagemRepo.atualizarTexto).toHaveBeenCalledWith(1, 'Texto atualizado');
        expect(mockEventDispatcher.notify).toHaveBeenCalled();
    });

    it('deve lançar erro 403 se o usuário não for o remetente da mensagem', async () => {
        mockMensagemRepo.buscarPorId.mockResolvedValue({
            id: 1,
            remetenteId: 99, // Outro usuário
        } as any);

        const dados = { mensagemId: 1, usuarioId: 10, novoTexto: 'Hack' };

        await expect(editarMensagemUseCase.execute(dados))
            .rejects.toEqual(new AppError('Não autorizado', 403));
        
        expect(mockMensagemRepo.atualizarTexto).not.toHaveBeenCalled();
    });

    it('deve falhar se a regra de tempo (5 minutos) for violada na entidade', async () => {
        const mensagemMock = {
            id: 1,
            remetenteId: 10,
            podeDeletar: jest.fn().mockImplementation(() => {
                throw new AppError('Tempo limite para edição excedido', 400);
            }),
        };

        mockMensagemRepo.buscarPorId.mockResolvedValue(mensagemMock as any);

        const dados = { mensagemId: 1, usuarioId: 10, novoTexto: 'Tarde demais' };

        await expect(editarMensagemUseCase.execute(dados))
            .rejects.toThrow('Tempo limite para edição excedido');
        
        expect(mockMensagemRepo.atualizarTexto).not.toHaveBeenCalled();
    });

    it('deve lançar erro 404 se a mensagem não existir', async () => {
        mockMensagemRepo.buscarPorId.mockResolvedValue(null);

        await expect(editarMensagemUseCase.execute({ 
            mensagemId: 999, 
            usuarioId: 1, 
            novoTexto: 'Oi' 
        })).rejects.toEqual(new AppError('Mensagem não encontrada', 404));
    });
});