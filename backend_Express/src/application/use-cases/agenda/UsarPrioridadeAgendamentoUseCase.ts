// src/application/use-cases/agenda/UsarPrioridadeAgendamentoUseCase.ts

import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import AppError from '../../errors/AppError';

export class UsarPrioridadeAgendamentoUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository,
        private urgenciaRepository: IUrgenciaRepository
    ) {}

    async execute(pacienteId: number, dataInicio: Date, dataFim: Date, urgenciaId: number): Promise<void> {
        // Busca o "Voucher" (o registro de prioridade/urgência)
        const prioridade = await this.urgenciaRepository.buscarPorId(urgenciaId);

        // 2. Validações de Segurança
        if (!prioridade) {
            throw new AppError("Prioridade não encontrada.", 404);
        }
        if (prioridade.pacienteId !== pacienteId) {
            throw new AppError("Este voucher de prioridade não pertence a você.", 403);
        }
        if (prioridade.status !== 'aprovada_aguardando_vaga') {
            throw new AppError("Esta prioridade já foi utilizada ou expirou.", 400);
        }

        // Verifica se o horário está livre (com a regra especial de VIP)
        const conflito = await this.agendamentoRepository.verificarConflito(prioridade.profissionalId, dataInicio, dataFim);
        if (conflito) { 
             throw new AppError("Horário indisponível.", 409);
        }

        // Cria o Agendamento
        const novoAgendamento = new AgendamentoEntity({
            pacienteId: pacienteId,
            profissionalId: prioridade.profissionalId,
            dataInicio: dataInicio,
            dataFim: dataFim,
            status: 'confirmado', // VIPs entram confirmados
            tipo: 'regular', // Volta a ser um atendimento normal
            observacoes: 'Reagendamento prioritário (Paciente cedeu horário anterior)'
        });

        await this.agendamentoRepository.criar(novoAgendamento);

        // "Queima" o Voucher VIP
        // Ao mudar o status para concluída, o paciente não consegue usar esse ID de novo.
        // E como o ListarHorariosLivresUseCase verifica urgências "ativas", 
        // na próxima vez ele não verá mais os bloqueios especiais.
        prioridade.concluir(); 
        await this.urgenciaRepository.atualizar(prioridade);
    }
}