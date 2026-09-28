// src/application/use-cases/agenda/AgendarConsultaUseCase.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import AppError from '../../errors/AppError';
import { AgendarConsultaDTO } from '../../dtos/AgendaDTO';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { TimeHandler } from '../../utils/TimeHandler';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { AgendamentoSolicitado } from '../../../domain/events/agenda/AgendamentoSolicitado';

export class AgendarConsultaUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository,
        private bloqueioRepository: IBloqueioRepository,
        private disponibilidadeRepository: IDisponibilidadeRepository,
        private pacienteRepository: IPacienteRepository,
        private profissionalRepository: IProfissionalRepository,
        private eventDispatcher: EventDispatcherInterface
    ) { }

    async execute(dados: AgendarConsultaDTO): Promise<AgendamentoEntity> {

        // Validação de Tempo: Data no passado
        if (dados.dataInicio < new Date()) {
        
            // throw new AppError("Não é possível agendar consultas para o passado.", 400);
        }

        // Verificação de existência dos envolvidos (Evita erro de FK)
        const [paciente, profissional] = await Promise.all([
            this.pacienteRepository.buscarPorId(dados.pacienteId),
            this.profissionalRepository.buscarPorUsuarioId(dados.profissionalId)
        ]);

        if (!paciente) throw new AppError("Paciente inexistente.", 404);
        if (!profissional) throw new AppError("Profissional inexistente.", 404);

        // Validação da Grade de Horários (Disponibilidade)
        const diaSemana = dados.dataInicio.getDay();
        const horaInicioStr = TimeHandler.dateParaString(dados.dataInicio);
        const horaFimStr = TimeHandler.dateParaString(dados.dataFim);

        const disponibilidades = await this.disponibilidadeRepository.buscarPorDiaSemana(dados.profissionalId, diaSemana);

        const dentroDaGrade = disponibilidades.some(d => {
            const inicioReserva = TimeHandler.stringParaMinutos(horaInicioStr);
            const fimReserva = TimeHandler.stringParaMinutos(horaFimStr);
            const inicioGrade = TimeHandler.stringParaMinutos(d.horaInicio);
            const fimGrade = TimeHandler.stringParaMinutos(d.horaFim);

            console.log(inicioReserva +","+ fimReserva +","+ inicioGrade  +","+ fimGrade)

            return d.ativo &&
                inicioReserva >= inicioGrade &&
                fimReserva <= fimGrade;
        });

        if (!dentroDaGrade) {
            throw new AppError(`O profissional não atende neste dia ou horário (${horaInicioStr}).`, 400);
        }

        // Busca e Validação de Bloqueios considerando EXCEÇÕES
        const bloqueios = await this.bloqueioRepository.buscarBloqueiosAtivos(
            dados.profissionalId,
            dados.dataInicio
        );

        // Extração da data da consulta no formato YYYY-MM-DD para comparar com as exceções
        const dataConsultaIso = dados.dataInicio.toISOString().split('T')[0];

        const estaBloqueado = bloqueios.some(bloqueio => {
            // Pergunta para a Entidade se ela está valendo hoje
            if (!bloqueio.estaAtivoParaData(dados.dataInicio)) return false;

            console.log("teste", new Date(bloqueio.dataInicio).toISOString());
            // Se sim, verifica colisão de horário
            return TimeHandler.verificarColisao(
                horaInicioStr,
                horaFimStr,
                TimeHandler.dateParaString(bloqueio.dataInicio),
                TimeHandler.dateParaString(bloqueio.dataFim)
            );
        });

        if (estaBloqueado) {
            throw new AppError("O profissional está indisponível neste horário (Bloqueio de Agenda).", 409);
        }

        // Verificação de Conflitos (Outras consultas já marcadas)
        const existeConflito = await this.agendamentoRepository.verificarConflito(
            dados.profissionalId,
            dados.dataInicio,
            dados.dataFim
        );

        if (existeConflito) {
            throw new AppError("Este horário já possui um agendamento confirmado ou pendente.", 409);
        }

        // Criação e Persistência
        const novoAgendamento = new AgendamentoEntity({
            pacienteId: dados.pacienteId,
            profissionalId: dados.profissionalId,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim,
            status: 'pendente',
            tipo: dados.tipo,
            observacoes: dados.observacoes,

        });

        const agendar = await this.agendamentoRepository.criar(novoAgendamento);

        if (agendar) {

            // emitir notificação via socket
            this.eventDispatcher.notify(
                new AgendamentoSolicitado({
                    profissionalId: profissional.id_usuario,
                    pacienteId: agendar.pacienteId,
                    agendamentoId: agendar.id,
                    codinome: paciente.codinome,
                    dataInicio: agendar.dataInicio
                })
            );
        }

        return agendar
    }
}