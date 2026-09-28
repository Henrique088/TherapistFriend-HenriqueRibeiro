// src/infrastructure/sequelize/models/disponibilidade-profissional.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface DisponibilidadeAttributes {
    id: number;
    profissional_id: number;
    dia_semana: number; // 0 (Domingo) a 6 (Sábado)
    hora_inicio: string; // "08:00"
    hora_fim: string;    // "18:00"
    ativo: boolean;
}

type DisponibilidadeCreationAttributes = Optional<DisponibilidadeAttributes, 'id' | 'ativo'>;

export class DisponibilidadeModel extends Model<DisponibilidadeAttributes, DisponibilidadeCreationAttributes> 
    implements DisponibilidadeAttributes {
    
    public id!: number;
    public profissional_id!: number;
    public dia_semana!: number;
    public hora_inicio!: string;
    public hora_fim!: string;
    public ativo!: boolean;

    static associate(models: any) {
        DisponibilidadeModel.belongsTo(models.Profissional, { 
            foreignKey: 'profissional_id', 
            as: 'profissional' 
        });
    }
}

export type DisponibilidadeModelStatic = typeof DisponibilidadeModel;

export default (sequelize: Sequelize): typeof DisponibilidadeModel => {
    DisponibilidadeModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'profissionais', key: 'id' }
        },
        dia_semana: {
            type: DataTypes.INTEGER, // 0-6
            allowNull: false
        },
        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false
        },
        hora_fim: {
            type: DataTypes.TIME,
            allowNull: false
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Disponibilidade',
        tableName: 'disponibilidades_profissional',
        timestamps: true
    });

    return DisponibilidadeModel;
};