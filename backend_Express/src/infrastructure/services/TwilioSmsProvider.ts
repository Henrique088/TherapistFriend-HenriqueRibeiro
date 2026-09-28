// src/infrastructure/services/TwilioSmsProvider.ts

import AppError from '../../application/errors/AppError';
import { ISmsProvider } from '../../domain/services/ISmsProvider';
import { Twilio } from 'twilio';

export class TwilioSmsProvider implements ISmsProvider {
    private client: Twilio;

    constructor() {
        
        this.client = new Twilio(

            process.env.TWILIO_ACCOUNT_SID!,

            process.env.TWILIO_AUTH_TOKEN!
        );
    }

    async sendSms(to: string, message: string): Promise<void> {
        
        try {
            await this.client.messages.create({

                body: message,

                from: process.env.TWILIO_SMS_NUMBER, // Número gerado no Twilio

                to: to

            });

        } catch (error) {
            
            console.error('Erro ao enviar SMS via Twilio:', error);
            
            throw new AppError('Falha no envio do SMS de validação.');
        }
    }
}