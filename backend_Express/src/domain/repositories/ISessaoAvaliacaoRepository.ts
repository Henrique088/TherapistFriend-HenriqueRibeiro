// src/domain/repositories/ISessaoAvaliacaoRepository.ts

import { SessaoAvaliacaoAttributes } from '../../infrastructure/database/models/sessao_avaliacao.model';
import { SessaoAvaliacaoEntity } from '../entities/SessaoAvaliacao';

export interface ISessaoAvaliacaoRepository {
    /**
     * Salva uma nova avaliação de sessão no banco de dados.
     */
    salvar(dados: Omit<SessaoAvaliacaoAttributes, 'id' | 'data_avaliacao'>): Promise<SessaoAvaliacaoEntity>;

    /**
     * Busca uma avaliação específica pelo ID da sessão.
     * Útil para verificar se a sessão já foi avaliada.
     */
    buscarPorSessaoId(sessaoId: string): Promise<SessaoAvaliacaoEntity | null>;

    /**
     * Calcula a média de notas de um profissional específico.
     * Retorna um objeto com a média e o total de avaliações recebidas.
     */
    obterEstatisticasProfissional(profissionalId: number): Promise<{ 
        media: number; 
        totalAvaliacoes: number; 
    }>;

    /**
     * Lista as últimas avaliações de um profissional (comentários).
     */
    listarPorProfissional(profissionalId: number, limit?: number): Promise<SessaoAvaliacaoEntity[]>;
}