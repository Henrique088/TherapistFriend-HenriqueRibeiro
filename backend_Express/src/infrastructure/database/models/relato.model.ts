// src/infrastructure/database/models/relato.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 1. Interface de Atributos
export interface RelatoAttributes {
    id: number;
    paciente_id: number;
    profissional_id: number | null;
    titulo: string;
    texto: string;
    categoria: string;
    anonimo: boolean;
    status: 'pendente' | 'aguardando_aprovacao' | 'em_conversa' | 'arquivado';
    ids_profissionais_recusados: number[]; // Array de IDs para evitar spam
    resultado_ia: string;
    data_envio: Date;
}

// 2. Interface para Atributos de Criação
type RelatoCreationAttributes = Optional<
    RelatoAttributes, 
    'id' | 'profissional_id' | 'status' | 'ids_profissionais_recusados' | 'resultado_ia' | 'data_envio'
>;

// 3. Classe do Modelo
export class RelatoModel extends Model<RelatoAttributes, RelatoCreationAttributes> implements RelatoAttributes {
    public id!: number;
    public paciente_id!: number;
    public profissional_id!: number | null;
    public titulo!: string;
    public texto!: string;
    public categoria!: string;
    public anonimo!: boolean;
    public status!: 'pendente' | 'aguardando_aprovacao' | 'em_conversa' | 'arquivado';
    public ids_profissionais_recusados!: number[];
    public resultado_ia!: string;
    public data_envio!: Date;
    public readonly paciente?: any; 
    public readonly profissional?: any;
    

    static associate(models: any) {
        // Um relato pertence a um paciente (usuário)
        RelatoModel.belongsTo(models.Usuario, { 
            foreignKey: 'paciente_id', 
            as: 'paciente' 
        });

        // Um relato pode estar vinculado a um profissional (usuário)
        RelatoModel.belongsTo(models.Usuario, { 
            foreignKey: 'profissional_id', 
            as: 'profissional' 
        });

        if (models.Usuario && models.Like) {
        RelatoModel.belongsToMany(models.Usuario, {
            through: models.Like,
            foreignKey: 'relatoId',
            otherKey: 'usuarioId',
            as: 'curtidas',
            onDelete: 'CASCADE',
        });
    }
    }
}

export type RelatoModelStatic = typeof RelatoModel;

// 4. Função de Inicialização
export default (sequelize: Sequelize): typeof RelatoModel => {
    RelatoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        texto: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [[
                    'Saúde Mental', 'Relacionamentos', 'Autoestima', 'Ansiedade', 
                    'Depressão', 'Timidez', 'Estresse', 'Transtornos de Humor',
                    'Transtornos de Ansiedade', 'Transtornos Obsessivos Compulsivos',
                    'Transtornos Alimentares', 'Solidão', 'TDAH', 'Outros'
                ]]
            }
        },
        anonimo: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('pendente', 'aguardando_aprovacao', 'em_conversa', 'arquivado'),
            defaultValue: 'pendente'
        },
        ids_profissionais_recusados: {
            type: DataTypes.JSONB, // No MySQL/Postgres isso armazena o array perfeitamente
            defaultValue: []
        },
        resultado_ia: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: 'indeterminado'
        },
        data_envio: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Relato',
        tableName: 'relatos',
        timestamps: false
    });

    return RelatoModel;
};