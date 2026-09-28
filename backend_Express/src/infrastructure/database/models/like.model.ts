// src/infrastructure/database/models/like.model.ts

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// 1. Interface de Atributos
export interface LikeAttributes {
  id: string; 
  relatoId: number;
  usuarioId: number;
  data_like: Date;
}

// 2. Interface para Atributos de Criação
// O ID e a data_like são gerados automaticamente
type LikeCreationAttributes = Optional<LikeAttributes, 'id' | 'data_like'>;

// 3. Classe do Modelo
export class LikeModel extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: string;
  public relatoId!: number;
  public usuarioId!: number;
  public data_like!: Date;

  static associate(models: any) {
    // Relação N:1 - Um Like pertence a um Usuário
    LikeModel.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario'
    });

    // Relação N:1 - Um Like pertence a um Relato
    LikeModel.belongsTo(models.Relato, {
      foreignKey: 'relatoId',
      as: 'relato'
    });
  }
}

export type LikeModelStatic = typeof LikeModel;

// 4. Função de Inicialização
export default (sequelize: Sequelize): typeof LikeModel => {
  LikeModel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    relatoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'relatos', key: 'id' }
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    data_like: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['relatoId', 'usuarioId'],
        name: 'unique_like_per_user_relato' // Garante que não haja duplicatas
      }
    ]
  });

  return LikeModel;
};