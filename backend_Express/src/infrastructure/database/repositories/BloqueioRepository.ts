// src/infrastructure/database/repositories/BloqueioRepository.ts

import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { BloqueioEntity } from '../../../domain/entities/BloqueioEntity';
import { BloqueioModel } from '../models/bloqueio-agenda.model';
import { BloqueioExcecaoModel } from '../models/bloqueio-excecao.model';
import { BloqueioMapper } from '../mappers/BloqueioMapper';
import { Op } from 'sequelize';

export class BloqueioRepository implements IBloqueioRepository {

    constructor(
        private model: typeof BloqueioModel,
        private excecaoModel: typeof BloqueioExcecaoModel
    ) { }

    async buscarBloqueiosAtivos(profissionalId: number, dataInicio: Date, dataFim?: Date): Promise<BloqueioEntity[]> {
        const fimBusca = dataFim
            ? new Date(dataFim.getTime())
            : new Date(dataInicio.getTime());

        fimBusca.setUTCHours(23, 59, 59, 999);

        const registros = await this.model.findAll({
            where: {
                profissional_id: profissionalId,
                ativo: true,
                [Op.or]: [
                    // Bloqueio Pontual: Intersecta o período solicitado
                    {
                        recorrente: false,
                        data_inicio: { [Op.lte]: fimBusca },
                        data_fim: { [Op.gte]: dataInicio }
                    },
                    // Bloqueio Recorrente: 
                    {
                        recorrente: true,
                        data_inicio: { [Op.lte]: fimBusca }
                    }
                ]
            },
            include: [{
                model: this.excecaoModel,
                as: 'excecoes',
                required: false,
                where: {
                    data_excecao: {
                        [Op.between]: [dataInicio, fimBusca]
                    }
                }
            }]
        });

        // O Mapper converterá o JSON do banco de volta para o Array da Entidade
        return registros.map(BloqueioMapper.toDomain);
    }
    async salvar(bloqueio: BloqueioEntity): Promise<BloqueioEntity> {
        const data = BloqueioMapper.toPersistence(bloqueio);

        const [registro] = await this.model.upsert(data as any);

        return BloqueioMapper.toDomain(registro);
    }

    async adicionarExcecao(bloqueioId: number, data: string, motivo?: string): Promise<void> {


        await this.excecaoModel.create({
            bloqueio_id: bloqueioId,
            data_excecao: data,
            motivo: motivo
        });
    }

    // Implementando as funções que faltavam
    async buscarPorId(id: number): Promise<BloqueioEntity | null> {
        const registro = await this.model.findByPk(id);
        return registro ? BloqueioMapper.toDomain(registro) : null;
    }

    async excluir(profissionalId: number, bloqueioId: number): Promise<void> {
        await this.model.destroy({
            where: { id: bloqueioId, profissional_id: profissionalId }
        });
    }

    async excluirExcecao(excecaoId: number): Promise<void> {
        await this.excecaoModel.destroy({
            where: { id: excecaoId }
        });
    }
}