// src/infrastructure/database/mappers/PacienteMapper.ts

import { PacienteEntity } from '../../../domain/entities/PacienteEntity';
import { PacienteModel, PacienteAttributes } from '../models/paciente.model';

export interface PacienteQueryRow extends PacienteAttributes {
    usuario?: {
        nome: string;
        email: string;
        telefone: string;
    };
}

export class PacienteMapper {
    public static toEntity(record: PacienteModel): PacienteEntity {
        const data = record.get({ plain: true }) as PacienteQueryRow;

        return new PacienteEntity({
            id: data.id,
            idUsuario: data.id_usuario, // Mapeamento da FK do DB
            nome: data.usuario?.nome,
            email: data.usuario?.email,
            telefone: data.usuario?.telefone,
            codinome: data.codinome,
            criadoEm: data.criado_em,
            atualizadoEm: data.atualizado_em,
        });
    }
}