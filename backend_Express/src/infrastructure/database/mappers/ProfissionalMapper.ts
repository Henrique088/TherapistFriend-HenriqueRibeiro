// src/infrastructure/database/mappers/ProfissionalMapper.ts

import { ProfissionalEntity } from '../../../domain/entities/ProfissionalEntity';
import { EspecialidadeEntity } from '../../../domain/entities/EspecialidadeEntity';
import { ProfissionalModel, ProfissionalAttributes } from '../models/profissional.model';
import { EspecialidadeModel } from '../models/especialidade.model';

export interface ProfissionalQueryRow extends ProfissionalAttributes {
    usuario?: {
        nome: string;
        email: string;
        telefone: string;
    };
    historicos?: Array<{
        motivo: string | null;
        data_decisao: Date;
        status: string;
    }>;
    especialidades?: EspecialidadeModel[];
}

export class ProfissionalMapper {
    private static mapEspecialidadeRecordToEntity(record: EspecialidadeModel): EspecialidadeEntity {
        const data = typeof record.get === 'function' ? record.get({ plain: true }) : record;

        return new EspecialidadeEntity({
            id: (data as any).id,
            nome: (data as any).nome,
            criadoEm: (data as any).criado_em || new Date(),
            atualizadoEm: (data as any).atualizado_em || new Date(),
        });
    }

    public static toEntity(record: ProfissionalModel): ProfissionalEntity {
        const data = record.get({ plain: true }) as ProfissionalQueryRow;

        const especialidadesEntidades: EspecialidadeEntity[] =
            data.especialidades?.map((esp) =>
                ProfissionalMapper.mapEspecialidadeRecordToEntity(esp)
            ) || [];

        return new ProfissionalEntity({
            id: data.id,
            id_usuario: data.id_usuario,
            nome: data.usuario?.nome,
            email: data.usuario?.email,
            telefone: data.usuario?.telefone,
            cpf: data.cpf,
            crp: data.crp,
            bio: data.bio,
            especialidades: especialidadesEntidades,
            criado_em: data.criado_em,
            atualizado_em: data.atualizado_em,
            validado: data.validado,
            status: data.status,
            admin_id: data?.admin_id,
            data_validacao: data?.data_validacao,
            motivo: data.status === 'revogado' ? data?.historicos?.[0]?.motivo || null : null
        });
    }
}