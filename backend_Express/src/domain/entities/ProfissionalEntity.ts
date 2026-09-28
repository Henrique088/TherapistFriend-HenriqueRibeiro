// src/domain/entities/ProfissionalEntity.ts

import AppError from '../../application/errors/AppError';
import { EspecialidadeEntity } from './EspecialidadeEntity';

type TipoStatus = 'pendente' | 'validado' | 'revogado' | 'em_analise';
/**
 * Interface que representa os dados puros necessários para construir uma ProfissionalEntity.
 * 
 */
export interface ProfissionalData {
    id?: number | null;
    id_usuario: number;         // Chave estrangeira para o Usuário
    cpf: string | null;                // Cadastro de Pessoa Física
    crp: string | null;                // Registro Profissional (Ex: Conselho Regional de Psicologia)
    bio: string | null;
    validado?: boolean;
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    // Recebe as especialidades como entidades no construtor
    especialidades?: EspecialidadeEntity[];
    criado_em: Date | null;
    atualizado_em: Date | null;
    status: 'pendente' | 'validado' | 'revogado' | 'em_analise';
    admin_id?: number | null;
    data_validacao?: Date | null;
    motivo?: string | null; 
}



export interface IProfissionalData {
    id?: number | null;
    id_usuario: number;         // Chave estrangeira para o Usuário
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    cpf: string | null;                // Cadastro de Pessoa Física
    crp: string | null;                // Registro Profissional (Ex: Conselho Regional de Psicologia)
    bio: string | null;
    validado?: boolean;
    // Recebe as especialidades como entidades no construtor
    especialidades?: any[];
    status: 'pendente' | 'validado' | 'revogado' | 'em_analise';
    admin_id?: number | null;
    data_validacao?: Date | null;
    motivo?: string | null;
}

/**
 * Entidade de Domínio que representa um Profissional de Saúde.
 * Possui regras de validação e status de registro.
 */
export class ProfissionalEntity {

    public readonly id: number | null;
    public readonly id_usuario: number;
    public readonly cpf: string | null;
    public readonly crp: string | null;
    public readonly criado_em: Date | null;
    public readonly atualizado_em: Date | null;
    public readonly nome?: string | null;
    public readonly email?: string | null;
    public readonly telefone?: string | null;
    public bio: string | null;
    public validado: boolean;
    public especialidades: EspecialidadeEntity[];
    public status: TipoStatus;
    public admin_id?: number | null;
    public data_validacao?: Date | null;
    public motivo?: string | null;

    constructor({
        id = null,
        id_usuario,
        cpf,
        crp,
        bio = null,
        validado = false,
        nome,
        email,
        telefone,
        especialidades = [],
        criado_em = null,
        atualizado_em = null,
        status = 'pendente' as TipoStatus,
        admin_id,
        data_validacao,
        motivo

    }: ProfissionalData) {

        if (!id_usuario) {
            throw new AppError("ID do Usuário é obrigatório para o Profissional.");
        }

        this.id = id;
        this.id_usuario = id_usuario;
        this.cpf = cpf;
        this.crp = crp;
        this.bio = bio;
        this.validado = validado;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.especialidades = especialidades;
        this.criado_em = criado_em;
        this.atualizado_em = atualizado_em;
        this.status = status;
        this.admin_id = admin_id;
        this.data_validacao = data_validacao;
        this.status = status;
        this.motivo = motivo;

    }

    /**
     * Marca o profissional como validado (após a verificação dos documentos).
     */
    public marcarComoValidado(): void {
        this.validado = true;
    }

    /**
     * Adiciona uma nova especialidade à lista do profissional.
     */
    public adicionarEspecialidade(especialidade: EspecialidadeEntity): void {
        if (!this.especialidades.some(e => e.id === especialidade.id)) {
            this.especialidades.push(especialidade);
        }
    }

    public validar(adminId: number): void {
        if (!this.crp || !this.cpf) {
            throw new AppError("Não é possível validar um profissional sem CPF e CRP preenchidos.");
        }

        this.status = 'validado';
        this.validado = true;
        this.admin_id = adminId;
        this.data_validacao = new Date();
    }

    public revogar(adminId: number): void {
        this.status = 'revogado';
        this.validado = false;
        this.admin_id = adminId;
        this.data_validacao = new Date();
    }

    public pendenciar(): void {
        this.status = 'em_analise';
    }


    public completarDados(cpf: string, crp: string, bio: string | null): void {
        // Aqui a regra de negócio é aplicada de forma rígida
        if (!cpf || cpf.length < 11) {
            throw new AppError("Um CPF válido é obrigatório para completar o perfil.");
        }
        if (!crp) {
            throw new AppError("O registro profissional (CRP) é obrigatório.");
        }

        // Se passou pelas validações, atribuímos os valores
        (this as any).cpf = cpf; // Usando cast pois definimos como readonly no início
        (this as any).crp = crp;
        this.bio = bio;
    }

    toJSON(): IProfissionalData {
        return {
            id: this.id,
            id_usuario: this.id_usuario,
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            cpf: this.cpf,
            crp: this.crp,
            bio: this.bio,
            validado: this.validado,
            // Recebe as especialidades como entidades no construtor
            especialidades: this.especialidades.map(e => e.toJSON ? e.toJSON() : e),
            status: this.status,
            admin_id: this.admin_id,
            data_validacao: this.data_validacao,
            motivo: this.motivo
        };
    }

}