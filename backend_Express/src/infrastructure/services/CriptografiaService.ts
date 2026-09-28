// src/infrastructure/services/CriptografiaService.ts

import * as bcrypt from 'bcryptjs'; // Usa import ES6
import { ICriptografiaService } from '../../domain/services/ICriptografiaService';


export class CriptografiaService implements ICriptografiaService {
    
    // Nível de dificuldade para o hash (Ex: 10 ou 12)
    private readonly saltRounds = 10; 

    /**
     * Implementação do contrato hash.
     * @param dado A senha em texto puro.
     * @returns O hash gerado.
     */
    async hash(dado: string): Promise<string> {
        // Gera o salt e o hash em uma única chamada
        return bcrypt.hash(dado, this.saltRounds);
    }

    /**
     * Implementação do contrato comparar.
     * @param dado A senha em texto puro.
     * @param hash O hash armazenado no banco de dados.
     * @returns True se as strings forem idênticas.
     */
    async comparar(dado: string, hash: string): Promise<boolean> {
        return bcrypt.compare(dado, hash);
    }
}