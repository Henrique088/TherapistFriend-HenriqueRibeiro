// src/interface/controllers/UsuarioController.ts

import { Request, Response, NextFunction } from 'express';
import { CriarUsuarioUseCase } from '../../application/use-cases/usuario/CriarUsuarioUseCase';
import { BuscarUsuarioPorEmailUseCase } from '../../application/use-cases/usuario/BuscarUsuarioPorEmailUseCase';
import { BuscarUsuarioPorIdUseCase } from '../../application/use-cases/usuario/BuscarUsuarioPorIdUseCase';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/usuario/AtualizarUsuarioUseCase';
import { DesativarUsuarioUseCase } from '../../application/use-cases/usuario/DesativarUsuarioUseCase';
import { ObterPerfilUsuarioUseCase } from '../../application/use-cases/usuario/ObterPerfilUsuarioUseCase';
import { EnviarCodigoEmailUseCase } from '../../application/use-cases/usuario/EnviarCodigoEmailUseCase';
import { EnviarCodigoSmsUseCase } from '../../application/use-cases/usuario/EnviarCodigoSmsUseCase';
import { ValidarCodigoEmailUseCase } from '../../application/use-cases/usuario/ValidarCodigoEmailUseCase';
import { ValidarCodigoSmsUseCase } from '../../application/use-cases/usuario/ValidarCodigoSmsUseCase';


export class UsuarioController {

    constructor(
        private registrarUsuarioUseCase: CriarUsuarioUseCase,
        private buscarUsuarioPorEmailUseCase: BuscarUsuarioPorEmailUseCase,
        private buscarUsuarioPorIdUseCase: BuscarUsuarioPorIdUseCase,
        private atualizarUsuarioUseCase: AtualizarUsuarioUseCase,
        private desativarUsuarioUseCase: DesativarUsuarioUseCase,
        private obterPerfilUsuarioUseCase: ObterPerfilUsuarioUseCase,
        private enviarCodigoEmailUseCase: EnviarCodigoEmailUseCase,
        private enviarCodigoSmsUseCase: EnviarCodigoSmsUseCase,
        private validarCodigoEmailUseCase: ValidarCodigoEmailUseCase,
        private validarCodigoSmsUseCase: ValidarCodigoSmsUseCase
    ) { }

    // --- MÉTODOS DE ROTA ---

    registrar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            
            const usuario = await this.registrarUsuarioUseCase.execute(req.body);
            return res.status(201).json(usuario);
        } catch (err) {
            next(err);
        }
    }

    atualizar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {

            const usuarioAtualizado = await this.atualizarUsuarioUseCase.execute({
                id: req.params.id as unknown as number,
                ...req.body
            });

            return res.json(usuarioAtualizado);
        } catch (err) {
            next(err);
        }
    }

    desativar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {

            const resultadoDesativacao = await this.desativarUsuarioUseCase.execute({ id: req.params.id as unknown as number });
            return res.json(resultadoDesativacao);
        } catch (err) {
            return next(err);
        }
    }

    buscarPorId = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {

            const usuario = await this.buscarUsuarioPorIdUseCase.execute({ id: req.params.id as unknown as number });
            return res.json(usuario);
        } catch (error: any) {
            return next(error);
        }
    }

    buscarPorEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const email = req.params.email;
            const usuario = await this.buscarUsuarioPorEmailUseCase.execute({ email });
            return res.json(usuario);
        } catch (error: any) {
            next(error);
        }
    }

    async me(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const usuarioId = req.usuario?.id; 
        
        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        try {
            const perfilCompleto = await this.obterPerfilUsuarioUseCase.execute({ id: usuarioId });
            return res.json(perfilCompleto);
        } catch (error: any) {
            next(error);
        }
    }

    async enviarCodigoEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const email = req.params.email
       
        try {
            await this.enviarCodigoEmailUseCase.execute({email});
            return res.json({ message: 'Código de verificação enviado por email.' });
        } catch (error: any) {
            next(error);
        }
    }

    async enviarCodigoSms(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const email = req.params.email

        try {
            await this.enviarCodigoSmsUseCase.execute({email});
            return res.json({ message: 'Código de verificação enviado por SMS.' });
        } catch (error: any) {
            next(error);
        }
    }

    async validarCodigoEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const email = req.params.email;
        const { codigo } = req.body;

        try {
            await this.validarCodigoEmailUseCase.execute({email, codigo});
            return res.json({ message: 'Código de verificação de email validado com sucesso.' });
        } catch (error: any) {
            next(error);
        }
    }

    async validarCodigoSms(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const email = req.params.email;
        const { codigo } = req.body;

        try {
            await this.validarCodigoSmsUseCase.execute({email, codigo});
            return res.json({ message: 'Código de verificação de SMS validado com sucesso.' });
        } catch (error: any) {
            next(error);
        }
    }

    
}