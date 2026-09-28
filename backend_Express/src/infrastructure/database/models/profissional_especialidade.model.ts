// src/infrastructure/database/models/profissional_especialidade.model.ts

import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';

// 1. Interface de Atributos (Propriedades reais da tabela de ligação)
export interface ProfissionalEspecialidadeAttributes {
    id: number;
    profissional_id: number;
    especialidade_id: number;
}

// 2. Interface para Atributos de Criação
type ProfissionalEspecialidadeCreationAttributes = Optional<ProfissionalEspecialidadeAttributes, 'id'>;

// 3. Classe do Modelo
export class ProfissionalEspecialidadeModel extends Model<ProfissionalEspecialidadeAttributes, ProfissionalEspecialidadeCreationAttributes> implements ProfissionalEspecialidadeAttributes {
    public id!: number;
    public profissional_id!: number;
    public especialidade_id!: number;

    // Métodos estáticos para associações
    static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
        // Associação explícita para o Profissional (lado esquerdo da ligação)
        if (models.Profissional) {
            ProfissionalEspecialidadeModel.belongsTo(models.Profissional, { 
                foreignKey: 'profissional_id',
                as: 'profissional'
            });
        }
        
        // Associação explícita para a Especialidade (lado direito da ligação)
        if (models.Especialidade) {
            ProfissionalEspecialidadeModel.belongsTo(models.Especialidade, { 
                foreignKey: 'especialidade_id',
                as: 'especialidade'
            });
        }
        
        
    }
}

export type ProfissionalEspecialidadeModelStatic = typeof ProfissionalEspecialidadeModel;

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof ProfissionalEspecialidadeModel => {
    ProfissionalEspecialidadeModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // 🔑 Adiciona índice único composto para evitar duplicação (Profissional A -> Especialidade X)
            unique: 'profissionalEspecialidadeIndex' 
        },
        especialidade_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'profissionalEspecialidadeIndex' // Faz parte do índice composto
        }
    }, {
        sequelize,
        modelName: 'ProfissionalEspecialidade',
        tableName: 'profissionais_especialidades', 
        timestamps: false,
        // 🔑 Adicionamos um índice composto para garantir que a combinação FKs seja única:
        indexes: [
            {
                unique: true,
                fields: ['profissional_id', 'especialidade_id'],
            },
        ],
    });

    return ProfissionalEspecialidadeModel;
};