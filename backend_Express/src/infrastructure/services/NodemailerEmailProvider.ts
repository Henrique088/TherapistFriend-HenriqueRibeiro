// src/infrastructure/services/NodemailerEmailProvider.ts

import nodemailer from 'nodemailer';
import { IEmailProvider } from '../../domain/services/IEmailProvider';

export class NodemailerEmailProvider implements IEmailProvider {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            // host: process.env.EMAIL_HOST,
            // port: Number(process.env.EMAIL_PORT),
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendMail(to: string, subject: string, body: string): Promise<void> {
        await this.transporter.sendMail({
            from: 'TherapistFriend <no-reply@tf.com>',
            to,
            subject,
            html: body,
        });
    }
}