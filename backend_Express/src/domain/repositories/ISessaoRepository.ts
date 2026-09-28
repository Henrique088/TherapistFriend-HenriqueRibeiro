// src/domain/repositories/ISessaoRepository.ts

import { SessaoEntity } from '../entities/SessaoEntity';

interface RepositorioDTO {
    codinome: string;
    dataInicio: Date;
    dataFim: Date;
}

export interface ISessaoRepository {
    
    buscarPorId(id: string): Promise<SessaoEntity | null>;

    criar(dados: SessaoEntity): Promise<SessaoEntity>;
    
    /**
     * Atualiza o status da sessão (ex: de 'ativa' para 'finalizada')
     * e registra o horário de término.
     */
    encerrarSessao(dados: SessaoEntity): Promise<void>;

    // /**
    //  * Persiste os dados consolidados vindos do microserviço de IA.
    //  * O campo 'dadosAnalise' geralmente será um JSONB no banco de dados.
    //  */
    // salvarAnaliseFinal(sessaoId: string, dadosAnalise: any): Promise<void>;

    /**
     * Lista sessões de um paciente ou profissional para histórico
     */
    listarPorUsuario(usuarioId: number, tipo: 'paciente' | 'profissional'): Promise<SessaoEntity[]>;



    atualizar(dados: SessaoEntity): Promise<void>;

    buscarDadosParaNotificacaoRelatorio(sessaoId: string): Promise<RepositorioDTO | null>
}