// src/infrastructure/database/models/conversa.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface ConversaAttributes {
    id: number;
    relato_id_origem: number | null;
    paciente_id: number;
    profissional_id: number;
    status: 'ativa' | 'encerrada';
    pacienteCodinome?: string
    createdAt?: Date;
    updatedAt?: Date;
}

type ConversaCreationAttributes = Optional<ConversaAttributes, 'id' | 'status' | 'relato_id_origem'>;

export class ConversaModel extends Model<ConversaAttributes, ConversaCreationAttributes> implements ConversaAttributes {
    public id!: number;
    public relato_id_origem!: number | null;
    public paciente_id!: number;
    public profissional_id!: number;
    public status!: 'ativa' | 'encerrada';

    public readonly paciente?: { 
        nome?: string; // Nome do Usuario
        paciente?: { codinome: string }; // Se for aninhado
        codinome?: string; // Se for direto
    };
    
    public readonly profissional?: { 
        nome: string; 
    };

    static associate(models: any) {
        // Uma conversa se origina de um relato
        ConversaModel.belongsTo(models.Relato, { foreignKey: 'relato_id_origem', as: 'relato' });
        
        // Uma conversa pertence a um paciente e um profissional
        ConversaModel.belongsTo(models.Usuario, { foreignKey: 'paciente_id', as: 'paciente' });
        ConversaModel.belongsTo(models.Usuario, { foreignKey: 'profissional_id', as: 'profissional' });
        
        // Uma conversa tem muitas mensagens
        ConversaModel.hasMany(models.Mensagem, { foreignKey: 'conversa_id', as: 'mensagens' });
    }
}

export type ConversaModelStatic = typeof ConversaModel;



export default (sequelize: Sequelize): typeof ConversaModel => {
    ConversaModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        relato_id_origem: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'relatos', key: 'id' }
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
        status: {
            type: DataTypes.ENUM('ativa', 'encerrada'),
            defaultValue: 'ativa'
        }
    }, {
        sequelize,
        modelName: 'Conversa',
        tableName: 'conversas',
        timestamps: true
    });

    return ConversaModel;
};