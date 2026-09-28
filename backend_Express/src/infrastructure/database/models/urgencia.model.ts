// src/infrastructure/database/models/urgencia.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface UrgenciaAttributes {
    id: number;
    profissional_id: number;
    paciente_id: number;
    motivo: string;
    janela_de_tempo: '3_dias' | '7_dias';
    status: 'pendente_aprovacao' | 'aprovada_aguardando_vaga' | 'rejeitada' | 'concluida';
    aprovada_em: Date | null; // Permitir null aqui
    createdAt?: Date;
    updatedAt?: Date;
}

// Marcamos como opcionais os campos que o Banco gera sozinho
type UrgenciaCreationAttributes = Optional<UrgenciaAttributes, 'id' | 'aprovada_em' | 'createdAt' | 'updatedAt'>;

export class UrgenciaModel extends Model<UrgenciaAttributes, UrgenciaCreationAttributes> implements UrgenciaAttributes {
    public id!: number;
    public profissional_id!: number;
    public paciente_id!: number;
    public motivo!: string;
    public janela_de_tempo!: '3_dias' | '7_dias';
    public status!: 'pendente_aprovacao' | 'aprovada_aguardando_vaga' | 'rejeitada' | 'concluida';
    public aprovada_em!: Date | null;

    static associate(models: any) {
        // CORREÇÃO: Use as chaves estrangeiras que você definiu no init
        UrgenciaModel.belongsTo(models.Paciente, { foreignKey: 'paciente_id', as: 'paciente' });
        UrgenciaModel.belongsTo(models.Profissional, { foreignKey: 'profissional_id', as: 'profissional' });
    }
}

export type UrgenciaModelStatic = typeof UrgenciaModel;


export default (sequelize: Sequelize): typeof UrgenciaModel => {
    UrgenciaModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        motivo: {
            type: DataTypes.TEXT,
            allowNull: true // Importante definir se aceita null
        },
        janela_de_tempo: {
            type: DataTypes.ENUM('3_dias', '7_dias'),
            allowNull: false,
            defaultValue: '7_dias'
        },
        status: {
            type: DataTypes.ENUM('pendente_aprovacao', 'aprovada_aguardando_vaga', 'rejeitada', 'concluida'),
            defaultValue: 'pendente_aprovacao',
            allowNull: false
        },
        aprovada_em: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Urgencia',
        tableName: 'urgencias',
        timestamps: true,
        underscored: true
    });

    return UrgenciaModel;
};