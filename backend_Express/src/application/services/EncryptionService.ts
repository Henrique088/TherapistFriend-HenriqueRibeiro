// src/application/services/EncryptionService.ts

import crypto from 'crypto';

export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor() {
        const secret = process.env.ENCRYPTION_KEY; // Chave de 32 bytes para AES-256
        if (!secret || secret.length !== 32) {
            throw new Error('ENCRYPTION_KEY deve ter 32 caracteres.');
        }
        this.key = Buffer.from(secret, 'utf-8');

        // this.key = crypto.scryptSync(secret, 'salt', 32); ANALISAR SE DEVE USAR ISSO OU O DE CIMA
    }

    /**
     * Criptografa a mensagem
     */
    criptografar(texto: string): { conteudo: string; iv: string } {
        const iv = crypto.randomBytes(16); // Vetor de inicialização (único por mensagem)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(texto, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            conteudo: encrypted,
            iv: iv.toString('hex')
        };
    }

    /**
     * Descriptografa a mensagem
     */
    descriptografar(conteudo: string, iv: string): string {
        const decipher = crypto.createDecipheriv(
            this.algorithm, 
            this.key, 
            Buffer.from(iv, 'hex')
        );
        
        let decrypted = decipher.update(conteudo, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}