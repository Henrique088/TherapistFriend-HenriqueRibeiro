// src/application/use-cases/profissional/PerfilPublicoProfissional.spec.ts

import { PerfilPublicoProfissional } from './PerfilPublicoProfissionalUseCase';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { ISessaoAvaliacaoRepository } from '../../../domain/repositories/ISessaoAvaliacaoRepository';

describe('PerfilPublicoProfissional', () => {
    let useCase: PerfilPublicoProfissional;
    let mockProfissionalRepo: jest.Mocked<IProfissionalRepository>;
    let mockAvaliacaoRepo: jest.Mocked<ISessaoAvaliacaoRepository>;

    beforeEach(() => {
        mockProfissionalRepo = {
            buscarPorUsuarioId: jest.fn(),
        } as any;

        mockAvaliacaoRepo = {
            obterEstatisticasProfissional: jest.fn(),
            listarPorProfissional: jest.fn(),
        } as any;

        useCase = new PerfilPublicoProfissional(mockProfissionalRepo, mockAvaliacaoRepo);
    });

    it('deve retornar o perfil público completo com estatísticas e comentários', async () => {
        const profissionalMock = {
            id: 1,
            id_usuario: 10,
            nome: 'Dra. Ana Paula',
            crp: '06/12345',
            especialidades: 'TCC e Ansiedade',
            bio: 'Especialista em saúde mental.'
        };

        const statsMock = { media: "4.8", totalAvaliacoes: 25 };

        const avaliacoesMock = [
            { nota: 5, comentario: 'Excelente profissional!', dataAvaliacao: new Date() }
        ];

        mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(profissionalMock as any);
        mockAvaliacaoRepo.obterEstatisticasProfissional.mockResolvedValue(statsMock as any);
        mockAvaliacaoRepo.listarPorProfissional.mockResolvedValue(avaliacoesMock as any);

        const resultado = await useCase.execute(10);

        expect(mockProfissionalRepo.buscarPorUsuarioId).toHaveBeenCalledWith(10);
        expect(resultado.nome).toBe('Dra. Ana Paula');
        expect(resultado.mediaNotas).toBe(4.8);
        expect(resultado.totalAvaliacoes).toBe(25);
        expect(resultado.comentarios).toHaveLength(1);
        expect(resultado.comentarios[0].texto).toBe('Excelente profissional!');
    });

    it('deve retornar dados padrão quando o profissional não possui avaliações', async () => {
        mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue({
            id_usuario: 10,
            nome: 'Dr. Bruno'
        } as any);

        // Simula retorno de estatísticas zeradas
        mockAvaliacaoRepo.obterEstatisticasProfissional.mockResolvedValue({ media: "0", totalAvaliacoes: 0 } as any);
        mockAvaliacaoRepo.listarPorProfissional.mockResolvedValue([]);

        const resultado = await useCase.execute(10);

        expect(resultado.mediaNotas).toBe(0);
        expect(resultado.comentarios).toEqual([]);
    });

    it('deve lançar erro caso o profissional não exista', async () => {
        mockProfissionalRepo.buscarPorUsuarioId.mockResolvedValue(null);

        await expect(useCase.execute(999))
            .rejects.toThrow("Erro ao buscar perfil público. Por favor, tente novamente mais tarde.");
    });
});