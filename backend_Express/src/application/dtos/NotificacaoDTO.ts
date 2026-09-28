// src/application/dtos/notificacaoDTO.ts

import { NotificacaoEntity } from "../../domain/entities/NotificacaoEntity";

export interface ListarNotificacaoesDTO {
    usuarioId: number;
    page: number;
    limit: number;
    filtro?: string[];
}

export interface NotificacaoReponseDTO {
    id: number;
    titulo: string;
    mensagem: string;
    tipo: 'SOLICITACAO_VINCULO' | 'SISTEMA' | 'CHAT';
    lida: boolean;
    metadata: Record<string, any>;
    data_criacao: Date;
}

export interface MarcarLidaDTO {
    notificacaoId: number;
    usuarioId: number;
}

export interface listarResponseDTO{
    notificacoes: NotificacaoEntity[];
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
}