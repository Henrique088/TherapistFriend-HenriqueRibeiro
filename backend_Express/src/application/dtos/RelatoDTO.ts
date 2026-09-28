// src/application/dtos/RelatoDTOs.ts

export interface CriarRelatoDTO {
    paciente_id: number;
    titulo: string;
    texto: string;
    categoria: string;
    anonimo: boolean;
}

export interface DecidirVinculoDTO {
    relatoId: number;
    pacienteId: number;
    profissionalId: number;
    decisao: 'aceitar' | 'recusar';
}

export interface ListarRelatosDTO {
    page: number;
    limit: number;
    profissionalId: number;
    gravidade?: string[];
    busca?: string;
}

export interface ListarRelatosPacienteDTO {
    page: number;
    limit: number;
    pacienteId: number;
    busca?: string;
}

export interface AssumirRelatosDTO {
    profissionalId: number;
    relatoId: number;
}

export interface RecusarRelatosDTO {
    profissionalId: number;
    relatoId: number;
}


export interface ListarResponseDTO {
    id: number | undefined;
    paciente_id: number;
    titulo: string;
    texto: string;
    categoria: string;
    profissionalId: boolean,
    resultado_ia: string;
    data_envio: Date | undefined;
    quantidadeLikes: number;
    jaCurtiu: boolean | undefined,
    codinomePaciente: string;
}


export interface ListarParaPacienteResponseDTO {
    id: number | undefined;
    paciente_id: number;
    titulo: string;
    categoria: string;
    texto: string;

    data_envio: Date | undefined;
    quantidadeLikes: number;
    jaCurtiu: boolean | undefined,
    codinomePaciente: string;
}

export interface DeletarRelatoDTO {
    usuarioId: number;
    relatoId: number;
}


export interface AtualizarRelatoDTO {
    relatoId: number;
    usuarioId: number;
    novoConteudo: {
        titulo?: string;
        texto?: string;
        categoria?: string;
        anonimo?: boolean;
    };

}