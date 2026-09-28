// src/domain/repositories/IBloqueioRepository.ts

import { BloqueioEntity } from '../entities/BloqueioEntity';

export interface IBloqueioRepository {

    salvar(bloqueio: BloqueioEntity): Promise<BloqueioEntity>;
    
    // Retorna os bloqueios considerando as regras de recorrência
    buscarBloqueiosAtivos(
        profissionalId: number, 
        dataInicio: Date,
        dataFim?: Date
    ): Promise<BloqueioEntity[]>;

    // Adiciona uma data de exceção a um bloqueio recorrente
    adicionarExcecao(bloqueioId: number, data: string, motivo?: string): Promise<void>;
    
    buscarPorId(id: number): Promise<BloqueioEntity | null>;

    excluir(profissionalId: number, bloqueioId: number): Promise<void>;
    
    excluirExcecao( excecaoId: number): Promise<void>;


}