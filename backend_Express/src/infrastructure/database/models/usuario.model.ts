// src/infrastructure/database/models/usuario.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface de Atributos (Propriedades reais da tabela)
export interface UsuarioAttributes {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    senha_hash: string;
    tipo_usuario: 'paciente' | 'profissional' | 'admin';
    telefone_validado: boolean;
    email_validado: boolean;
    ativo: boolean;
    data_cadastro: Date;
}

// Interface para Atributos de Criação (Campos opcionais durante a criação)
type UsuarioCreationAttributes = Optional<UsuarioAttributes, 'id' | 'ativo' | 'tipo_usuario' | 'data_cadastro'>;

// Classe do Modelo (O objeto que o Sequelize retorna)
export class UsuarioModel extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    public id!: number;
    public nome!: string;
    public email!: string;
    public telefone!: string;
    public senha_hash!: string;
    public tipo_usuario!: 'paciente' | 'profissional' | 'admin';
    public telefone_validado!: boolean;
    public email_validado!: boolean;
    public ativo!: boolean;
    public data_cadastro!: Date;

    //  Associações 
    static associate(models: any) { 
        if (models.Paciente) UsuarioModel.hasOne(models.Paciente, { foreignKey: 'id_usuario', onDelete: 'CASCADE' , as:'paciente'  });
        if (models.Profissional) UsuarioModel.hasOne(models.Profissional, { foreignKey: 'id_usuario', onDelete: 'CASCADE', as:'profissional' });

        if (models.Relato && models.Like) {
        UsuarioModel.belongsToMany(models.Relato, {
            through: models.Like,
            foreignKey: 'usuarioId',
            otherKey: 'relatoId',
            as: 'relatosCurtidos'
        });
    }

    }
}

export type UsuarioModelStatic = typeof UsuarioModel;

// Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof UsuarioModel => {
    UsuarioModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        senha_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo_usuario: {
            type: DataTypes.ENUM('paciente', 'profissional', 'admin'),
            allowNull: false,
            defaultValue: 'paciente'
        },
        telefone_validado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        email_validado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        data_cadastro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Usuario',
        tableName: 'usuarios',
        timestamps: false
    });

    return UsuarioModel;
};