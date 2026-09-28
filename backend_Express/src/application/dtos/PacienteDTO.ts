// src/application/dtos/PacienteDTO.ts


export interface PacienteAtualizacaoDTO {
    idUsuario: number;
    codinome?: string;
}

export interface PacienteBuscarUsuarioDTO {
    idUsuario: number;
}

export interface PacienteCriarDTO {
    idUsuario: number;
}


export interface PacienteResponseDTO {
    id: number | null;
    codinome: string | null;
}


export interface PacienteListarAdminDTO {
    page: number;
    limit : number;
    filtro? : {};
}

export interface PacienteListarAdminResponseDTO {
    dados: Array<{}>;
    total: number;
    pagina: number;
    totalPaginas: number;
    
}