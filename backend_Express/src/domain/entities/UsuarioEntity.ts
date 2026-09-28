// src/domain/entities/UsuarioEntity.ts

import AppError from "../../application/errors/AppError";

// Tipos literais para os tipos de usuário
type TipoUsuario = 'paciente' | 'profissional' | 'admin'; 

/**
 * Interface para tipar os parâmetros do construtor, facilitando a criação.
 */
interface UsuarioConstructorParams {
    id?: number | null;
    nome: string;
    email: string;
    telefone: string;
    senha_hash?: string | null;
    tipo_usuario?: TipoUsuario;
    verificado_telefone?: boolean;
    verificado_email?: boolean;
    ativo?: boolean;
    data_cadastro?: Date | null;
}

// Interface para o objeto retornado pelo método toJSON
export interface IUsuarioData {
    id: number | null;
    nome: string;
    email: string;
    telefone: string;
    tipo_usuario: TipoUsuario;
    verificado_telefone: boolean;
    verificado_email: boolean;
    ativo: boolean;
    data_cadastro: Date | null;
}

export class UsuarioEntity {
    // Propriedades da Entidade com tipagem explícita
    public readonly id: number | null;
    public nome: string;
    public email: string;
    public telefone: string;
    public senha_hash: string | null;
    public tipo_usuario: TipoUsuario;
    public telefone_validado: boolean;
    public email_validado: boolean;
    public ativo: boolean;
    public data_cadastro: Date | null;

    constructor({ 
        id = null, 
        nome, 
        email, 
        telefone,
        senha_hash = null, 
        tipo_usuario = "paciente" as TipoUsuario,
        verificado_telefone = false, 
        verificado_email = false, 
        ativo = true, 
        data_cadastro = null 
    }: UsuarioConstructorParams) {
        
        
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.senha_hash = senha_hash;
        this.tipo_usuario = tipo_usuario;
        this.telefone_validado = verificado_telefone;
        this.email_validado = verificado_email;
        this.ativo = ativo;
        this.data_cadastro = data_cadastro;
    }

    //  Método tipado
    isPaciente(): boolean {
        return this.tipo_usuario === "paciente";
    }

    //  Método tipado
    isProfissional(): boolean {
        return this.tipo_usuario === "profissional";
    }

    isAdmin(): boolean {
        return this.tipo_usuario === "admin";
    }

    //  Método tipado
    marcarInativo(): void {
        this.ativo = false;
    }

    emailValidado(): void {
        this.email_validado = true;
    }

    telefoneValidado(): void {
        this.telefone_validado = true;
    }

    isAtivo(): void{
        if(!this.ativo){
            throw new AppError("Conta inativa. Contate o suporte.", 403); 
        }
    }

    //  Retorna o objeto DTO sem o hash
    toJSON(): IUsuarioData {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            tipo_usuario: this.tipo_usuario,
            verificado_telefone: this.telefone_validado,
            verificado_email: this.email_validado,
            ativo: this.ativo,
            data_cadastro: this.data_cadastro
        };
    }
}