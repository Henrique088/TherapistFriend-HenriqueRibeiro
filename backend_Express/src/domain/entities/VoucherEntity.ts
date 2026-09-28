// src/domain/entities/VoucherEntity.ts

export interface VoucherProps {
    id?: number;
    pacienteId: number;
    profissionalId: number;
    urgenciaOrigemId: number; // Rastreabilidade: qual urgência gerou este voucher
    codigo: string;           // Ex: VIP-2026-X82
    status: 'disponivel' | 'usado' | 'expirado';
    dataExpiracao: Date;
    createdAt?: Date;
}

export class VoucherEntity {
    private props: VoucherProps;

    constructor(props: VoucherProps) {
        this.props = {
            ...props,
            status: props.status ?? 'disponivel',
            // Default: expira em 7 dias se não definido
            dataExpiracao: props.dataExpiracao ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }

    get id() { return this.props.id; }
    get pacienteId() { return this.props.pacienteId; }
    get profissionalId() { return this.props.profissionalId; }
    get status() { return this.props.status; }
    get dataExpiracao() { return this.props.dataExpiracao; }
    get urgenciaOrigemId(){ return this.props.urgenciaOrigemId}
    get codigo(){ return this.props.codigo}

    public estaValido(): boolean {
        return this.props.status === 'disponivel' && this.props.dataExpiracao > new Date();
    }

    public marcarComoUsado(): void {
        this.props.status = 'usado';
    }
}