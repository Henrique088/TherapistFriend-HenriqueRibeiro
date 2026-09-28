// src/infra/repositories/VoucherRepository.ts

import { IVoucherRepository } from '../../../domain/repositories/IVoucherRepository';
import { VoucherEntity } from '../../../domain/entities/VoucherEntity';
import { VoucherModel } from '../models/voucher.model';
import { Op } from 'sequelize';
import { VoucherMapper } from '../mappers/VoucherMapper';

export class VoucherRepository implements IVoucherRepository {

    constructor(private voucherModel: typeof VoucherModel = VoucherModel) { }

    async criar(voucher: VoucherEntity): Promise<VoucherEntity> {
        const model = await this.voucherModel.create({
            paciente_id: voucher.pacienteId,
            profissional_id: voucher.profissionalId,
            urgencia_origem_id: voucher.urgenciaOrigemId,
            codigo: voucher.codigo,
            status: voucher.status,
            data_expiracao: voucher.dataExpiracao
        });
        return VoucherMapper.toDomain(model);
    }

    async buscarVoucherValido(pacienteId: number, profissionalId: number): Promise<VoucherEntity | null> {
        const model = await this.voucherModel.findOne({
            where: {
                paciente_id: pacienteId,
                profissional_id: profissionalId,
                status: 'disponivel',
                data_expiracao: {
                    [Op.gt]: new Date()
                }
            },
            order: [['createdAt', 'DESC']]
        });

        return model ? VoucherMapper.toDomain(model) : null;
    }

    async buscarPorId(voucherId: number): Promise<VoucherEntity | null> {
        const model = await this.voucherModel.findByPk(voucherId);
        return model ? VoucherMapper.toDomain(model) : null;
    }

    async atualizar(voucher: VoucherEntity): Promise<void> {
        await this.voucherModel.update({
            status: voucher.status
        }, {
            where: { id: voucher.id }
        });
    }

    async consumirVoucher(voucherId: number): Promise<void> {
        await this.voucherModel.update({
            status: 'usado'
        }, {
            where: { id: voucherId }
        });
    }
}