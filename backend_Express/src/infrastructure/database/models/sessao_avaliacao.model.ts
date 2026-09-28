import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface de Atributos
export interface SessaoAvaliacaoAttributes {
    id: number;
    sessao_id: string;      // Chave para a sessão específica
    paciente_id: number;    // Quem avaliou
    profissional_id: number; // Quem foi avaliado (denormalização para performance)
    nota: number;           // 1 a 5 
    comentario: string | null;
    data_avaliacao: Date;
}

// Interface para Atributos de Criação
type SessaoAvaliacaoCreationAttributes = Optional<
    SessaoAvaliacaoAttributes, 
    'id' | 'comentario' | 'data_avaliacao'
>;

// Classe do Modelo
export class SessaoAvaliacaoModel extends Model<SessaoAvaliacaoAttributes, SessaoAvaliacaoCreationAttributes> implements SessaoAvaliacaoAttributes {
    public id!: number;
    public sessao_id!: string;
    public paciente_id!: number;
    public profissional_id!: number;
    public nota!: number;
    public comentario!: string | null;
    public data_avaliacao!: Date;

    static associate(models: any) {
        // Uma avaliação pertence a uma sessão
        SessaoAvaliacaoModel.belongsTo(models.Sessao, { 
            foreignKey: 'sessao_id', 
            as: 'sessao' 
        });

        // Uma avaliação é feita por um paciente (usuário)
        SessaoAvaliacaoModel.belongsTo(models.Usuario, { 
            foreignKey: 'paciente_id', 
            as: 'paciente' 
        });

        // Uma avaliação é direcionada a um profissional (usuário)
        SessaoAvaliacaoModel.belongsTo(models.Usuario, { 
            foreignKey: 'profissional_id', 
            as: 'profissional' 
        });
    }
}

export type SessaoAvaliacaoModelStatic = typeof SessaoAvaliacaoModel;

// Função de Inicialização
export default (sequelize: Sequelize): typeof SessaoAvaliacaoModel => {
    SessaoAvaliacaoModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sessao_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sessoes',
                key: 'id'
            }
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
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        nota: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        data_avaliacao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'SessaoAvaliacao',
        tableName: 'sessoes_avaliacoes',
        timestamps: false
    });

    return SessaoAvaliacaoModel;
};