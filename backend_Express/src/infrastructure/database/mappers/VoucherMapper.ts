// src/infrastructure/database/mappers/VoucherMapper.ts

import { VoucherEntity } from '../../../domain/entities/VoucherEntity';
import { VoucherModel } from '../models/voucher.model';

export class VoucherMapper {
    public static toDomain(model: VoucherModel): VoucherEntity {
        return new VoucherEntity({
            id: model.id,
            pacienteId: model.paciente_id,
            profissionalId: model.profissional_id,
            urgenciaOrigemId: model.urgencia_origem_id,
            codigo: model.codigo,
            status: model.status as any,
            dataExpiracao: model.data_expiracao,
            createdAt: model.createdAt
        });
    }
}