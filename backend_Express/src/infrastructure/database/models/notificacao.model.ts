// src/infrastructure/database/models/notificacao.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface NotificacaoAttributes {
    id: number;
    usuario_id: number;
    titulo: string;
    mensagem: string;
    tipo: 'SOLICITACAO_VINCULO' | 'SISTEMA' | 'CHAT' | 'AGENDA' | 'SESSAO' | 'RELATORIO';
    lida: boolean;
    metadata: any; // Campo JSONB para evitar associações múltiplas
    createdAt?: Date;
    updatedAt?: Date;
}

type NotificacaoCreationAttributes = Optional<NotificacaoAttributes, 'id' | 'lida' | 'createdAt' | 'updatedAt'>;

export class NotificacaoModel extends Model<NotificacaoAttributes, NotificacaoCreationAttributes> implements NotificacaoAttributes {
    public id!: number;
    public usuario_id!: number;
    public titulo!: string;
    public mensagem!: string;
    public tipo!: 'SOLICITACAO_VINCULO' | 'SISTEMA' | 'CHAT' | 'AGENDA' | 'SESSAO' | 'RELATORIO';
    public lida!: boolean;
    public metadata!: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static associate(models: any) {
        // A notificação sempre pertence a um usuário (quem recebe)
        NotificacaoModel.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    }
}

export type NotificacaoModelStatic = typeof NotificacaoModel;

export default (sequelize: Sequelize): typeof NotificacaoModel => {
    NotificacaoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' }
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mensagem: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tipo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lida: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Notificacao',
        tableName: 'notificacoes',
        timestamps: true,
        underscored: true // Define created_at e updated_at
    });

    return NotificacaoModel;
};