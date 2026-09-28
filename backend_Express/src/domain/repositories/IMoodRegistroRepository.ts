// src/domain/repositories/IMoodRegistro.ts

import { MoodRegistroEntity } from "../entities/MoodRegistroEntity"

export interface IMoodRegistroRepository {
    
    buscarDoPeriodo(usuarioId: number, data: Date, periodo: string ): Promise<MoodRegistroEntity | null>;

    criar(registro: MoodRegistroEntity): Promise<void>;

    atualizar(registro: MoodRegistroEntity): Promise<void>;

    buscarUltimoDoDia(usuarioId: number): Promise<MoodRegistroEntity | null>;
}
