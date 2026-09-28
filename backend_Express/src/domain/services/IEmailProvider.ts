// src/domain/services/IEmailProvider.ts

export interface IEmailProvider {
    
    sendMail(to: string, subject: string, body: string): Promise<void>;
}

