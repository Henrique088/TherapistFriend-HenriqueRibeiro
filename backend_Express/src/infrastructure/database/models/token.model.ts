// src/infrastructure/database/models/token.model.ts

import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';

// 1. Interface de Atributos (Propriedades reais da tabela)
export interface TokenAttributes {
    id: number;
    token: string; // O valor do token (JWT, refresh token, etc.)
    id_usuario: number; // Chave estrangeira para a tabela Usuario
    criado_em: Date;
}

// 2. Interface para Atributos de Criação (Campos opcionais durante a criação)
type TokenCreationAttributes = Optional<TokenAttributes, 'id' | 'criado_em'>;

// 3. Classe do Modelo (O objeto que o Sequelize retorna)
export class TokenModel extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
    public id!: number;
    public token!: string;
    public id_usuario!: number;
    public criado_em!: Date;

    // Métodos estáticos para associações
    static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
        // Relação N:1 - Um Token pertence a um Usuário
        TokenModel.belongsTo(models.Usuario, {
            foreignKey: "id_usuario",
            as: "usuario" // Alias opcional para facilitar as consultas
        });
    }
}

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof TokenModel => {
    TokenModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_usuario: { 
            type: DataTypes.INTEGER,
            allowNull: false
    
        },
        criado_em: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        sequelize,
        modelName: 'Token',
        tableName: 'tokens', // Nome da tabela no banco
        timestamps: false 
    });

    return TokenModel;
};