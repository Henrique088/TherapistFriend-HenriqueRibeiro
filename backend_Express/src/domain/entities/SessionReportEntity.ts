// src/domain/entities/SessionReportEntity.ts

import AppError from "../../application/errors/AppError";

export interface ISessionReportSummary {
    emocao_predominante: string;
    confianca_media: number;
    timeline: Array<{
        timestamp: string;
        label: string;
        score: number;
    }>;
    insights_ia: {
        nivel_ansiedade: 'baixo' | 'moderado' | 'alto';
        sugestao_abordagem: string;
        picos_emocionais: number; // quantidade de mudanças bruscas
    };
}

export interface SessionReportProps {
    id?: number;
    session_id: string;
    paciente_id: number;
    profissional_id: number;
    summary: ISessionReportSummary;
    profissional_comment?: string | null;
    created_at?: Date | null;
}

export interface ISessionReportData {
    id: number;
    session_id: string;
    paciente_id: number;
    profissional_id: number;
    summary: ISessionReportSummary;
    profissional_comment: string | null;
    created_at: Date | null;
}

export class SessionReportEntity {
    constructor(private props: SessionReportProps) {
        // Validações de domínio
        if (!props.session_id || props.session_id.trim().length === 0) {
            throw new AppError("O ID da sessão é obrigatório.");
        }
        
        if (!props.summary || !props.summary.emocao_predominante) {
            throw new AppError("O resumo da sessão deve conter uma emoção predominante.");
        }
        
        if (props.summary.confianca_media < 0 || props.summary.confianca_media > 100) {
            throw new AppError("A confiança média deve estar entre 0 e 1.");
        }
        
        // Validação do created_at
        if (props.created_at && !(props.created_at instanceof Date)) {
            throw new Error("created_at deve ser uma instância de Date");
        }
    }

    // Getters para acessar os dados com segurança
    public get id() { return this.props.id; }
    public get session_id() { return this.props.session_id; }
    public get paciente_id() { return this.props.paciente_id; }
    public get profissional_id() { return this.props.profissional_id; }
    public get summary() { return this.props.summary; }
    public get profissional_comment() { return this.props.profissional_comment; }
    public get created_at() { return this.props.created_at; }

    // Lógica de Negócio: Verifica se o profissional pode editar o comentário
    public podeEditarComentario(profissionalId: number): boolean {
        return this.profissional_id === profissionalId;
    }

    // Lógica de Negócio: Verifica se o relatório está completo
    public estaCompleto(): boolean {
        return this.profissional_comment !== null && 
               this.profissional_comment !== undefined && 
               this.profissional_comment.trim().length > 0;
    }

    // Lógica de Negócio: Verifica se o relatório é recente (últimas 24 horas)
    public ehRecente(): boolean {
        if (!this.created_at) return false;
        
        const agora = new Date();
        const umDiaEmMs = 24 * 60 * 60 * 1000;
        const diferenca = agora.getTime() - this.created_at.getTime();
        
        return diferenca <= umDiaEmMs;
    }

    // Métodos de negócio para modificar o estado
    public editarComentario(novoComentario: string, profissionalId: number): void {
        if (!this.podeEditarComentario(profissionalId)) {
            throw new AppError("Apenas o profissional responsável pode editar o comentário.");
        }
        
        if (novoComentario && novoComentario.length > 1000) {
            throw new AppError("O comentário é muito longo. Máximo de 1000 caracteres.");
        }
        
        this.props.profissional_comment = novoComentario;
    }

    public atualizarSummary(novoSummary: ISessionReportSummary): void {
        // Validações básicas antes de atualizar
        if (!novoSummary.emocao_predominante) {
            throw new Error("A emoção predominante é obrigatória.");
        }
        
        if (novoSummary.confianca_media < 0 || novoSummary.confianca_media > 1) {
            throw new AppError("A confiança média deve estar entre 0 e 1.");
        }
        
        this.props.summary = novoSummary;
    }

    // Converte para objeto simples (usado para salvar ou enviar via JSON)
    public toJSON(): ISessionReportData {
        return {
            id: this.props.id!,
            session_id: this.props.session_id,
            paciente_id: this.props.paciente_id,
            profissional_id: this.props.profissional_id,
            summary: this.props.summary,
            profissional_comment: this.props.profissional_comment ?? null,
            created_at: this.props.created_at ?? null
        };
    }
}