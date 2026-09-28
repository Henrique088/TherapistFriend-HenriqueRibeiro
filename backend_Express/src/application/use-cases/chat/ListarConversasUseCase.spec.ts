// src/application/use-cases/chat/ListarConversasUseCase.spec.ts

import { ListarConversasUseCase } from './ListarConversasUseCase';
import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { ConversaEntity } from '../../../domain/entities/ConversaEntity';

describe('ListarConversasUseCase', () => {
    let listarConversasUseCase: ListarConversasUseCase;
    let mockConversaRepo: jest.Mocked<IConversaRepository>;

    beforeEach(() => {
        mockConversaRepo = {
            buscarConversas: jest.fn(),
        } as any;

        listarConversasUseCase = new ListarConversasUseCase(mockConversaRepo);
    });

    it('deve retornar uma lista de conversas para o usuário informado', async () => {
        const usuarioId = 10;
        
        // Simulando retorno de entidades de conversa
        const conversasMock = [
            new ConversaEntity({ pacienteId: 10, profissionalId: 20, relato_id_origem: 1, status: 'ativa' }),
            new ConversaEntity({ pacienteId: 30, profissionalId: 10, relato_id_origem: 1, status: 'ativa' })
        ];

        mockConversaRepo.buscarConversas.mockResolvedValue(conversasMock);

        const resultado = await listarConversasUseCase.execute({ usuarioId });

        expect(mockConversaRepo.buscarConversas).toHaveBeenCalledWith(usuarioId);
        expect(resultado).toHaveLength(2);
        expect(resultado).toEqual(conversasMock);
    });

    it('deve retornar null ou lista vazia quando o usuário não tiver conversas', async () => {
        mockConversaRepo.buscarConversas.mockResolvedValue(null);

        const resultado = await listarConversasUseCase.execute({ usuarioId: 999 });

        expect(resultado).toBeNull();
    });

    it('deve propagar erros do repositório', async () => {
        mockConversaRepo.buscarConversas.mockRejectedValue(new Error("Erro interno no banco"));

        await expect(listarConversasUseCase.execute({ usuarioId: 1 }))
            .rejects.toThrow("Erro interno no banco");
    });
});