// src/infrastructure/database/repositories/SessaoAvaliacaoRepository.ts

import { ISessaoAvaliacaoRepository } from '../../../domain/repositories/ISessaoAvaliacaoRepository';
import { SessaoAvaliacaoModelStatic } from '../models/sessao_avaliacao.model';
import { SessaoAvaliacaoMapper } from '../mappers/SessaoAvaliacaoMapper'; 
import { fn, col } from 'sequelize';

export class SessaoAvaliacaoRepository implements ISessaoAvaliacaoRepository {

    constructor(private model: SessaoAvaliacaoModelStatic) { } 
    
    async salvar(dados: any): Promise<any> {
        // Criamos no banco usando o Model
        const registro = await this.model.create(dados);
        
        // Retornamos a entidade de domínio através do Mapper
        return SessaoAvaliacaoMapper.toDomain(registro);
    }

    async buscarPorSessaoId(sessaoId: string): Promise<any | null> {
        const registro = await this.model.findOne({
            where: { sessao_id: sessaoId }
        });

        if (!registro) return null;

        return SessaoAvaliacaoMapper.toDomain(registro);
    }

    async obterEstatisticasProfissional(profissionalId: number): Promise<{ media: number; totalAvaliacoes: number; }> {
        const stats = await this.model.findOne({
            where: { profissional_id: profissionalId },
            attributes: [
                [fn('AVG', col('nota')), 'media'],
                [fn('COUNT', col('id')), 'totalAvaliacoes']
            ],
            raw: true
        }) as any;

        return {
            media: parseFloat(stats?.media || 0),
            totalAvaliacoes: parseInt(stats?.totalAvaliacoes || 0)
        };
    }

    async listarPorProfissional(profissionalId: number, limit = 5): Promise<any[]> {
        const registros = await this.model.findAll({
            where: { profissional_id: profissionalId },
            limit,
            order: [['data_avaliacao', 'DESC']],
            include: ['paciente'] 
        });

        return registros.map(reg => SessaoAvaliacaoMapper.toDomain(reg));
    }
}