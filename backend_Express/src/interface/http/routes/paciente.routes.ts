// src/interface/http/routes/paciente.routes.ts

import { Router } from "express";
import auth from '../middlewares/auth';


import {makePacienteController} from '../../../main/factories/paciente.factory';

// Inicializa o Router
const pacienteRouter = Router();

const controller = makePacienteController()


// GET /paciente/usuario/:idUsuario -> Busca paciente pelo ID de usuário
pacienteRouter.get("/:idUsuario", controller.buscarPorUsuarioId);

// PUT /paciente/:id -> Atualiza um paciente existente pelo ID do paciente
pacienteRouter.put("/atualizar", auth, controller.atualizar);


export default pacienteRouter;