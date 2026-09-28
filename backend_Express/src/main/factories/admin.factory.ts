// src/main/factories/admin.factory.ts

import { gerarDashboardUseCase, listarHistoricoValidacaoUseCase, listarPacienteParaAdminUseCase, listarProfissionalParaAdminUseCase, listarUsuarioParaAdminUseCase, validarProfissionalUseCase } from "../../infrastructure/container/useCaseContainer";
import { AdminController } from "../../interface/controllers/AdminControllers";



export const MakeAdminController = (): AdminController => {
    
    return new AdminController(
        validarProfissionalUseCase, 
        listarProfissionalParaAdminUseCase, 
        gerarDashboardUseCase,
        listarUsuarioParaAdminUseCase, 
        listarPacienteParaAdminUseCase,
        listarHistoricoValidacaoUseCase );
}