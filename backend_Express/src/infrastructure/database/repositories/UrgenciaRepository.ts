// src/infrastructure/repositories/UrgenciaRepository.ts

import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { UrgenciaEntity } from '../../../domain/entities/UrgenciaEntity';
import { UrgenciaModelStatic } from '../models/urgencia.model';
import { Op } from 'sequelize';
import { PacienteModelStatic } from '../models/paciente.model';
import { UrgenciaMapper } from '../mappers/UrgenciaMapper';

export class UrgenciaRepository implements IUrgenciaRepository {

    constructor(private UrgenciaModel: UrgenciaModelStatic, private PacienteModel: PacienteModelStatic) { } 

    async criar(urgencia: UrgenciaEntity): Promise<UrgenciaEntity> {
        const model = await this.UrgenciaModel.create({
            paciente_id: urgencia.pacienteId,
            profissional_id: urgencia.profissionalId,
            motivo: urgencia.motivo,
            janela_de_tempo: urgencia.janelaDeTempo,
            status: urgencia.status,
            aprovada_em: urgencia.aprovadaEm
        });
        return UrgenciaMapper.toEntity(model);
    }

    async buscarPorId(id: number): Promise<UrgenciaEntity | null> {
        const model = await this.UrgenciaModel.findByPk(id);
        return model ? UrgenciaMapper.toEntity(model) : null;
    }

    async buscarAtivaPorPaciente(pacienteId: number, profissionalId: number): Promise<UrgenciaEntity | null> {
        const model = await this.UrgenciaModel.findOne({
            where: {
                paciente_id: pacienteId,
                profissional_id: profissionalId,
                status: ['pendente_aprovacao', 'aprovada_aguardando_vaga']
            }
        });
        return model ? UrgenciaMapper.toEntity(model) : null;
    }

    async listarPendentesPorProfissional(profissionalId: number): Promise<UrgenciaEntity[]> {
        const models = await this.UrgenciaModel.findAll({
            where: { profissional_id: profissionalId, status: 'pendente_aprovacao' },
        });

        return models.map(model => UrgenciaMapper.toEntity(model));
    }

    async listarAtivasPorProfissional(profissionalId: number): Promise<UrgenciaEntity[]> {
        const models = await this.UrgenciaModel.findAll({
            where: { 
                profissional_id: profissionalId, 
                status: ['pendente_aprovacao', 'aprovada_aguardando_vaga'] 
            },
            include: [
                {
                    model: this.PacienteModel,
                    as: 'paciente',
                    attributes: ['codinome']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        return models.map(model => UrgenciaMapper.toEntity(model));
    }

    async atualizar(urgencia: UrgenciaEntity): Promise<void> {
        await this.UrgenciaModel.update({
            status: urgencia.status,
            aprovada_em: urgencia.aprovadaEm
        }, {
            where: { id: urgencia.id }
        });
    }

    /**
     * Verifica se o paciente possui um voucher de prioridade ativo 
     * por ter cedido um horário anteriormente.
     */
    async verificarSeCedeuHorario(profissionalId: number, pacienteId: number): Promise<Boolean> {
        const count = await this.UrgenciaModel.count({
            where: {
                paciente_id: pacienteId,
                profissional_id: profissionalId,
                status: 'aprovada_aguardando_vaga',
                motivo: { [Op.like]: '%REAGENDAMENTO PRIORITÁRIO%' }
            }
        });
        return count > 0;
    }
}