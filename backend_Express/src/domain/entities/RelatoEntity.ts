// src/domain/entities/RelatoEntity.ts

import AppError from "../../application/errors/AppError";

export type RelatoStatus = 'pendente' | 'aguardando_aprovacao' | 'em_conversa' | 'arquivado';

export interface RelatoProps {
    id?: number;
    paciente_id: number;
    profissional_id?: number | null;
    titulo: string;
    texto: string;
    categoria: string;
    anonimo: boolean;
    status: RelatoStatus;
    ids_profissionais_recusados: number[];
    resultado_ia: string;
    data_envio?: Date;
    quantidadeLikes?: number | 0;
    jaCurtiu?: boolean;
    codinomePaciente?: string;
}

export class RelatoEntity {
    constructor(private props: RelatoProps) {
        // Aqui você pode adicionar validações de domínio se necessário
        if (props.texto.length < 10) throw new Error("O relato é muito curto.");
    }

    // Getters para acessar os dados com segurança
    public get id() { return this.props.id; }
    public get paciente_id() { return this.props.paciente_id; }
    public get profissional_id() { return this.props.profissional_id; }
    public get titulo() { return this.props.titulo; }
    public get texto() { return this.props.texto; }
    public get categoria() { return this.props.categoria; }
    public get anonimo() { return this.props.anonimo; }
    public get status() { return this.props.status; }
    public get ids_profissionais_recusados() { return this.props.ids_profissionais_recusados; }
    public get resultado_ia() { return this.props.resultado_ia; }
    public get data_envio() { return this.props.data_envio; }
    public get quantidadeLikes(){ return this.props.quantidadeLikes; }
    public get jaCurtiu(){ return this.props.jaCurtiu; }
    public get codinomePaciente(){ return this.props.codinomePaciente; }

    // Lógica de Negócio: O profissional pode ver o resultado da IA?
    public podeExibirResultadoIA(usuarioTipo: string): boolean {
        return usuarioTipo === 'profissional';
    }

    // Solicita conversa ao paciente
    public solicitarConversa(profissionalId: number): void {

        this.validarStatus('aguardando_aprovacao');
        this.props.status = 'aguardando_aprovacao';
        this.props.profissional_id = profissionalId;
    }

    public recusaRelato(): void{
        this.props.profissional_id = null;
        this.props.status = 'pendente'
    }


    private validarStatus(status: RelatoStatus): void {

        const statusValidos: RelatoStatus[] = [
            'pendente',
            'aguardando_aprovacao',
            'em_conversa',
            'arquivado'
        ];
        if (!statusValidos.includes(status)) {
            throw new AppError(`Status inválido: ${status}`);

        }
    }

    public mudarTexto(novoTexto: string): void {
        if (novoTexto.length < 10) {
            throw new AppError("O relato é muito curto.");
        }
        this.props.texto = novoTexto;
    }

    public mudarTitulo(novoTitulo: string): void {
        if (novoTitulo.length < 5) {
            throw new AppError("O título é muito curto.");
        }
        this.props.titulo = novoTitulo;
    }
    
    public mudarCategoria(novaCategoria: string): void {
        this.props.categoria = novaCategoria;
    }

    public mudarAnonimato(anonimo: boolean): void {
        this.props.anonimo = anonimo;
    }

    // Converte para objeto simples (usado para salvar ou enviar via JSON)
    public toJSON(): RelatoProps {
        return { ...this.props };
    }
}