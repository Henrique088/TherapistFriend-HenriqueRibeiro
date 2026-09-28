// src/domain/entities/PacienteEntity.ts

import AppError from "../../application/errors/AppError";



interface PacienteConstructorParams {
    id?: number | null;
    idUsuario: number;
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    codinome?: string | null;
    criadoEm?: Date;
    atualizadoEm?: Date;
}

export interface IPacienteData {
    id: number | null,
    idUsuario: number | null,
    nome?: string | null,
    email?: string | null,
    telefone?: string | null,
    codinome: string | null
}

export class PacienteEntity {
    public readonly id: number | null;
    public readonly idUsuario: number;
    public readonly nome?: string | null;
    public readonly email?: string | null;
    public readonly telefone?: string | null;
    public codinome: string | null;
    public criadoEm: Date | undefined;
    public atualizadoEm: Date | undefined;

    constructor({
        id = null,
        idUsuario,
        nome,
        email,
        telefone,
        codinome = null,
        criadoEm,
        atualizadoEm
    }: PacienteConstructorParams) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.nome  = nome;
        this.email = email;
        this.telefone = telefone;
        this.codinome = codinome;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }


    definirCodinome(novo: string): void {
        if (!novo || novo.trim() === "") {
            throw new AppError("Codinome não pode ser vazio.");
        }
        this.codinome = novo.trim();
    }

    toJSON(): IPacienteData{
        return {
            id: this.id,
            idUsuario: this.idUsuario,
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            codinome: this.codinome
        };
    }
}