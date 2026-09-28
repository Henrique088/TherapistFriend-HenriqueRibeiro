// src/infrastructure/database/models/validacao-codigo.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 1. Interface de Atributos
export interface ValidacaoCodigoAttributes {
    id: number;
    usuarioId: number;
    codigo: string;
    tipo: 'SMS' | 'EMAIL';
    expiraEm: Date;
    data_criacao?: Date;
}

// 2. Interface para Atributos de Criação
type ValidacaoCodigoCreationAttributes = Optional<ValidacaoCodigoAttributes, 'id' | 'data_criacao'>;

// 3. Classe do Modelo
export class ValidacaoCodigoModel extends Model<ValidacaoCodigoAttributes, ValidacaoCodigoCreationAttributes> 
    implements ValidacaoCodigoAttributes {
    
    public id!: number;
    public usuarioId!: number;
    public codigo!: string;
    public tipo!: 'SMS' | 'EMAIL';
    public expiraEm!: Date;
    public readonly data_criacao!: Date;

    // Associações
    static associate(models: any) {
        // Relacionamento com Usuario
        ValidacaoCodigoModel.belongsTo(models.Usuario, { 
            foreignKey: 'usuarioId', 
            as: 'usuario' 
        });
    }
}

export type ValidacaoCodigoModelStatic = typeof ValidacaoCodigoModel;
// 4. Função de Inicialização (Factory)
export default (sequelize: Sequelize): typeof ValidacaoCodigoModel => {
    ValidacaoCodigoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'usuarios', key: 'id' },
            onDelete: 'CASCADE'
        },
        codigo: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        tipo: {
            type: DataTypes.ENUM('SMS', 'EMAIL'),
            allowNull: false
        },
        expiraEm: {
            type: DataTypes.DATE,
            allowNull: false
        },
        data_criacao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'createdAt' // Mapeia para a coluna padrão do Sequelize se desejar
        }
    }, {
        sequelize,
        modelName: 'ValidacaoCodigo',
        tableName: 'validacoes_codigos',
        timestamps: true,
        updatedAt: false // Apenas data de criação é relevante aqui
    });

    return ValidacaoCodigoModel;
};