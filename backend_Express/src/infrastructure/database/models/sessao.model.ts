// src/infrastructure/database/models/sessao.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface SessaoAttributes {
    id: string; // UUID v4 geralmente usado para chamadas WebRTC
    paciente_id: number;
    profissional_id: number;
    agendamento_id: number;
    status: 'agendada' | 'ativa' | 'finalizada' | 'cancelada';
    data_inicio: Date;
    data_fim: Date | null;
    data_inicio_real: Date | null;

}

type SessaoCreationAttributes = Optional<SessaoAttributes, 'status' | 'data_fim' | 'agendamento_id'>;

export class SessaoModel extends Model<SessaoAttributes, SessaoCreationAttributes> implements SessaoAttributes {
    public id!: string;
    public paciente_id!: number;
    public profissional_id!: number;
    public agendamento_id!: number;
    public status!: 'agendada' | 'ativa' | 'finalizada' | 'cancelada';
    public data_inicio!: Date;
    public data_fim!: Date | null;
    public data_inicio_real!: Date | null;

    static associate(models: any) {
        SessaoModel.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
        SessaoModel.belongsTo(models.Usuario, { foreignKey: 'profissional_id', as: 'profissional' });
        SessaoModel.belongsTo(models.Agendamento, { foreignKey: 'agendamento_id', as: 'agendamento' });
        
    }
}

export type SessaoModelStatic = typeof SessaoModel;

export default (sequelize: Sequelize): typeof SessaoModel => {
    SessaoModel.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' }
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' }
        },

        agendamento_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }, 

        status: {
            type: DataTypes.ENUM('agendada', 'ativa', 'finalizada', 'cancelada'),
            defaultValue: 'agendada'
        },
        data_inicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        data_fim: {
            type: DataTypes.DATE,
            allowNull: true
        },
        data_inicio_real: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Sessao',
        tableName: 'sessoes',
        timestamps: true 
    });

    return SessaoModel;
};