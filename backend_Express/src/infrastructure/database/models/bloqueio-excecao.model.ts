// src/infrastructure/database/models/bloqueio-excecao.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface de Atributos
export interface BloqueioExcecaoAttributes {
    id: number;
    bloqueio_id: number;
    data_excecao: string; // A data específica onde o bloqueio não deve atuar
    motivo?: string;
}

// Interface para Atributos de Criação
type BloqueioExcecaoCreationAttributes = Optional<BloqueioExcecaoAttributes, 'id'>;

// Classe do Modelo
export class BloqueioExcecaoModel extends Model<BloqueioExcecaoAttributes, BloqueioExcecaoCreationAttributes> 
    implements BloqueioExcecaoAttributes {
    
    public id!: number;
    public bloqueio_id!: number;
    public data_excecao!: string;
    public motivo!: string;

    static associate(models: any) {
        // Relacionamento com o Bloqueio Original
        BloqueioExcecaoModel.belongsTo(models.Bloqueio, { 
            foreignKey: 'bloqueio_id', 
            as: 'bloqueio' 
        });
    }
}

export type BloqueioExcecaoModelStatic = typeof BloqueioExcecaoModel;

// Função de Inicialização (Factory)
export default (sequelize: Sequelize): typeof BloqueioExcecaoModel => {
    BloqueioExcecaoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bloqueio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'bloqueios_agenda', key: 'id' },
            onDelete: 'CASCADE'
        },
        data_excecao: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        motivo: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'BloqueioExcecao',
        tableName: 'bloqueios_agenda_excecoes',
        timestamps: true
    });

    return BloqueioExcecaoModel;
};