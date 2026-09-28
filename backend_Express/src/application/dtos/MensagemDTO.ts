// src/application/dtos/MensagemDTO.ts

export interface EnviarMensagemDTO {
    conversaId: number;
    remetenteId: number;
    texto: string;
}

export interface ListarMensagensDTO {
    conversaId: number;
    usuarioId: number;
    cursor?: Date;
    limit?: number;
    
}

export interface MensagemReponseDTO {
    id: number;
    conversaId: number;
    remetenteId: number;
    conteudo: string;
    lida: boolean;
    dataEnvio: Date;
}


export interface EditarMensagemDTO {
    mensagemId: number;
    usuarioId: number;
    novoTexto: string;
}


export interface VisualizarMensagemDTO {
    mensagemIds: number[];
    usuarioId: number;
}

export interface DeletarMensagemDTO {
    mensagemId: number;
    usuarioId: number;
}


export interface ContarNaoLidasDTO {
    total: number;
    contagensPorConversa: { [conversaId: string]: number };
}


export interface UsuarioMensagemDTO {
    usuarioId: number;
}