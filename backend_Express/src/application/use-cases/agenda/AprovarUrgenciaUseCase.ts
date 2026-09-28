import { IPacienteRepository } from '../../../domain/repositories/IPacienteRepository';
import { IUrgenciaRepository } from '../../../domain/repositories/IUrgenciaRepository';
import AppError from '../../errors/AppError';
import { IProfissionalRepository } from '../../../domain/repositories/IProfissionalRepository';
import { EventDispatcherInterface } from '../../../domain/@shared/events/EventDispatcher';
import { UrgenciaConfirmada } from '../../../domain/events/agenda/UrgenciaConfirmada';

export class AprovarUrgenciaUseCase {
    constructor(
        private urgenciaRepository: IUrgenciaRepository,
        private pacienteRepository: IPacienteRepository,
        private profissionalRepository: IProfissionalRepository,
        private eventDispatcher: EventDispatcherInterface) { }

    async execute(urgenciaId: number, profissionalId: number): Promise<void> {
        // Busca a urgência
        const urgencia = await this.urgenciaRepository.buscarPorId(urgenciaId);

        if (!urgencia) {
            throw new AppError("Solicitação de urgência não encontrada.", 404);
        }

        // Segurança: Verifica se a urgência pertence ao profissional que está tentando aprovar
        if (urgencia.profissionalId !== profissionalId) {
            throw new AppError("Você não tem permissão para aprovar esta solicitação.", 403);
        }


        // Delega a lógica de transição de estado para a Entidade
        // Isso dispara o set da data 'aprovadaEm' e muda o status
        urgencia.aprovar();

        // Persiste a alteração
        await this.urgenciaRepository.atualizar(urgencia);

        console.log("id do paciente: ", urgencia.pacienteId);
        console.log("id do profissional: ", urgencia.profissionalId)

        const paciente = await this.pacienteRepository.buscarPorId(urgencia.pacienteId);

        const profissional = await this.profissionalRepository.buscarPorUsuarioId(urgencia.profissionalId);

        if (paciente) { 
            const urgenciaAprovadaEvent = new UrgenciaConfirmada({ 
                urgenciaId: urgencia.id,
                usuarioId: urgencia.pacienteId,
                profissionalNome: profissional?.nome || "Profissional",
            });

            this.eventDispatcher.notify(urgenciaAprovadaEvent);
        }
    }

}
