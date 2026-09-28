// src/application/dtos/SessaoDTO.ts


export interface EncerrarSessaoDTO {
    sessaoId: string;
    usuarioId: number; // ID de quem está encerrando (para validação)
}


export interface SessaoAcessoOutputDTO {
    sessaoId: string;
    iceServers: {
        urls: string | string[];
        username?: string;
        credential?: string;
    }[];
    tokenSinalizacao: string;
}



export interface ListarRelatoriosInput {
    profissionalId: number;
    page?: number;
    limit?: number;
    emocao?: string;
    codinome?: string;
    ordem?: string;
}

export interface ListarRelatoriosOutput {
    relatorios: {
        id: string;
        sessaoId: string;
        paciente: {
            codinome: string;
        };
        resumo: {
            emocaoPredominante: string;
            confiancaMedia: number;
            dataRealizada: Date;
        };
        dataCriacao: Date;
    }[];
    paginacao: {
        totalItems: number;
        totalPaginas: number;
        paginaAtual: number;
        limite: number;
    };
}

export interface ComentarioDTO{
    profissionalId: number;
    sessaoId: string;
    comentario: string;
}


export interface AvaliarSessaoInput {
    sessaoId: string;
    pacienteId: number;
    nota: number;
    comentario: string | null;
}


export interface EntrarSessaoResult {

    participantesOnline : number;

}

export interface EntrarSessaoDTO {

    sessaoId: string;

    usuarioId: number;

}

export interface ParticipanteOfflineDTO {

    sessaoId: string;

    usuarioId: number;

}