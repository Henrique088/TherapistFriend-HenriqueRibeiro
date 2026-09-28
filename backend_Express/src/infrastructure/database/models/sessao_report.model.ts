// src/infrastructure/database/models/sessoes_report.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface para o que vai dentro do campo 'summary'
export interface ISessionSummary {
    emocao_predominante: string;
    confianca_media: number;
    timeline: Array<{
        timestamp: string;
        label: string;
        score: number;
    }>;
    insights_ia: {
        nivel_ansiedade: 'baixo' | 'moderado' | 'alto';
        sugestao_abordagem: string;
        picos_emocionais: number; // quantidade de mudanças bruscas
    };
}

export interface SessionReportAttributes {
    id: number;
    session_id: string;
    paciente_id: number;
    profissional_id: number;
    summary: ISessionSummary; // JSONB
    profissional_comment: string | null;
    created_at: Date;
}

type SessionReportCreationAttributes = Optional< SessionReportAttributes,'id' | 'profissional_comment' | 'summary' | 'created_at' >;

export class SessionReportModel extends Model< SessionReportAttributes, SessionReportCreationAttributes> implements SessionReportAttributes {

    public id!: number;
    public session_id!: string;
    public paciente_id!: number;
    public profissional_id!: number;
    public summary!: any;
    public profissional_comment!: string | null;
    public created_at!: Date;

    static associate(models: any) {
        SessionReportModel.belongsTo(models.Usuario, {
            foreignKey: 'paciente_id',
            as: 'paciente'
        });

        SessionReportModel.belongsTo(models.Usuario, {
            foreignKey: 'profissional_id',
            as: 'profissional'
        });

        SessionReportModel.belongsTo(models.Sessao, {
            foreignKey: 'session_id',
            as: 'sessao'
        });
    }
}

export type SessionReportModelStatic = typeof SessionReportModel;

export default (sequelize: Sequelize): typeof SessionReportModel => {
    SessionReportModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        session_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sessoes',
                key: 'id'
            }
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        summary: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        profissional_comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'SessionReport',
        tableName: 'session_reports',
        timestamps: false
    });

    return SessionReportModel;
};