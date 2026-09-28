// src/infrastructure/database/models/paciente.model.ts

import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';

// 1. Interface de Atributos (Propriedades reais da tabela)
export interface PacienteAttributes {
    id: number;
    id_usuario: number ;         // Chave estrangeira para a tabela Usuario
    codinome: string | null;    // Nome opcional
    criado_em: Date;            // Timestamp de criação
    atualizado_em: Date;        // Timestamp de atualização
}

// 2. Interface para Atributos de Criação 
type PacienteCreationAttributes = Optional<PacienteAttributes,
    'id' | 'codinome'  | 'criado_em' | 'atualizado_em'
>;

// 3. Classe do Modelo
export class PacienteModel extends Model<PacienteAttributes, PacienteCreationAttributes> implements PacienteAttributes {
    public id!: number;
    public id_usuario!: number;
    public codinome!: string | null;
    public criado_em!: Date;
    public atualizado_em!: Date;

    // Métodos estáticos para associações
    static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
        // Relação N:1 - Um Paciente pertence a um Usuário (Relação 1:1 lógica)
        PacienteModel.belongsTo(models.Usuario, {
            foreignKey: "id_usuario",
            as: "usuario"
        });
    }
}

export type PacienteModelStatic = typeof PacienteModel;

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof PacienteModel => {
    PacienteModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // Garante que cada Usuário tenha no máximo um registro Paciente (Relação 1:1)
        },
        codinome: {
            type: DataTypes.STRING,
            allowNull: true
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
        modelName: "Paciente",
        tableName: "pacientes",
        
        timestamps: true,
        createdAt: "criado_em",
        updatedAt: "atualizado_em"
    });

    return PacienteModel;
};