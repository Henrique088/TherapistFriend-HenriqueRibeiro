// src/application/dtos/UsuarioDTO.ts

export type TipoUsuario = 'paciente' | 'profissional' | 'admin';

export interface UsuarioRegistroDTO {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    tipo_usuario: TipoUsuario;
    ativo: boolean;
}

export interface UsuarioRegistroBdDTO {
    nome: string;
    email: string;
    telefone: string;
    senha_hash: string;
    tipo_usuario: TipoUsuario;
    ativo: boolean;
}

export interface AtualizarUsuarioDTO {
    id: number;          
    nome?: string;      
    telefone?: string;
    ativo?: boolean;
}


export interface BuscarPorEmailUsuarioDTO {
    email: string;
}


export interface BuscarPorIdUsuarioDTO {
    id: number;

}


export interface DesativarUsuarioDTO {
    id: number;
}

export interface ValidarCodigoDTO {
    // usuarioId: number;
    email: string;
    codigo: string;
}

export interface EnviarCodigoDTO {
    // usuarioId: number;
    email: string;
}

export interface UsuarioReponseDTO {
    id: number | null;
    nome: string;
    email: string;
    telefone: string;
    tipo_usuario: string;
    ativo: boolean;
    data_cadastro: Date | null;
    entidadeRelacionada: object | null;
}

//  Interface para definir o DTO de retorno (simples, com ID e status)
export interface DesativarUsuarioRetornoDTO {
    id: number | null;
    ativo: boolean;
}
