// src/infrastructure/database/models/historico_validacao_profissional.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface HistoricoValidacaoAttributes {
  id: number;
  profissional_id: number;
  admin_id: number;
  status: 'validado' | 'reprovado' | 'revogado';
  motivo: string | null;
  data_decisao: Date;
}

// Atributos opcionais na criação (ID é auto-increment e data_decisao tem default)
type HistoricoValidacaoCreationAttributes = Optional<HistoricoValidacaoAttributes, 'id' | 'data_decisao'>;

export class HistoricoValidacaoModel extends Model<HistoricoValidacaoAttributes, HistoricoValidacaoCreationAttributes> 
    implements HistoricoValidacaoAttributes {
    
    public id!: number;
    public profissional_id!: number;
    public admin_id!: number;
    public status!: 'validado' | 'reprovado' | 'revogado';
    public motivo!: string | null;
    public readonly data_decisao!: Date;

    static associate(models: any) {
        // Relaciona com o Profissional
        HistoricoValidacaoModel.belongsTo(models.Profissional, { 
            foreignKey: 'profissional_id', 
            as: 'profissional' 
        });
        // Relaciona com o Admin (que é um Usuario)
        HistoricoValidacaoModel.belongsTo(models.Usuario, { 
            foreignKey: 'admin_id', 
            as: 'admin' 
        });
    }
}

export type HistoricoValidacaoModelStatic = typeof HistoricoValidacaoModel


export default (sequelize: Sequelize): typeof HistoricoValidacaoModel => {
    HistoricoValidacaoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('validado', 'reprovado', 'revogado'),
            allowNull: false
        },
        motivo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        data_decisao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'data_decisao' // Garante o nome exato na coluna do banco
        }
    }, {
        sequelize,
        modelName: 'HistoricoValidacao',
        tableName: 'historico_validacoes_profissionais', // Nome mais semântico
        timestamps: true,
        createdAt: 'data_decisao', // Mapeia o createdAt do Sequelize para sua coluna
        updatedAt: false
    });

    return HistoricoValidacaoModel;
};