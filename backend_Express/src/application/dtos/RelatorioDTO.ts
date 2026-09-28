// src/application/dtos/RelatorioDTO.ts

export interface ObterRelatorioSessaoDTO {
    sessaoId: string;
    usuarioId: number;
    usuarioTipo: string;
}

export interface RelatorioSessaoOutputDTO {
    sessaoId: string;
    status: string;
    dataInicio: Date;
    dataFim: Date | null;
    pacienteCodinome?: string; 
    analise: any;
    comentarioProfissional?: string;
    geradoEm: Date | null;
}