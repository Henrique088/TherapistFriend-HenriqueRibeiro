// src/infrastructure/database/models/profissional.model.ts

import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize';
import { EspecialidadeAttributes } from './especialidade.model';

// 1. Interface de Atributos (Propriedades reais da tabela)
export interface ProfissionalAttributes {
  id: number;                 // ID primário (Sequelize assume se não for definido)
  bio: string | null;         // Descrição/biografia
  cpf: string | null;         // CPF do profissional
  crp: string | null;         // CRP do profissional
  // especialidades: string[];   // Array de strings para especialidades (PostgreSQL ARRAY)
  id_usuario: number;         // Chave estrangeira para a tabela Usuario
  validado: boolean;        // Indica se o profissional foi validado
  criado_em: Date | null;           // Timestamp de criação
  atualizado_em: Date | null;       // Timestamp de atualização
  especialidades?: EspecialidadeAttributes[];
  admin_id?: number | null;
  status: 'pendente' | 'validado' | 'revogado' |  'em_analise';
  data_validacao: Date | null;
}

// 2. Interface para Atributos de Criação (Campos opcionais durante a criação)
// O ID do Profissional é auto-incrementado, e bio são opcionais.
type ProfissionalCreationAttributes = Optional<ProfissionalAttributes, 'id' | 'bio' | 'cpf' | 'crp'>;

// 3. Classe do Modelo
export class ProfissionalModel extends Model<ProfissionalAttributes, ProfissionalCreationAttributes> implements ProfissionalAttributes {
  public id!: number;
  public bio!: string | null;
  public cpf!: string | null;
  public crp!: string | null;
  public id_usuario!: number;
  public validado!: boolean;
  public criado_em!: Date | null;
  public atualizado_em!: Date | null;
  public admin_id!: number | null;
  public status!: 'pendente' | 'validado' | 'revogado' | 'em_analise';
  public data_validacao!: Date | null;

  // Métodos estáticos para associações
  static associate(models: { [key: string]: ModelStatic<Model<any, any>> }) {
    // Relação N:1 - Um Profissional pertence a um Usuário
    // A chave estrangeira 'id_usuario' está no modelo Profissional
    ProfissionalModel.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "usuario"
    });

    // if para garantir que os modelos existem antes de criar as associações em caso do sequelize inicializar em ordem diferente
    // Relação N:N - Profissional tem muitas Especialidades
    if (models.Especialidade && models.ProfissionalEspecialidade) {

      ProfissionalModel.belongsToMany(models.Especialidade, {
        through: models.ProfissionalEspecialidade, // Usa o model da tabela de ligação
        foreignKey: 'profissional_id',             // Chave deste model na pivot
        otherKey: 'especialidade_id',              // Chave do outro model na pivot
        as: 'especialidades'                       // Como você vai chamar no "include"
      });
    }

    ProfissionalModel.hasMany(models.HistoricoValidacao, {
      foreignKey: 'profissional_id',
      as: 'historicos'
    });


  }
}

export type ProfissionalModelStatic = typeof ProfissionalModel;

// 4. Função de Inicialização/Definição do Modelo
export default (sequelize: Sequelize): typeof ProfissionalModel => {
  ProfissionalModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: { // Chave estrangeira que liga ao Usuario
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Garante a relação 1:1 com Usuario
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true, // Bio é opcional
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    crp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    validado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    criado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    atualizado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,

    },

    data_validacao: {
      type: DataTypes.DATE,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('pendente', 'validado', 'revogado', 'em_analise'),
      defaultValue: 'pendente'
    }



  }, {
    sequelize,
    modelName: 'Profissional',
    tableName: 'profissionais',
    timestamps: false, // Mantendo a configuração do JS original
  });

  return ProfissionalModel;
};