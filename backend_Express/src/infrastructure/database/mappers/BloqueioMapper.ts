// src/infrastructure/database/mappers/BloqueioMapper.ts

import { BloqueioEntity } from '../../../domain/entities/BloqueioEntity';
import { BloqueioModel } from '../models/bloqueio-agenda.model';
import { BloqueioExcecaoEntity } from '../../../domain/entities/BloqueioExcecaoEntity';

export class BloqueioMapper {
    /**
     * Converte Model (Banco) -> Entity (Domínio)
     */
    static toDomain(model: BloqueioModel): BloqueioEntity {
        // Mapeia as exceções com segurança
        const excecoes = model.excecoes?.map(exc => new BloqueioExcecaoEntity({
            id: exc.id,
            bloqueioId: exc.bloqueio_id,
            dataExcecao: new Date(exc.data_excecao),
            motivo: exc.motivo
        })) || [];

        // Tratamento para garantir que diasSemana seja sempre um array de números
        let diasSemana: number[] = [];
        if (model.dias_semana) {
            diasSemana = Array.isArray(model.dias_semana) 
                ? model.dias_semana.map(Number) 
                : [];
        }

        return new BloqueioEntity({
            id: model.id,
            profissionalId: model.profissional_id,
            titulo: model.titulo,
            dataInicio: model.data_inicio,
            dataFim: model.data_fim,
            recorrente: model.recorrente,
            diasSemana: diasSemana, 
            ativo: model.ativo,
            excecoes
        });
    }

    /**
     * Converte Entity (Domínio) -> Objeto para o Sequelize (Persistência)
     */
    static toPersistence(entity: BloqueioEntity) {
        return {
            id: entity.id,
            profissional_id: entity.profissionalId,
            titulo: entity.titulo,
            data_inicio: entity.dataInicio.toISOString(),
            data_fim: entity.dataFim.toISOString(),
            recorrente: entity.recorrente,
            // O Sequelize converterá este array para JSON automaticamente conforme o Model
            dias_semana: entity.recorrente ? (entity.diasSemana || []) : null,
            ativo: entity.ativo
        };
    }
}