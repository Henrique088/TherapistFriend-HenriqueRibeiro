// src/application/use-cases/agenda/ListarEventosCalendarioUseCase.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { EventoCalendarioDTO } from '../../dtos/AgendaDTO';
import { BloqueioEntity } from '../../../domain/entities/BloqueioEntity';
import { DisponibilidadeEntity } from '../../../domain/entities/DisponibilidadeEntity'; 
import { DataHandler } from '../../utils/DataHandler';
import { TimeHandler } from '../../utils/TimeHandler';
import AppError from '../../errors/AppError';

export class ListarEventosCalendarioUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository,
        private bloqueioRepository: IBloqueioRepository,
        private disponibilidadeRepository: IDisponibilidadeRepository
    ) { }

    async execute(profissionalId: number, dataInicioRaw: Date, dataFimRaw: Date): Promise<EventoCalendarioDTO[]> {
        if (dataFimRaw.getTime() < dataInicioRaw.getTime()) {
            throw new AppError("A data de término não pode ser anterior ao início.", 400);
        }

        // Normalização Nominal (Garante que a busca cubra o dia inteiro em UTC)
        const inicioBusca = DataHandler.parseToUTC(dataInicioRaw);
        const fimBusca = DataHandler.parseToUTC(dataFimRaw);

        // Busca Completa no Banco
        const [agendamentos, bloqueios, grades] = await Promise.all([
            this.agendamentoRepository.buscarPorPeriodo(profissionalId, inicioBusca, fimBusca),
            this.bloqueioRepository.buscarBloqueiosAtivos(profissionalId, inicioBusca, fimBusca),
            this.disponibilidadeRepository.listarGradeCompleta(profissionalId)
        ]);

        const eventos: EventoCalendarioDTO[] = [];

        // Mapear Agendamentos (O 'Z' no banco garante o horário nominal)
        agendamentos.forEach(ag => {
            eventos.push({
                id: `${ag.id}`,
                title: ag.tipo === 'urgencia' ? `Urgência` : `Consulta`,
                start: ag.dataInicio, 
                end: ag.dataFim,
                tipo: 'agendamento',
                status: ag.status,
                color: '#3b82f6',
                resource: {
                    pacienteId: ag.pacienteId,
                    observacoes: ag.observacoes,
                    codinome: ag.codinome,
                }
            });
        });

        // Mapear Bloqueios
        bloqueios.forEach(bl => {
            if (bl.recorrente) {
                eventos.push(...this.projetarBloqueio(bl, inicioBusca, fimBusca));
            } else {
                const ativo = bl.estaAtivoParaData(bl.dataInicio);
                eventos.push(this.criarEventoBloqueio(bl, bl.dataInicio, bl.dataFim, false, ativo));
            }
        });

        // Projetar Disponibilidade (Grade de fundo)
        if (grades && grades.length > 0) {
            eventos.push(...this.projetarDisponibilidade(grades, inicioBusca, fimBusca));
        }

        return eventos;
    }

    private projetarDisponibilidade(grades: DisponibilidadeEntity[], inicio: Date, fim: Date): EventoCalendarioDTO[] {
        const eventosGrade: EventoCalendarioDTO[] = [];
        let dataAtual = new Date(inicio.getTime());
        const dataLimite = new Date(fim.getTime());

        while (dataAtual <= dataLimite) {
            const diaSemanaAtualUTC = dataAtual.getUTCDay(); 
            const regrasDoDia = grades.filter(g => g.diaSemana === diaSemanaAtualUTC && g.ativo);

            for (const regra of regrasDoDia) {
                const start = this.combinarDataEHora(dataAtual, regra.horaInicio);
                const end = this.combinarDataEHora(dataAtual, regra.horaFim);

                eventosGrade.push({
                    id: `disp-${regra.id}-${dataAtual.getTime()}`,
                    title: "Expediente",
                    start,
                    end,
                    tipo: 'background', 
                    color: '#ecfdf5', 
                    resource: { disponibilidadeId: regra.id }
                });
            }
            dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
        }
        return eventosGrade;
    }

    private projetarBloqueio(bloqueio: BloqueioEntity, inicio: Date, fim: Date): EventoCalendarioDTO[] {
    const projecoes: EventoCalendarioDTO[] = [];
    
    // Normaliza a data de início do bloqueio para o início do dia (00:00 UTC)
    const dataCriacaoBloqueio = new Date(Date.UTC(
        bloqueio.dataInicio.getUTCFullYear(),
        bloqueio.dataInicio.getUTCMonth(),
        bloqueio.dataInicio.getUTCDate()
    ));

    let dataAtual = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate()));
    const dataLimite = new Date(fim.getTime());

    while (dataAtual <= dataLimite) {
        
        if (dataAtual >= dataCriacaoBloqueio && bloqueio.diasSemana?.includes(dataAtual.getUTCDay())) {
            const ativo = bloqueio.estaAtivoParaData(dataAtual);

            const horaInicioStr = TimeHandler.dateParaString(bloqueio.dataInicio); 
            const horaFimStr = TimeHandler.dateParaString(bloqueio.dataFim);

            const start = this.combinarDataEHora(dataAtual, horaInicioStr);
            const end = this.combinarDataEHora(dataAtual, horaFimStr);

            projecoes.push(this.criarEventoBloqueio(bloqueio, start, end, true, ativo));
        }
        dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
    }
    return projecoes;
}
    private criarEventoBloqueio(bl: BloqueioEntity, start: Date, end: Date, isRecorrente: boolean, ativo: boolean): EventoCalendarioDTO {
        const dataRef = start.toISOString().split('T')[0];
        const idUnico = isRecorrente ? `${bl.id}-${dataRef}` : `${bl.id}`;

        return {
            id: idUnico,
            title: ativo ? bl.titulo : `(Cancelado) ${bl.titulo}`,
            start,
            end,
            tipo: ativo ? 'bloqueio' : 'excecao',
            color: ativo ? '#6B7280' : '#E5E7EB', 
            resource: {
                bloqueioId: bl.id,
                excecaoId: bl.excecoes?.find(e => 
                    new Date(e.dataExcecao).toISOString().split('T')[0] === dataRef
                )?.id || null,
                isRecorrente,
                dataReferencia: dataRef
            }
        };
    }

    private combinarDataEHora(dataBase: Date, horaStr: string): Date {
        const [horas, minutos] = horaStr.split(':').map(Number);
        // Cria o Date com UTC forçado para que o horário visual seja preservado
        return new Date(Date.UTC(
            dataBase.getUTCFullYear(), 
            dataBase.getUTCMonth(), 
            dataBase.getUTCDate(), 
            horas, 
            minutos, 
            0
        ));
    }
}