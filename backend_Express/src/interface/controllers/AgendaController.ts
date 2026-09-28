// src/interface/controllers/AgendaController.ts

import { Request, Response, NextFunction } from 'express';
import { ListarHorariosLivresUseCase } from '../../application/use-cases/agenda/ListarHorariosLivresUseCase';
import { AgendarConsultaUseCase } from '../../application/use-cases/agenda/AgendarConsultaUseCase';
import { CancelarAgendamentoPacienteUseCase } from '../../application/use-cases/agenda/CancelarAgendamentoPacienteUseCase';
import { ListarEventosCalendarioUseCase } from '../../application/use-cases/agenda/ListarEventosCalendarioUseCase';
import { ResponderAgendamentoUseCase } from '../../application/use-cases/agenda/ResponderAgendamentoUseCase';
import { SalvarGradeDisponibilidadeUseCase } from '../../application/use-cases/agenda/SalvarGradeDisponibilidadeUseCase';
import { SolicitarUrgenciaUseCase } from '../../application/use-cases/agenda/SolicitarUrgenciaUseCase';
import { ListarUrgenciasProfissionalUseCase } from '../../application/use-cases/agenda/ListarUrgenciasProfissionalUseCase';
import { AprovarUrgenciaUseCase } from '../../application/use-cases/agenda/AprovarUrgenciaUseCase';
import { GerarDashboadParaProfissionalUseCase } from '../../application/use-cases/agenda/GerarDashboadParaProfissionalUseCase';

export class AgendaController {
    constructor(
        private salvarGradeDisponibilidadeUseCase: SalvarGradeDisponibilidadeUseCase,
        private listarHorariosLivresUseCase: ListarHorariosLivresUseCase,
        private listarEventosCalendarioUseCase: ListarEventosCalendarioUseCase,
        private agendarConsultaUseCase: AgendarConsultaUseCase,
        private responderAgendamentoUseCase: ResponderAgendamentoUseCase,
        private cancelarAgendamentoPacienteUseCase: CancelarAgendamentoPacienteUseCase,
        private solicitarUrgenciaUseCase: SolicitarUrgenciaUseCase,
        private listarUrgenciasProfissionalUseCase: ListarUrgenciasProfissionalUseCase,
        private aprovarUrgenciaUseCase: AprovarUrgenciaUseCase,
        private gerarDashboadParaProfissionalUseCase: GerarDashboadParaProfissionalUseCase
    ) { }

    /**
     * Configura a grade mestre do profissional (Disponibilidade)
     */
    async salvarGrade(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const { grades } = req.body; // Array de { diaSemana, horaInicio, horaFim }

            await this.salvarGradeDisponibilidadeUseCase.execute(Number(profissionalId), grades);

            return res.status(200).json({ message: "Grade de horários atualizada com sucesso." });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Lista slots de horários vazios (Para o Paciente agendar)
     */
    async listarDisponibilidade(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const { inicio, fim, duracao, pacienteId } = req.query;
            // const pacienteId = req.usuario?.id;

            const horarios = await this.listarHorariosLivresUseCase.execute(
                {
                    profissionalId: Number(profissionalId),
                    pacienteId: Number(pacienteId),
                    inicio: new Date(inicio as string),
                    fim: new Date(fim as string),
                    duracaoMinutos: duracao ? Number(duracao) : 60
                }
            );

            return res.status(200).json(horarios);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Lista eventos ocupados (Agendamentos e Bloqueios para o Big Calendar)
     */
    async listarEventos(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const { inicio, fim } = req.query;

            const eventos = await this.listarEventosCalendarioUseCase.execute(
                Number(profissionalId),
                new Date(inicio as string),
                new Date(fim as string)
            );

            return res.status(200).json(eventos);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Cria um novo agendamento (Status pendente por padrão)
     */
    async agendar(req: Request, res: Response, next: NextFunction) {
        try {
            const agendamento = await this.agendarConsultaUseCase.execute(req.body);
            return res.status(201).json(agendamento);
        } catch (error: any) {
            const status = error.statusCode || 400;
            next(error);
        }
    }

    /**
     * Profissional confirma ou recusa um agendamento
     */
    async responder(req: Request, res: Response, next: NextFunction) {
        try {
            const profissionalId = req?.usuario?.id
            const { id } = req.params;
            const { acao } = req.body; // 'confirmado' ou 'cancelado'

            await this.responderAgendamentoUseCase.execute({ agendamentoId: Number(id), acao, profissionalId });

            return res.status(200).json({ message: `Agendamento ${acao} com sucesso.` });
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * Paciente cancela o próprio agendamento (Regra de 24h)
     */
    async cancelar(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await this.cancelarAgendamentoPacienteUseCase.execute(Number(id));

            return res.status(200).json({ message: "Agendamento cancelado com sucesso." });
        } catch (error: any) {
            next(error);
        }
    }

    async solicitarUrgencia(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const { pacienteId, motivo, janela_de_tempo } = req.body;



            await this.solicitarUrgenciaUseCase.execute({ profissionalId: Number(profissionalId), pacienteId, motivo, janelaDeTempo: janela_de_tempo })
            return res.status(200).json({ message: "Solicitação de Urgência feita com sucesso." });

        } catch (error: any) {
            next(error);
        }
    }

    async listarUrgencias(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;

            const urgencias = await this.listarUrgenciasProfissionalUseCase.execute(Number(profissionalId));

            return res.status(200).json(urgencias);
        } catch (error: any) {
            next(error);

        }
    }

    async aprovarUrgencia(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;
            const { urgenciaId } = req.body;

            await this.aprovarUrgenciaUseCase.execute(urgenciaId, Number(profissionalId));

            return res.status(200).json("Solicitação de urgência aprovada com sucesso!");
        } catch (error: any) {
            next(error);
        }
    }

    async gerarDashboardProfissional(req: Request, res: Response, next: NextFunction) {
        try {
            const { profissionalId } = req.params;

            const dashboard = await this.gerarDashboadParaProfissionalUseCase.execute(Number(profissionalId));

            return res.status(200).json(dashboard);

        } catch (error: any) {
            next(error);
        }


    }
}