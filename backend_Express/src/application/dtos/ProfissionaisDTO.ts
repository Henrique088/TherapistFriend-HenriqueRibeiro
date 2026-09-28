// src/application/dtos/ProfissionaisDTO.ts

import { EspecialidadeEntity } from "../../domain/entities/EspecialidadeEntity";

export interface ICompletarPerfilInput {
    id_usuario: number;     
    cpf: string;
    crp: string;
    bio: string;
    especialidades_ids: number[]; // Array de IDs: [1, 5, 10]
}

export interface ProfissionalResponseDTO{
        id?: number | null;
        id_usuario?: number;         
        cpf?: string | null;               
        crp?: string | null;                
        bio?: string | null;
        validado?: boolean;
        especialidades?: Array<number>; 
}

export interface ProfissionalCriarDTO{
    idUsuario: number;
}


export interface ListarProfissionaisDTO {
    page: number;
    limit: number;
    nome?: string;
    especialidade?: string;
}

export interface ValidarProfissionalDTO {
  profissionalId: number;
  adminId: number;
  status: 'validado' | 'revogado';
  motivo?: string;

}


export interface ProfissionalListarAdminDTO {
    page: number;
    limit : number;
    filtro? : {};
}


export interface ProfissionalListarAdminResponseDTO {
    dados: Array<{}>;
    total: number;
    pagina: number;
    totalPaginas: number;
    
}


export interface AvaliacaoComentarioDTO {
    nota: number;
    texto: string | null;
    data: Date;
    nomePaciente?: string; // Opcional, caso queira exibir "Paciente Anônimo" ou o Nome
}

export interface PerfilPublicoResponseDTO {
    id: number;
    nome: string;
    // fotoPerfil: string | null;
    crp: string;
    especialidade: EspecialidadeEntity[];
    biografia: string;
    // Dados calculados (Estatísticas)
    mediaNotas: number;
    totalAvaliacoes: number;
    // Lista de feedbacks
    comentarios: AvaliacaoComentarioDTO[];
}

export interface historicoResponseDTO {
    motivo: string | null;
    status: string;
    // data: Date;
    // profissionalId: number;

}