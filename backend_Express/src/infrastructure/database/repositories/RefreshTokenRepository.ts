// src/infrastructure/database/repositories/RefreshTokenRepository.ts

import { Transaction } from 'sequelize';
import { 
    IRefreshTokenRepository, 
    SalvarRefreshTokenDTO, 
} from '../../../domain/repositories/IRefreshTokenRepository'; 

import { RefreshTokenModel,RefreshTokenModelStatic, RefreshTokenAttributes } from '../models/refreshToken.model'; 



export class RefreshTokenRepository implements IRefreshTokenRepository {
    
    // Usa o Model REAL que foi tipado
    private modelRefreshToken: RefreshTokenModelStatic; 
    
    // O construtor recebe o Model tipado (agora com nome diferente)
    constructor(refreshTokenModel: RefreshTokenModelStatic) {
        this.modelRefreshToken = refreshTokenModel;
    }
    // ------------------------------------------
    // MÉTODOS CRUD
    // ------------------------------------------

    
    async salvarRefreshToken(data: SalvarRefreshTokenDTO, transaction?: Transaction): Promise<RefreshTokenModel> {
        
        // Mapeia o DTO de Domínio para os atributos do Sequelize (se necessário).
        
        const record = await this.modelRefreshToken.create(data as RefreshTokenAttributes, { transaction });
        
        return record; 
    }

    // Retorno: RefreshTokenModel ou null
    async buscarRefreshToken(jti: string): Promise<RefreshTokenModel | null> {
        console.log("Buscando refresh token no repositório com JTI:", jti);
        const tokenEncontrado = await this.modelRefreshToken.findOne({ 
            where: { jti, revoked_at: null } // Garante que o token não foi revogado
        });
        
        // O findOne já retorna o tipo Model ou null
        return tokenEncontrado; 
    }

    // Implementação de invalidarRefreshToken (Faz um soft delete definindo revoked_at)
    async invalidarRefreshToken(jti: string, transaction?: Transaction): Promise<void> {
        
        await this.modelRefreshToken.update(
            { revoked_at: new Date() },
            { where: { jti }, transaction }
        );
        
       
    }

    // ------------------------------------------
    // TRANSAÇÕES
    // ------------------------------------------

    
    async iniciarTransacao(): Promise<Transaction> {
        const sequelizeInstance = this.modelRefreshToken.sequelize;
        if (!sequelizeInstance) throw new Error("Instância Sequelize não encontrada.");
        return sequelizeInstance.transaction();
    }
    
    async commit(transaction: Transaction): Promise<void> {
        await transaction.commit();
    }
    
    async rollback(transaction: Transaction): Promise<void> {
        await transaction.rollback();
    }
}