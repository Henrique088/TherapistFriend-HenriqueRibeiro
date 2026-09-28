// src/infrastructure/database/repositories/ConversaRepository.ts

import { IConversaRepository } from '../../../domain/repositories/IConversaRepository';
import { ConversaEntity } from '../../../domain/entities/ConversaEntity';
import { ConversaModel } from '../models/conversa.model';
import { Op } from 'sequelize';
import { UsuarioModel } from '../models/usuario.model';
import { PacienteModel } from '../models/paciente.model';
import { ConversaMapper } from '../mappers/ConversaMapper';
import { ProfissionalModel } from '../models/profissional.model';

export class ConversaRepository implements IConversaRepository {

    constructor(
        private model: typeof ConversaModel,
        private usuarioModel: typeof UsuarioModel,
        private pacienteModel: typeof PacienteModel,
        private profissionalModel: typeof ProfissionalModel
    ) { }

    async criar(dados: {
        relato_id_origem: number; paciente_id: number; profissional_id: number; status: 'ativa' | 'encerrada'
    }, transaction?: any): Promise<ConversaEntity> {

        const novaConversa = await this.model.create({
            relato_id_origem: dados.relato_id_origem,
            paciente_id: dados.paciente_id,
            profissional_id: dados.profissional_id,
            status: dados.status
        }, { transaction });

        return ConversaMapper.toEntity(novaConversa);
    }

    async buscarAtivaEntre(pacienteId: number, profissionalId: number): Promise<ConversaEntity | null> {
        const conversa = await this.model.findOne({
            where: {
                paciente_id: pacienteId,
                profissional_id: profissionalId,
                status: 'ativa'
            }
        });

        return conversa ? ConversaMapper.toEntity(conversa) : null;
    }

    async buscarPorId(id: number): Promise<ConversaEntity | null> {
        const conversa = await this.model.findByPk(id);
        return conversa ? ConversaMapper.toEntity(conversa) : null;
    }

    async buscarConversas(id: number): Promise<ConversaEntity[] | null> {
        
        const conversas = await this.model.findAll({
            where: {
                [Op.or]: [
                    { paciente_id: id },
                    { profissional_id: id }
                ]
            },
            include: [
                {
                    model: this.usuarioModel, // Primeiro nível: Usuario (Paciente)
                    as: 'paciente',
                    attributes: ['id'],
                    include: [
                        {
                            model: this.pacienteModel, // Segundo nível: Perfil do Paciente
                            as: 'paciente', // Nome da associação definida no model Usuario
                            attributes: ['codinome']
                        }
                    ]
                },
                {
                    model: this.usuarioModel, // Primeiro nível: Usuario (Profissional)
                    as: 'profissional',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: this.profissionalModel, // Segundo nível: Perfil do Profissional
                            as: 'profissional', // Nome da associação definida no model Usuario
                            attributes: ['id']
                        }
                    ]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        if (!conversas || conversas.length === 0) return null;

        console.log('Conversas encontradas:', conversas.map(c => c.toJSON())); // Log detalhado das conversas
        return conversas.map(conversa => ConversaMapper.toEntity(conversa));
    }
}