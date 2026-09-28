// src/application/use-cases/ListarHorariosLivresUseCase.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { IDisponibilidadeRepository } from '../../../domain/repositories/IDisponibilidadeRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { ListarHorariosLivresDTO, EventoCalendarioPacienteDTO } from '../../dtos/AgendaDTO';
import { TimeHandler } from '../../utils/TimeHandler';
import { DataHandler } from '../../utils/DataHandler';
import AppError from '../../errors/AppError';

export class ListarHorariosLivresUseCase {
    constructor(
        private disponibilidadeRepository: IDisponibilidadeRepository,
        private agendamentoRepository: IAgendamentoRepository,
        private bloqueioRepository: IBloqueioRepository,
        private urgenciaRepository: IUrgenciaRepository
    ) { }

    async execute({ profissionalId, pacienteId, inicio, fim, duracaoMinutos }: ListarHorariosLivresDTO): Promise<EventoCalendarioPacienteDTO[]> {

        if (fim.getTime() < inicio.getTime()) {
            throw new AppError("A data de término não pode ser anterior ao início.", 400);
        }

        // 1. Normaliza datas para busca (Instantes reais no tempo)
        const inicioBusca = DataHandler.parseToUTC(inicio);
        const fimBusca = DataHandler.parseToUTC(fim);

        const [bloqueios, agendamentos] = await Promise.all([
            this.bloqueioRepository.buscarBloqueiosAtivos(profissionalId, inicioBusca, fimBusca),
            this.agendamentoRepository.buscarPorPeriodo(profissionalId, inicioBusca, fimBusca)
        ]);

        const voucher = pacienteId
            ? await this.urgenciaRepository.buscarAtivaPorPaciente(pacienteId, profissionalId)
            : null;

        const isPacienteVip = !!(voucher && voucher.status === 'aprovada_aguardando_vaga');
        const eventos: EventoCalendarioPacienteDTO[] = [];

        let dataAtual = new Date(inicioBusca.getTime());
        while (dataAtual <= fimBusca) {

            const diaSemana = dataAtual.getUTCDay();
            const grades = await this.disponibilidadeRepository.buscarPorDiaSemana(profissionalId, diaSemana);

            for (const faixa of grades) {
                if (!faixa.ativo) continue;

                const slotsCandidatos = TimeHandler.gerarJanelas(
                    faixa.horaInicio,
                    faixa.horaFim,
                    duracaoMinutos
                );

                for (const inicioSlotStr of slotsCandidatos) {
                    const inicioMinutos = TimeHandler.stringParaMinutos(inicioSlotStr);
                    const fimSlotStr = TimeHandler.minutosParaString(inicioMinutos + duracaoMinutos);

                    // Cria os instantes reais para o DTO (serão enviados como ISO para o Front)
                    const start = this.combinarDataEHora(dataAtual, inicioSlotStr);
                    const end = this.combinarDataEHora(dataAtual, fimSlotStr);

            
                    // --- VALIDAÇÃO DE BLOQUEIOS ---
                    let tipoBloqueioEncontrado: string | null = null;
                    const temBloqueioImpedindo = bloqueios.some(b => {
                        // Verificação de Vigência/Recorrência
                        if (b.recorrente) {
                            if (!b.estaAtivoParaData(dataAtual)) return false;
                        } else {
                            // Para bloqueios pontuais, verificamos se é o mesmo dia (UTC)
                            if (!DataHandler.isSameDayUTC(b.dataInicio, dataAtual)) return false;
                            if (!b.ativo) return false; // Bloqueio pontual desativado
                        }

                        // Verificação de Colisão de Horário
                        const inicioBloqueioLiteral = this.extrairHoraNominal(b.dataInicio);
                        const fimBloqueioLiteral = this.extrairHoraNominal(b.dataFim);

                        const colide = TimeHandler.verificarColisao(
                            inicioSlotStr,
                            fimSlotStr,
                            inicioBloqueioLiteral,
                            fimBloqueioLiteral
                        );

                        if (colide) {
                            // Se for paciente VIP e o bloqueio for estratégico, permite (não impede)
                            if (isPacienteVip && b.tipo === 'estrategico') {
                                tipoBloqueioEncontrado = 'vaga_vip';
                                return false;
                            }
                            return true; // Impede o slot
                        }
                        return false;
                    });

                    // --- VALIDAÇÃO DE AGENDAMENTOS ---
                    const agendamentoExistente = agendamentos.find(a =>
                        DataHandler.isSameDayUTC(a.dataInicio, dataAtual) &&
                        TimeHandler.verificarColisao(
                            inicioSlotStr,
                            fimSlotStr,
                            this.extrairHoraNominal(a.dataInicio),
                            this.extrairHoraNominal(a.dataFim)
                        )
                    );

                    // --- CONSTRUÇÃO DO EVENTO ---
                    if (agendamentoExistente) {
                        const ehMeu = agendamentoExistente.pacienteId === pacienteId;
                        eventos.push({
                            id: `${agendamentoExistente.id}`,
                            title: ehMeu ? 'Minha Consulta' : 'Ocupado',
                            start,
                            end,
                            tipo: 'agendamento',
                            status: agendamentoExistente.status,
                            classificacao: ehMeu ? 'meu_agendamento' : 'ocupado',
                            color: ehMeu ? '#3b82f6' : '#d1d5db'
                        });
                    } else if (temBloqueioImpedindo) {
                        
                        eventos.push({
                            id: null,
                            title: 'Indisponível',
                            start,
                            end,
                            tipo: 'bloqueio',
                            classificacao: 'bloqueio_comum',
                            color: '#f3f4f6'
                        });
                    } else {
                        const ehVip = tipoBloqueioEncontrado === 'vaga_vip';
                        eventos.push({
                            id: ehVip ? `vip-${voucher?.id}` : `livre-${start.toISOString()}`,
                            title: ehVip ? 'Vaga Prioritária' : 'Disponível',
                            start,
                            end,
                            tipo: 'agendamento',
                            classificacao: ehVip ? 'vaga_vip' : 'disponivel',
                            color: ehVip ? '#10b981' : '#e2e8f0',
                            resource: {
                                urgenciaId: ehVip ? voucher?.id : null
                            }
                        });
                    }
                }
            }
            dataAtual.setUTCDate(dataAtual.getUTCDate() + 1);
        }

        return eventos;
    }

    /**
     * Helper para converter o UTC do banco na hora que o médico/paciente enxergam em SP.
     * Isso garante que 15:00 UTC (no banco) seja comparado como 12:00 (na grade).
     */
    private extrairHoraNominal(data: Date): string {

        return data.toISOString().split('T')[1].substring(0, 5);
    }

    private combinarDataEHora(dataBase: Date, horaStr: string): Date {
        const [horas, minutos] = horaStr.split(':').map(Number);

        // Cria o objeto Date que o Front vai receber.
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