// src/infrastructure/database/models/bloqueio-agenda.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { BloqueioExcecaoModel } from './bloqueio-excecao.model';

// Interface de Atributos
export interface BloqueioAttributes {
    id: number;
    profissional_id: number;
    titulo: string;
    data_inicio: Date;
    data_fim: Date;
    recorrente: boolean;
    tipo?: 'comum' | 'estrategico' | 'pessoal' | 'feriado';
    dias_semana?: number[];
    ativo: boolean;
}

// Interface para Atributos de Criação
type BloqueioCreationAttributes = Optional<BloqueioAttributes, 'id' | 'recorrente' | 'ativo'>;

// Classe do Modelo
export class BloqueioModel extends Model<BloqueioAttributes, BloqueioCreationAttributes>
    implements BloqueioAttributes {

    public id!: number;
    public profissional_id!: number;
    public titulo!: string;
    public data_inicio!: Date;
    public data_fim!: Date;
    public recorrente!: boolean;
    public tipo!: 'comum' | 'estrategico' | 'pessoal' | 'feriado';
    public dias_semana!: number[];
    public ativo!: boolean;

    public readonly excecoes?: BloqueioExcecaoModel[];

    static associate(models: any) {
        BloqueioModel.belongsTo(models.Profissional, {
            foreignKey: 'profissional_id',
            as: 'profissional'
        });

        BloqueioModel.hasMany(models.BloqueioExcecao, {
            foreignKey: 'bloqueio_id',
            as: 'excecoes'
        });
    }
}

export type BloqueioModelStatic = typeof BloqueioModel;

// Função de Inicialização (Factory)
export default (sequelize: Sequelize): typeof BloqueioModel => {
    BloqueioModel.init({
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
        titulo: {
            type: DataTypes.STRING,
            allowNull: false // Ex: "Horário de Almoço" ou "Férias"
        },
        data_inicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        data_fim: {
            type: DataTypes.DATE,
            allowNull: false
        },
        recorrente: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        tipo: {
            type: DataTypes.ENUM('comum', 'estrategico', 'pessoal', 'feriado'),
            defaultValue: 'comum'
        },

        dias_semana: {
            type: DataTypes.JSON, 
            allowNull: true,
            comment: 'Array de números representando os dias (0-domingo, 1-segunda...)'
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Bloqueio',
        tableName: 'bloqueios_agenda',
        timestamps: true
    });

    return BloqueioModel;
};