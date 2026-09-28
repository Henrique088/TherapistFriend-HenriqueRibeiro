// src/domain/entities/ProfissionalEspecialidadeEntity.ts

import AppError from "../../application/errors/AppError";

export interface ProfissionalEspecialidadeProps {
    id?: number;
    idProfissional: number;
    idEspecialidade: number;
}

export class ProfissionalEspecialidadeEntity {
    // Usamos 'readonly' para garantir a imutabilidade do domínio
    public readonly id?: number;
    public readonly idProfissional: number;
    public readonly idEspecialidade: number;

    constructor(props: ProfissionalEspecialidadeProps) {
        // Validação básica de domínio
        this.validar(props);

        this.id = props.id;
        this.idProfissional = props.idProfissional;
        this.idEspecialidade = props.idEspecialidade;
    }

    /**
     * Valida as regras de negócio básicas da entidade.
     */
    private validar({ idProfissional, idEspecialidade }: ProfissionalEspecialidadeProps): void {
        if (!idProfissional || idProfissional <= 0) {
            throw new AppError("ID do Profissional inválido para a associação.");
        }
        if (!idEspecialidade || idEspecialidade <= 0) {
            throw new AppError("ID da Especialidade inválido para a associação.");
        }
    }

    /**
     * Método utilitário para criar a entidade a partir de dados brutos
     * Útil em Repositories e Use Cases.
     */
    static criar(props: ProfissionalEspecialidadeProps): ProfissionalEspecialidadeEntity {
        return new ProfissionalEspecialidadeEntity(props);
    }
}