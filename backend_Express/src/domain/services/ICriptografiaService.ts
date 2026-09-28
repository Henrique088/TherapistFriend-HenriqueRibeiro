// src/domain/services/ICriptografiaService.ts

/**
 * Interface que define o contrato para serviços de criptografia e hashing.
 * Isso desacopla o Use Case da biblioteca de hashing específica (ex: bcrypt).
 */
export interface ICriptografiaService {
    /**
     * Gera um hash seguro para uma string (geralmente uma senha).
     * @param dado A string a ser hasheada.
     * @returns O hash gerado.
     */
    hash(dado: string): Promise<string>;

    /**
     * Compara uma string (senha) com um hash existente.
     * @param dado A string (senha) em texto puro.
     * @param hash O hash para comparação.
     * @returns True se o dado corresponder ao hash, False caso contrário.
     */
    comparar(dado: string, hash: string): Promise<boolean>;
}