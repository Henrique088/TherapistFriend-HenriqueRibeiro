// src/infrastructure/database/models/refresh_token.model.ts

import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';

// 1. Interface de Atributos (Propriedades reais da tabela)
export interface RefreshTokenAttributes {
    id: number;
    token_hash: string;       // Hash seguro do Refresh Token
    user_id: number;          // Chave estrangeira para a tabela Usuario
    expires_at: Date;         // Data e hora de expiração
    revoked_at: Date | null;  // Data e hora de revogação (se o token foi invalidado)
    user_agent: string | null; // Informações sobre o cliente (browser/app)
    ip_address: string | null; // Endereço IP usado na criação
    jti: string;              // JWT ID (UUID) para identificação única
    created_at: Date;         // Data de criação (createdAt)
}

// 2. Interface para Atributos de Criação (Campos opcionais durante a criação)
type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, 'id' | 'revoked_at' | 'user_agent' | 'ip_address' | 'created_at'>;

// 3. Classe do Modelo
export class RefreshTokenModel extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public id!: number;
    public token_hash!: string;
    public user_id!: number;
    public expires_at!: Date;
    public revoked_at!: Date | null;
    public user_agent!: string | null;
    public ip_address!: string | null;
    public jti!: string;
    public created_at!: Date;
    
    // Método para verificar se o token está ativo e não expirou
    public isRevoked(): boolean {
        return !!this.revoked_at; // Retorna true se revoked_at não for null/undefined
    }

    // Método estático para associações
    static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
        // Relação N:1 - Um RefreshToken pertence a um Usuário
        RefreshTokenModel.belongsTo(models.Usuario, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE', // Se o Usuário for deletado, o token é deletado
            as: 'usuario'
        });
    }
}

export type RefreshTokenModelStatic = typeof RefreshTokenModel;

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof RefreshTokenModel => {
    RefreshTokenModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token_hash: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // 🔑 A FK é definida no 'associate', mas mantemos a coluna aqui
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ip_address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        jti: {
            type: DataTypes.UUID,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'RefreshToken',
        tableName: 'refresh_tokens',
        timestamps: true, // Habilita timestamps
        createdAt: 'created_at', // Mapeia 'created_at' do modelo para created_at da tabela
        updatedAt: false // Desabilita o campo updatedAt
    });

    return RefreshTokenModel;
};