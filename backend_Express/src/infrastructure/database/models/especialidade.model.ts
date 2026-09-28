// src/infrastructure/database/models/especialidade.model.ts

import e from 'express';
import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';

// 1. Interface de Atributos (Propriedades reais da tabela)
export interface EspecialidadeAttributes {
    id: number;
    nome: string;               // Nome da especialidade (ex: "Psicologia Cognitiva")
    criado_em: Date;            // Timestamp de criação
    atualizado_em: Date;        // Timestamp de atualização
}

// 2. Interface para Atributos de Criação
type EspecialidadeCreationAttributes = Optional<EspecialidadeAttributes, 
    'id' | 'criado_em' | 'atualizado_em'
>;

// 3. Classe do Modelo
export class EspecialidadeModel extends Model<EspecialidadeAttributes, EspecialidadeCreationAttributes> implements EspecialidadeAttributes {
    public id!: number;
    public nome!: string;
    public criado_em!: Date;
    public atualizado_em!: Date;
    
    // Métodos estáticos para associações
    static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
        // Associação N:N (Many-to-Many) com Profissional através da tabela pivot
        if (models.Profissional) {
            EspecialidadeModel.belongsToMany(models.Profissional, {
                through: models.ProfissionalEspecialidade, // Tabela de ligação
                foreignKey: 'especialidade_id',            // Chave deste modelo na tabela de ligação
                otherKey: 'profissional_id',               // Chave do outro modelo na tabela de ligação
                as: 'profissionais'
            });
        }
    }
}

export type EspecialidadeModelStatic = typeof EspecialidadeModel;

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof EspecialidadeModel => {
    EspecialidadeModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        criado_em: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        atualizado_em: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }

    }, {
        sequelize,
        modelName: 'Especialidade',
        tableName: 'especialidades',
        // 🔑 Configuração dos Timestamps
        timestamps: true,
        createdAt: 'criado_em',
        updatedAt: 'atualizado_em'
    });

    return EspecialidadeModel;
};