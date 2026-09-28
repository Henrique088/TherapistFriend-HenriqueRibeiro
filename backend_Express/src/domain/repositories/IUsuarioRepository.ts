// src/domain/repositories/IUsuarioRepository.ts

import { UsuarioEntity } from '../entities/UsuarioEntity';
import { Transaction } from 'sequelize';

export interface IUsuarioRepository {
    // Busca e retorna a entidade Usuario
    buscarPorEmail(email: string): Promise<UsuarioEntity | null>;

    // Cria e retorna a entidade Usuario
    criar(dados: any, transaction?: Transaction): Promise<UsuarioEntity>;

    // Deleta um usuário
    deletar(id: number, transaction?: Transaction): Promise<void>;

    // Outros métodos necessários
    buscarPorId(id: number): Promise<UsuarioEntity | null>;

    // Salva (atualiza) um usuário
    salvar(usuario: UsuarioEntity, transaction?: Transaction): Promise<UsuarioEntity>;

    buscarPorTelefone(telefone: string): Promise<UsuarioEntity | null>;

    // Método para contar o número total de usuários
    countUsuarios(): Promise<number>;

    // Método para contar o número total de usuários por tipo (paciente, profissional)
    countUsuariosPorTipo(tipo: 'paciente' | 'profissional'): Promise<number>;

    // Método para listar usuários 
    listar(page: number, limit: number, filtros: { busca?: string }): Promise<{
        data: UsuarioEntity[];
        total: number;
        pagina: number;
        totalPaginas: number;
    }>;

    // Métodos para controle de transação no nível do repositório (opcional, mas recomendado)
    iniciarTransacao(): Promise<any>;
    
    commit(transaction: Transaction): Promise<void>;

    rollback(transaction: Transaction): Promise<void>;
}