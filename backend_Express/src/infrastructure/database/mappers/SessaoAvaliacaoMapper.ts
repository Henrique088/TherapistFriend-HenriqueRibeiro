import { SessaoAvaliacaoEntity } from '../../../domain/entities/SessaoAvaliacao';
import { SessaoAvaliacaoModel } from '../models/sessao_avaliacao.model';

export class SessaoAvaliacaoMapper {
    /**
     * Converte um registro do Sequelize (Infra) para uma Entidade (Domínio)
     */
    public static toDomain(model: SessaoAvaliacaoModel): SessaoAvaliacaoEntity {
        return new SessaoAvaliacaoEntity({
            id: model.id,
            sessaoId: model.sessao_id,
            pacienteId: model.paciente_id,
            profissionalId: model.profissional_id,
            nota: model.nota,
            comentario: model.comentario,
            dataAvaliacao: model.data_avaliacao
        });
    }

    /**
     * Converte uma Entidade (Domínio) para um objeto de persistência (Infra)
     * Útil para o método create() ou update() do Sequelize
     */
    public static toPersistence(entity: SessaoAvaliacaoEntity) {
        return {
            id: entity.id,
            sessao_id: entity.sessaoId,
            paciente_id: entity.pacienteId,
            profissional_id: entity.profissionalId,
            nota: entity.nota,
            comentario: entity.comentario,
            data_avaliacao: entity.dataAvaliacao
        };
    }
}