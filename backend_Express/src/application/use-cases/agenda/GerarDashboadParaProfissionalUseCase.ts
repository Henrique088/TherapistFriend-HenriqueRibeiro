// src/application/use-cases/GerarDashboadParaProfissionalUseCase.ts

import { IAgendamentoRepository } from "../../../domain/repositories/IAgendamentoRepository";
import { DashboardProfissionalResponseDTO } from "../../dtos/AgendaDTO";
import { DataHandler } from "../../utils/DataHandler";


export class GerarDashboadParaProfissionalUseCase {
    constructor(
        private agendamentoRepository: IAgendamentoRepository
    ) { }

    async execute(profissionalId: number): Promise<DashboardProfissionalResponseDTO> {
        const agora = new Date();

        const hojeInicio = DataHandler.parseToUTC(agora);
        const hojeFim = new Date(hojeInicio);
        hojeFim.setUTCHours(23, 59, 59, 999);

        const semanaInicio = DataHandler.getInicioDaSemanaUTC(agora);
        const semanaFim = DataHandler.getFimDaSemanaUTC(agora);

        const mesInicio = DataHandler.getInicioDoMesUTC(agora);
        const mesFim = DataHandler.getFimDoMesUTC(agora);

        const [totalHoje, totalSemana, totalMes, grafico] = await Promise.all([
            this.agendamentoRepository.countPorPeriodo(profissionalId, hojeInicio, hojeFim),
            this.agendamentoRepository.countPorPeriodo(profissionalId, semanaInicio, semanaFim),
            this.agendamentoRepository.countPorPeriodo(profissionalId, mesInicio, mesFim),
            this.agendamentoRepository.distribuicaoMensalProfissional(profissionalId, 6)
        ]);

        return {
            resumo: {
                hoje: totalHoje,
                semana: totalSemana,
                mes: totalMes
            },
            grafico
        };
    }
}