// src/application/use-cases/usuario/EnviarCodigoEmailUseCase.ts

import { IValidacaoRepository } from '../../../domain/repositories/IValidacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IQueueService } from '../../services/IQueueService';
import AppError from '../../errors/AppError';
import { EnviarCodigoDTO } from '../../dtos/UsuarioDTO';

export class EnviarCodigoEmailUseCase {
    constructor(
        private validacaoRepository: IValidacaoRepository,
        private usuarioRepository: IUsuarioRepository,
        private queueService: IQueueService
    ) { }

    async execute({ email }: EnviarCodigoDTO): Promise<void> {
        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        if (usuario.email_validado) {
            throw new AppError('Email já verificado.', 400);
        }

        const codigo = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        if (!usuario.id) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        await this.validacaoRepository.salvarCodigo(
            usuario.id,
            codigo,
            'EMAIL',
            30
        );

        const body = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Verificação de Email - TherapistFriend</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #faf9f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #243331;
    "
>
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background-color: #faf9f5;
            padding: 40px 16px;
        "
    >
        <tr>
            <td align="center">

                <!-- CONTAINER -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 18px;
                        overflow: hidden;
                        border: 1px solid #e1e8e5;
                    "
                >

                    <!-- CABEÇALHO -->
                    <tr>
                        <td
                            style="
                                padding: 30px 32px;
                                text-align: center;
                                background: linear-gradient(
                                    135deg,
                                    #4f7f78,
                                    #315d57
                                );
                            "
                        >
                            <div
                                style="
                                    color: #ffffff;
                                    font-size: 25px;
                                    font-weight: bold;
                                    letter-spacing: 0.3px;
                                "
                            >
                                TherapistFriend
                            </div>

                            <div
                                style="
                                    margin-top: 8px;
                                    color: #e8f3ef;
                                    font-size: 14px;
                                "
                            >
                                Conexões que acolhem
                            </div>
                        </td>
                    </tr>

                    <!-- CONTEÚDO -->
                    <tr>
                        <td
                            style="
                                padding: 36px 34px;
                            "
                        >

                            <div
                                style="
                                    color: #4f7f78;
                                    font-size: 13px;
                                    font-weight: bold;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    margin-bottom: 10px;
                                "
                            >
                                Verificação de email
                            </div>

                            <h1
                                style="
                                    margin: 0 0 16px;
                                    color: #243331;
                                    font-size: 25px;
                                    line-height: 1.3;
                                "
                            >
                                Olá, ${usuario.nome}!
                            </h1>

                            <p
                                style="
                                    margin: 0 0 24px;
                                    color: #6c7b78;
                                    font-size: 15px;
                                    line-height: 1.7;
                                "
                            >
                                Para continuar o seu cadastro no
                                <strong style="color: #315d57;">
                                    TherapistFriend
                                </strong>,
                                utilize o código abaixo para confirmar
                                seu endereço de email.
                            </p>

                            <!-- CÓDIGO -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            padding: 24px 15px;
                                            background-color: #e8f3ef;
                                            border: 1px solid #c9dfd9;
                                            border-radius: 14px;
                                        "
                                    >
                                        <div
                                            style="
                                                color: #6c7b78;
                                                font-size: 12px;
                                                margin-bottom: 9px;
                                                text-transform: uppercase;
                                                letter-spacing: 1px;
                                            "
                                        >
                                            Seu código
                                        </div>

                                        <div
                                            style="
                                                color: #315d57;
                                                font-size: 34px;
                                                font-weight: bold;
                                                letter-spacing: 8px;
                                                line-height: 1;
                                            "
                                        >
                                            ${codigo}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- AVISO -->
                            <p
                                style="
                                    margin: 24px 0 0;
                                    padding: 14px 16px;
                                    background-color: #faf9f5;
                                    border-left: 3px solid #e39a3b;
                                    color: #6c7b78;
                                    font-size: 13px;
                                    line-height: 1.6;
                                "
                            >
                                Este código é válido por
                                <strong style="color: #243331;">
                                    30 minutos
                                </strong>.
                                Por segurança, não compartilhe este código
                                com outras pessoas.
                            </p>

                        </td>
                    </tr>

                    <!-- RODAPÉ -->
                    <tr>
                        <td
                            style="
                                padding: 22px 30px;
                                background-color: #f5f7f6;
                                border-top: 1px solid #e1e8e5;
                                text-align: center;
                            "
                        >
                            <p
                                style="
                                    margin: 0;
                                    color: #6c7b78;
                                    font-size: 12px;
                                    line-height: 1.6;
                                "
                            >
                                Se você não solicitou este código,
                                pode ignorar este email.
                            </p>

                            <p
                                style="
                                    margin: 8px 0 0;
                                    color: #9aa7a4;
                                    font-size: 11px;
                                "
                            >
                                © TherapistFriend
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
        `;

        try {
            await this.queueService.addJob(
                'email-queue',
                'enviar_email_verificacao',
                {
                    to: usuario.email,
                    subject: 'Seu Código de Verificação - TherapistFriend',
                    body
                }
            );
        } catch (error) {
            console.error('Erro ao enfileirar Email:', error);
        }
    }
}