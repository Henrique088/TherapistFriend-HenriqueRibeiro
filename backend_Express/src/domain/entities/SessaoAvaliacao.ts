// src/domain/entities/SessaoAvaliacaoEntity.ts

import AppError from "../../application/errors/AppError";

export interface SessaoAvaliacaoProps {
    id?: number;
    sessaoId: string;
    pacienteId: number;
    profissionalId: number;
    nota: number;
    comentario: string | null;
    dataAvaliacao?: Date;
}

export class SessaoAvaliacaoEntity {
    private readonly _id?: number;
    private readonly _sessaoId: string;
    private readonly _pacienteId: number;
    private readonly _profissionalId: number;
    private _nota: number;
    private _comentario: string | null;
    private readonly _dataAvaliacao: Date;

    constructor(props: SessaoAvaliacaoProps) {
        this.validateNota(props.nota);
        
        this._id = props.id;
        this._sessaoId = props.sessaoId;
        this._pacienteId = props.pacienteId;
        this._profissionalId = props.profissionalId;
        this._nota = props.nota;
        this._comentario = props.comentario || null;
        this._dataAvaliacao = props.dataAvaliacao || new Date();
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get sessaoId(): string { return this._sessaoId; }
    get pacienteId(): number { return this._pacienteId; }
    get profissionalId(): number { return this._profissionalId; }
    get nota(): number { return this._nota; }
    get comentario(): string | null { return this._comentario; }
    get dataAvaliacao(): Date { return this._dataAvaliacao; }

    // Validações privadas
    private validateNota(nota: number): void {
        if (nota < 1 || nota > 5) {
            throw new AppError("A nota de avaliação deve estar entre 1 e 5.");
        }
    }

    private validateComentario(comentario: string | null): void {
        if (comentario && comentario.length > 500) {
            throw new AppError("O comentário não pode exceder 500 caracteres.");
        }
    }

    // Métodos de negócio
    public atualizarAvaliacao(nota: number, comentario: string | null): void {
        this.validateNota(nota);
        this.validateComentario(comentario);
        
        this._nota = nota;
        this._comentario = comentario;
    }

    public isAvaliacaoAlta(): boolean {
        return this._nota >= 4;
    }

    public isAvaliacaoBaixa(): boolean {
        return this._nota <= 2;
    }

    // Factory method
    public static create(props: SessaoAvaliacaoProps): SessaoAvaliacaoEntity {
        return new SessaoAvaliacaoEntity(props);
    }

    // Para serialização
    public toJSON(): SessaoAvaliacaoProps {
        return {
            id: this._id,
            sessaoId: this._sessaoId,
            pacienteId: this._pacienteId,
            profissionalId: this._profissionalId,
            nota: this._nota,
            comentario: this._comentario,
            dataAvaliacao: this._dataAvaliacao
        };
    }
}