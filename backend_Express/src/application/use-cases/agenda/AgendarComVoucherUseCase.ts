import { IAgendamentoRepository } from '../../../domain/repositories/IAgendamentoRepository';
import { IVoucherRepository } from '../../../domain/repositories/IVoucherRepository';
import { IBloqueioRepository } from '../../../domain/repositories/IBloqueioRepository';
import { AgendamentoEntity } from '../../../domain/entities/AgendamentoEntity';
import AppError from '../../errors/AppError';
import { AgendarComVoucherRequestDTO } from '../../dtos/AgendaDTO';


export class AgendarComVoucherUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository,
        private voucherRepository: IVoucherRepository,
        private bloqueioRepository: IBloqueioRepository
    ) {}

    async execute({ pacienteId, profissionalId, voucherId, dataInicio, dataFim }: AgendarComVoucherRequestDTO): Promise<AgendamentoEntity> {
        
        // Valida se o Voucher existe, pertence ao paciente e está disponível
        const voucher = await this.voucherRepository.buscarPorId(voucherId);

        if (!voucher || voucher.pacienteId !== pacienteId || !voucher.estaValido()) {
            throw new AppError("Voucher inválido, expirado ou já utilizado.", 403);
        }

        if (voucher.profissionalId !== profissionalId) {
            throw new AppError("Este voucher não é válido para este profissional.", 403);
        }

        // Verifica se o horário solicitado coincide com um Bloqueio Estratégico
        // o VIP só pode agendar em cima de bloqueios 'estrategicos')
        const bloqueios = await this.bloqueioRepository.buscarBloqueiosAtivos(profissionalId, dataInicio, dataFim);
        
        const bloqueioNoHorario = bloqueios.find(b => b.estaAtivoParaData(dataInicio));

        if (bloqueioNoHorario && bloqueioNoHorario.tipo !== 'estrategico') {
            throw new AppError("Este horário possui um bloqueio administrativo intransponível.", 400);
        }

        // Verifica se já não existe outro agendamento no local
        const existeAgendamento = await this.agendamentoRepository.verificarConflito(profissionalId, dataInicio, dataFim);
        if (existeAgendamento) {
            throw new AppError("Este horário já foi ocupado por outro paciente.", 400);
        }

        // Criar o agendamento
        const novoAgendamento = new AgendamentoEntity({
            pacienteId,
            profissionalId,
            dataInicio,
            dataFim,
            tipo: 'urgencia', 
            status: 'confirmado',
            observacoes: `Agendamento VIP realizado via Voucher #${voucher.id}`
        });

        // Persistência Atômica (Executa o agendamento e consome o voucher)
        const agendamentoSalvo = await this.agendamentoRepository.criar(novoAgendamento);
        
        voucher.marcarComoUsado();
        await this.voucherRepository.atualizar(voucher);

        return agendamentoSalvo;
    }
}