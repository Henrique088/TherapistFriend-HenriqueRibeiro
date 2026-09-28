import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface MoodRegistroAttributes {
  id: number;
  usuario_id: number;
  mood: 'ansiedade'| 'tristeza' |'raiva' |'medo' |'felicidade' |'neutral';
  intensidade: number;
  periodo: 'manha' | 'tarde' | 'noite';
  data_referencia: Date;
  criado_em?: Date;
  atualizado_em?: Date;
}

type MoodRegistroCreationAttributes = Optional<MoodRegistroAttributes, 'id' | 'criado_em' | 'atualizado_em'>;

export class MoodRegistroModel extends Model<MoodRegistroAttributes, MoodRegistroCreationAttributes> implements MoodRegistroAttributes {
  public id!: number;
  public usuario_id!: number;
  public mood!: 'ansiedade'| 'tristeza' |'raiva' |'medo' |'felicidade' |'neutral';
  public intensidade!: number;
  public periodo!: 'manha'| 'tarde' | 'noite';
  public data_referencia!: Date;
  public readonly criado_em!: Date;
  public readonly atualizado_em!: Date;

  static associate(models: any) {
    // Cada registro de mood pertence a um usuário
    MoodRegistroModel.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  }
}

export type MoodRegistroModelStatic = typeof MoodRegistroModel;

export default (sequelize: Sequelize): typeof MoodRegistroModel => {
  MoodRegistroModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    mood: {
      type: DataTypes.ENUM(
        'ansiedade',
        'tristeza',
        'raiva',
        'medo',
        'felicidade',
        'neutral'
      ),
      allowNull: false
    },
    intensidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5
      }
    },
    periodo: {
      type: DataTypes.ENUM('manha', 'tarde', 'noite'),
      allowNull: false
    },
    data_referencia: {
      type: DataTypes.DATEONLY, // DATEONLY mapeia para o tipo DATE do SQL (sem hora)
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MoodRegistro',
    tableName: 'mood_registros',
    timestamps: true,
    underscored: true,
    createdAt: 'criado_em', // Mapeia o nome da coluna do banco para o Sequelize
    updatedAt: 'atualizado_em',
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'data_referencia', 'periodo'],
        name: 'mood_registros_unique_registro' // Nome opcional para o índice
      }
    ]
  });

  return MoodRegistroModel;
};