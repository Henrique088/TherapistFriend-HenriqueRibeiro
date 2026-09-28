// src/application/use-cases/admin/GerarDashboardUseCase.ts

import { IAgendamentoRepository } from "../../../domain/repositories/IAgendamentoRepository";
import { IUsuarioRepository } from "../../../domain/repositories/IUsuarioRepository";
import { IRelatoRepository } from "../../../domain/repositories/IRelatoRepository";


export class GerarDashboardUseCase {

    constructor ( 
        private usuarioRepository: IUsuarioRepository,
        private agendamentoRepository: IAgendamentoRepository,
        private relatoRepository: IRelatoRepository
    ){}


    async execute(): Promise<any> {
            const totalUsuarios = await this.usuarioRepository.countUsuarios();
            const totalPacientes = await this.usuarioRepository.countUsuariosPorTipo('paciente');
            const totalProfissionais = await this.usuarioRepository.countUsuariosPorTipo('profissional');
            const totalAgendamentos = await this.agendamentoRepository.countAgendamentos();
            const agendamentosPorMes = await this.agendamentoRepository.countAgendamentosPorMes(6); // últimos 6 meses
            const totalRelatos = await this.relatoRepository.countRelatos();

            return {
                totalUsuarios,
                totalPacientes,
                totalProfissionais,
                totalAgendamentos,
                agendamentosPorMes,
                totalRelatos
            }


    }
}