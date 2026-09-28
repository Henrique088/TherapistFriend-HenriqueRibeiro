// src/domain/entities/NotificacaoEntity.ts

import AppError from "../../application/errors/AppError";

export interface NotificacaoMetadata {
    relatoId?: number;
    profissionalId?: number;
    conversaId?: number;
    [key: string]: string | number | boolean | undefined | Date; // INDEX SIGNATURE: Isso permite que o objeto tenha propriedades dinâmicas com chaves do tipo string e valores.
}

export interface NotificacaoProps {
    id?: number;
    usuario_id: number;
    titulo: string;
    mensagem: string;
    tipo: 'SOLICITACAO_VINCULO' | 'SISTEMA' | 'CHAT' | 'AGENDA' | 'SESSAO' | 'RELATORIO';
    lida: boolean;
    metadata?: NotificacaoMetadata; // O campo JSONB
    data_criacao?: Date;
    
}

export class NotificacaoEntity {
    private props: NotificacaoProps;

    constructor(props: NotificacaoProps) {
        this.validate(props);
        this.props = {
            ...props,
            lida: props.lida ?? false,
            data_criacao: props.data_criacao ?? new Date()
        };
    }

    // Getters para expor os dados de forma segura
    get id(): number | undefined { return this.props.id; }
    get usuarioId(): number { return this.props.usuario_id; }
    get titulo(): string { return this.props.titulo; }
    get mensagem(): string { return this.props.mensagem; }
    get tipo(): string { return this.props.tipo; }
    get lida(): boolean { return this.props.lida; }
    get metadata(): NotificacaoMetadata | undefined { return this.props.metadata; }
    get createdAt(): Date | undefined { return this.props.data_criacao; }

    /**
     * Regras de Negócio: Uma notificação só faz sentido se tiver destino e conteúdo.
     */
    private validate(props: NotificacaoProps): void {
        if (!props.usuario_id) {
            throw new AppError("A notificação deve ter um destinatário (usuario_id).", 400);
        }
        if (!props.titulo || props.titulo.trim() === "") {
            throw new AppError("O título da notificação é obrigatório.", 400);
        }
        if (!props.tipo) {
            throw new AppError("O tipo da notificação deve ser definido.", 400);
        }
    }

    /**
     * Comportamento: Marcar como lida
     */
    public marcarComoLida(): void {
        this.props.lida = true;
    }

    /**
     * Facilita o envio de dados para o Socket ou Controller
     */
    public toJSON() {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            titulo: this.titulo,
            mensagem: this.mensagem,
            tipo: this.tipo,
            lida: this.lida,
            metadata: this.metadata,
            createdAt: this.createdAt
        };
    }
}