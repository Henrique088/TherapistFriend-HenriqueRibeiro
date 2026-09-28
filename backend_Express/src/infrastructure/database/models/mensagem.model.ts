// src/infrastructure/database/models/mensagem.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface MensagemAttributes {
    id: number;
    conversa_id: number;
    remetente_id: number;
    conteudo: string; // Conteúdo criptografado em HEX
    iv: string;       // Vetor de inicialização da criptografia
    lida: boolean;
    data_envio?: Date;
}

type MensagemCreationAttributes = Optional<MensagemAttributes, 'id' | 'lida' | 'data_envio'>;

export class MensagemModel extends Model<MensagemAttributes, MensagemCreationAttributes> implements MensagemAttributes {
    public id!: number;
    public conversa_id!: number;
    public remetente_id!: number;
    public conteudo!: string;
    public iv!: string;
    public lida!: boolean;
    public data_envio!: Date;

    static associate(models: any) {
        // Uma mensagem pertence a uma conversa
        MensagemModel.belongsTo(models.Conversa, { foreignKey: 'conversa_id', as: 'conversa' });
        
        // Uma mensagem foi enviada por um usuário
        MensagemModel.belongsTo(models.Usuario, { foreignKey: 'remetente_id', as: 'remetente' });
    }
}

export type MensagemModelStatic = typeof MensagemModel;

export default (sequelize: Sequelize): typeof MensagemModel => {
    MensagemModel.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        conversa_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'conversas', key: 'id' }
        },
        remetente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' }
        },
        conteudo: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        iv: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lida: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        data_envio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Mensagem',
        tableName: 'mensagens',
        timestamps: true // Habilita createdAt e updatedAt automaticamente
    });

    return MensagemModel;
};