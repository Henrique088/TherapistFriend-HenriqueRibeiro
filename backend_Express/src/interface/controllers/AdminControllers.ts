// src/interface/controllers/AdminControllers.ts

import { Request, Response, NextFunction } from 'express';
import { ValidarProfissionalUseCase } from "../../application/use-cases/profissional/ValidarProfissionalUseCase";
import { ListarProfissionalParaAdminUseCase } from '../../application/use-cases/profissional/ListarProfissionaisParaAdminUseCase';
import { GerarDashboardUseCase } from '../../application/use-cases/admin/GerarDashboardUseCase';
import { ListarUsuarioParaAdminUsecase } from '../../application/use-cases/usuario/ListarUsuarioParaAdminUsecase';
import { ListarPacienteParaAdminUseCase } from '../../application/use-cases/paciente/ListarPacienteParaAdminUseCase';
import { ListarHistoricoValidacaoUseCase } from '../../application/use-cases/profissional/ListarHistoricoValidacao';


export class AdminController {
    constructor(
        private validarProfissionalUseCase: ValidarProfissionalUseCase,
        private listarProfissionalParaAdminUseCase: ListarProfissionalParaAdminUseCase,
        private gerarDashboardUseCase: GerarDashboardUseCase,
        private listarUsuarioParaAdminUseCase: ListarUsuarioParaAdminUsecase,
        private listarPacienteParaAdminUseCase: ListarPacienteParaAdminUseCase,
        private listarHistoricoValidacaoUseCase: ListarHistoricoValidacaoUseCase
    ) { }


    async validar(req: Request, res: Response, next: NextFunction) {

        try {
            const adminId = req.usuario?.id;
            const { profissionalId, status, motivo } = req.body;

            await this.validarProfissionalUseCase.execute({ adminId, profissionalId, status, motivo });

            return res.status(200).json('Profissional validado com sucesso');

        } catch (error: any) {
            next(error);
        }
    }

    async listarProfissionaisParaAdmin(req: Request, res: Response, next: NextFunction) {

        try {

            const { page , limit ,  busca, status } = req.query;
            const filtro: any = {};
           
            if (busca) filtro.busca = String(busca);
            if (status) filtro.status = String(status);

            const resultado = await this.listarProfissionalParaAdminUseCase.execute({
                page: Number(page),
                limit: Number(limit),
                filtro
            });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        };


    }

    async gerarDashboard(req: Request, res: Response, next: NextFunction) {

        try {

            const resultado = await this.gerarDashboardUseCase.execute();

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }
    }

    async listarUsuariosParaAdmin(req: Request, res: Response, next: NextFunction) {

        try {

            const { page = 1, limit = 10, busca } = req.query;
            const filtro: any = {};


            if (busca) filtro.busca = String(busca);

            const resultado = await this.listarUsuarioParaAdminUseCase.execute(Number(page), Number(limit), filtro);

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }

    }


    async listarPacientesParaAdmin(req: Request, res: Response, next: NextFunction) {
        try {

            const { page = 1, limit = 10, busca, status } = req.query;
            const filtro: any = {};

            if (busca) filtro.busca = String(busca);
            if (status) filtro.status = String(status);

            const resultado = await this.listarPacienteParaAdminUseCase.execute({
                page: Number(page),
                limit: Number(limit),
                filtro
            });

            return res.status(200).json(resultado);
        } catch (error: any) {
            next(error);
        }

    }

    async listarHistorico(req: Request, res: Response, next: NextFunction){
        try{
            const profissionalId = req.params.profissionalId as unknown as number;

            const resultado = await this.listarHistoricoValidacaoUseCase.execute( profissionalId );

            return res.status(200).json(resultado);

        }
        catch(error: any){
            next(error);
        }

        
    } 
}