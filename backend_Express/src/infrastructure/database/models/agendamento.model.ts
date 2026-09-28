// src/infrastructure/database/models/agendamento.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { PacienteAttributes } from './paciente.model';

// Interface de Atributos
export interface AgendamentoAttributes {
    id: number;
    paciente_id: number;
    profissional_id: number;
    data_inicio: Date;
    data_fim: Date;
    codinome? : string;
    status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
    tipo: 'regular' | 'urgencia';
    observacoes?: string;
    valor?: number;
}

// Interface para Atributos de Criação
type AgendamentoCreationAttributes = Optional<AgendamentoAttributes, 'id' | 'status' | 'tipo'>;

// Classe do Modelo
export class AgendamentoModel extends Model<AgendamentoAttributes, AgendamentoCreationAttributes> 
    implements AgendamentoAttributes {
    
    public id!: number;
    public paciente_id!: number;
    public profissional_id!: number;
    public data_inicio!: Date;
    public data_fim!: Date;
    public status!: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
    public tipo!: 'regular' | 'urgencia';
    public observacoes!: string;
    public valor!: number;
    public readonly paciente?: PacienteAttributes;

    static associate(models: any) {
        AgendamentoModel.belongsTo(models.Paciente, { 
            foreignKey: 'paciente_id', 
            as: 'paciente' 
        });
        AgendamentoModel.belongsTo(models.Profissional, { 
            foreignKey: 'profissional_id', 
            as: 'profissional' 
        });
    }
}

export type AgendamentoModelStatic = typeof AgendamentoModel;

// Função de Inicialização (Factory)
export default (sequelize: Sequelize): typeof AgendamentoModel => {
    AgendamentoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'pacientes', key: 'id' }
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'profissionais', key: 'id' }
        },
        data_inicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        data_fim: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'concluido'),
            defaultValue: 'pendente',
            allowNull: false
        },
        tipo: {
            type: DataTypes.ENUM('regular', 'urgencia'),
            defaultValue: 'regular',
            allowNull: false
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Agendamento',
        tableName: 'agendamentos',
        timestamps: true
    });

    return AgendamentoModel;
};