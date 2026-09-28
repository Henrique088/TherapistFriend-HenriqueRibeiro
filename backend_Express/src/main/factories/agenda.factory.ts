// src/main/factories/agenda.factory.ts

import { AgendaController } from '../../interface/controllers/AgendaController';
import { agendarUseCase, 
    aprovarUrgeciaUseCase, 
    cancelarUseCase, 
    gerarDashboadParaProfissionalUseCase, 
    listarEventosUseCase, 
    listarLivresUseCase, 
    listarUrgenciasProfissionalUseCase, 
    responderUseCase, 
    salvarGradeUseCase, 
    solicitarUrgenciaUsecase } from '../../infrastructure/container/useCaseContainer';




export const makeAgendaController = (): AgendaController =>{
    
        return new AgendaController(
            salvarGradeUseCase,
            listarLivresUseCase,
            listarEventosUseCase,
            agendarUseCase,
            responderUseCase,
            cancelarUseCase,
            solicitarUrgenciaUsecase,
            listarUrgenciasProfissionalUseCase,
            aprovarUrgeciaUseCase,
            gerarDashboadParaProfissionalUseCase
        );
};
