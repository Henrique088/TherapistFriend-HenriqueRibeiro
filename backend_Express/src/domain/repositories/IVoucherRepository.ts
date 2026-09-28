// src/domain/repositories/IVoucherRepository.ts

import { VoucherEntity } from '../entities/VoucherEntity';

export interface IVoucherRepository {

    criar(voucher: VoucherEntity): Promise<VoucherEntity>;

    buscarVoucherValido(pacienteId: number, profissionalId: number): Promise<VoucherEntity | null>;

    consumirVoucher(voucherId: number): Promise<void>;

    buscarPorId(voucherId: number): Promise<VoucherEntity | null>;

    atualizar(Voucher: VoucherEntity): Promise<void>;
}