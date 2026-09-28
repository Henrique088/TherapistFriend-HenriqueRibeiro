// src/infrastructure/databse/models/voucher.model.ts


import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface VoucherAttributes {
    id?: number;
    paciente_id: number;
    profissional_id: number;
    urgencia_origem_id?: number;
    codigo: string;
    status:  'disponivel' | 'usado' | 'expirado';
    data_expiracao: Date;
    createdAt?: Date;
}

type VoucherCreationAttributes = Optional<VoucherAttributes, 'id' | 'urgencia_origem_id' | 'createdAt'>;


export class VoucherModel extends Model<VoucherAttributes, VoucherCreationAttributes> implements VoucherAttributes {
    public id!: number;
    public profissional_id!: number;
    public paciente_id!: number;
    public urgencia_origem_id!: number;
    public codigo!: string;
    public status!:  'disponivel' | 'usado' | 'expirado';
    public data_expiracao!: Date;
    public createdAt?: Date;

}

export type VoucherModelStatic = typeof VoucherModel;


export default (sequelize: Sequelize): typeof VoucherModel => {
    VoucherModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profissional_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        paciente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        urgencia_origem_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('disponivel', 'usado', 'expirado'),
            defaultValue: 'disponivel',
            allowNull: false
        },
        data_expiracao: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Voucher',
        tableName: 'vourcher',
        timestamps: true,
        underscored: true // Garante que campos como createdAt virem created_at no banco
    });

    return VoucherModel;
};


