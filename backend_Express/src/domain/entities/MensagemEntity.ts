// src/domain/entities/MensagemEntity.ts

import AppError from "../../application/errors/AppError";

export interface MensagemProps {
    id?: number;          // Opcional pois não existe antes de persistir
    conversaId: number;
    remetenteId: number;
    conteudo: string;     // O texto real, legível
    iv?: string;          // Opcional: A entidade pode carregar o IV se necessário para debug, mas não é obrigatório para a regra de negócio
    lida?: boolean;
    data_envio?: Date;
}

export class MensagemEntity {
    private readonly LIMITE_MINUTOS = 5;
    constructor(public readonly props: MensagemProps) {
        this.validate();

        // Definições padrão caso não sejam informadas
        if (this.props.lida === undefined) {
            this.props.lida = false;
        }
        if (!this.props.data_envio) {
            this.props.data_envio = new Date();
        }
    }

    // Getters para acesso fácil
    get id(): number | undefined {
        return this.props.id;
    }

    get conversaId(): number {
        return this.props.conversaId;
    }

    get remetenteId(): number {
        return this.props.remetenteId;
    }

    get texto(): string {
        return this.props.conteudo;
    }

    get lida(): boolean {
        return this.props.lida!; // O ! garante que existe pois está definido no constructor
    }

    get dataEnvio(): Date {
        return this.props.data_envio!;
    }

    // --- Comportamentos de Domínio ---

    /**
     * Marca a mensagem como lida e atualiza o estado da entidade
     */
    public marcarComoLida(): void {
        this.props.lida = true;
    }

    /**
     * Verifica se pode deletar com regra de 3 minutos
     */

    public podeDeletar(): void {
        // Validação do Timer
        const agora = new Date();
        const dataEnvio = new Date(this.props.data_envio!);
        const diferencaMinutos = (agora.getTime() - dataEnvio.getTime()) / (1000 * 60);

        if (diferencaMinutos > this.LIMITE_MINUTOS) {
            throw new AppError('O tempo limite para editar esta mensagem expirou', 400);
        }
    }


    /**
     * Validações de regra de negócio
     */
    private validate(): void {
        if (!this.props.conteudo || this.props.conteudo.trim().length === 0) {
            throw new AppError("O conteúdo da mensagem não pode estar vazio.", 400);
        }

        if (!this.props.conversaId) {
            throw new AppError("A mensagem deve estar vinculada a uma conversa.", 400);
        }

        if (!this.props.remetenteId) {
            throw new AppError("A mensagem deve ter um remetente.", 400);
        }
    }

    /**
     * Método auxiliar para formatar a saída JSON (útil para o Controller)
     */
    public toJSON() {
        return {
            id: this.id,
            conversaId: this.conversaId,
            remetenteId: this.remetenteId,
            texto: this.texto,
            lida: this.lida,
            dataEnvio: this.dataEnvio
        };
    }
}