// src/domain/services/ISmsProvider.ts

export interface ISmsProvider {
    
    sendSms(to: string, message: string): Promise<void>;
}