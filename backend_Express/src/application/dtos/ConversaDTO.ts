// src/application/dtos/ConversaDTO.ts

import { ConversaEntity } from "../../domain/entities/ConversaEntity";

export interface ListarConversasDTO {
    usuarioId: number;
}

export interface ListarConversaResponseDTO {
    conversas: ConversaEntity[] | null;
}