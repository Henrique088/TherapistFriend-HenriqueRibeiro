// src/domain/entities/EspecialidadeEntity.ts

import AppError from "../../application/errors/AppError";

/**
 * Interface que representa os dados puros necessários para construir uma EspecialidadeEntity.
 */
export interface EspecialidadeData {
    id: number | null;
    nome: string;
    criadoEm: Date;
    atualizadoEm: Date;
}

/**
 * Entidade de Domínio que representa uma Especialidade.
 * Responsável por garantir a integridade e aplicar regras de negócio (como a validação do nome).
 */
export interface IEspecialidadeJSON {
    id: number | null;
    nome: string;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class EspecialidadeEntity {
    public readonly id: number | null;
    public nome: string;
    public readonly criadoEm: Date;
    public readonly atualizadoEm: Date;

    constructor({ id = null, nome, criadoEm, atualizadoEm }: EspecialidadeData) {
        if (!nome || typeof nome !== 'string' || nome.trim() === "") {
            throw new AppError("O nome da especialidade é obrigatório.");
        }
        
        this.id = id;
        this.nome = nome.trim();
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }

    public alterarNome(novoNome: string): void {
        if (!novoNome || novoNome.trim() === "") {
            throw new AppError("Nome da especialidade não pode ser vazio.");
        }
        this.nome = novoNome.trim();
    }

    // 🔑 Implementação do toJSON
    public toJSON(): IEspecialidadeJSON {
        return {
            id: this.id,
            nome: this.nome,
            criadoEm: this.criadoEm,
            atualizadoEm: this.atualizadoEm
        };
    }
}