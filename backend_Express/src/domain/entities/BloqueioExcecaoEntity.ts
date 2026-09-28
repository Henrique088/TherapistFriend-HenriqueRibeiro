// src/domain/entities/BloqueioExcecaoEntity.ts

export interface BloqueioExcecaoProps {
    id?: number;
    bloqueioId?: number;
    dataExcecao: Date;
    motivo?: string;
}

export class BloqueioExcecaoEntity {
    private props: BloqueioExcecaoProps;

    constructor(props: BloqueioExcecaoProps) {
        
        this.props = props;
    }

    get id(): number | undefined { return this.props.id; }
    get bloqueioId(): number | undefined { return this.props.bloqueioId}
    get dataExcecao(): Date { return this.props.dataExcecao; }
    get motivo(): string | undefined { return this.props.motivo; }
}