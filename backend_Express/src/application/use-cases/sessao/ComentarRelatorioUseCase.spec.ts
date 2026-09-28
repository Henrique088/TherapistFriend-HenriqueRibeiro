// src/application/use-cases/sessao/ComentarRelatorioUseCase.spec.ts

import { ComentarRelatorioUseCase } from './ComentarRelatorioUseCase';
import { ISessionReportRepository } from '../../../domain/repositories/ISessionReportRepository';
import AppError from '../../errors/AppError';

describe('ComentarRelatorioUseCase', () => {
    let useCase: ComentarRelatorioUseCase;
    let mockRepo: jest.Mocked<ISessionReportRepository>;

    const dadosMock = {
        sessaoId: 'relatorio-uuid-123',
        profissionalId: 10,
        comentario: 'O paciente apresentou melhora na regulação emocional.'
    };

    beforeEach(() => {
        mockRepo = {
            buscarPorId: jest.fn(),
            atualizarComentario: jest.fn(),
        } as any;

        useCase = new ComentarRelatorioUseCase(mockRepo);
    });

    it('deve atualizar o comentário do relatório com sucesso', async () => {
        const relatorioMock = {
            id: 'relatorio-uuid-123',
            profissional_id: 10,
            editarComentario: jest.fn(), // Regra de domínio
        };

        mockRepo.buscarPorId.mockResolvedValue(relatorioMock as any);
        mockRepo.atualizarComentario.mockResolvedValue(relatorioMock as any);

        const resultado = await useCase.execute(dadosMock);

        expect(mockRepo.buscarPorId).toHaveBeenCalledWith('relatorio-uuid-123');
        
        // Verifica se a lógica de domínio foi disparada
        expect(relatorioMock.editarComentario).toHaveBeenCalledWith(
            dadosMock.comentario, 
            dadosMock.profissionalId
        );
        
        expect(mockRepo.atualizarComentario).toHaveBeenCalledWith(relatorioMock);
        expect(resultado).toBeDefined();
    });

    it('deve lançar erro 404 se o relatório não for encontrado', async () => {
        mockRepo.buscarPorId.mockResolvedValue(null);

        await expect(useCase.execute(dadosMock))
            .rejects.toEqual(new AppError('Relatório não encontrado', 404));

        expect(mockRepo.atualizarComentario).not.toHaveBeenCalled();
    });

    it('deve falhar se a entidade lançar erro de permissão (ID do profissional diferente)', async () => {
        const relatorioMock = {
            id: 'relatorio-uuid-123',
            profissional_id: 20, // Outro profissional
            editarComentario: jest.fn().mockImplementation(() => {
                throw new AppError('Não autorizado', 403);
            }),
        };

        mockRepo.buscarPorId.mockResolvedValue(relatorioMock as any);

        await expect(useCase.execute(dadosMock))
            .rejects.toEqual(new AppError('Não autorizado', 403));
    });
});