// src/interface/http/routes/index.ts

import { Router } from "express"; 
// Importações dos Routers Modulares
import usuarioRoutes from "./usuario.routes"; 
import authRoutes from "./auth.routes"; 
import pacienteRoutes from "./paciente.routes"; 
import profissionalRoutes from "./profissional.routes"; 
import relatoRouters from "./relato.routes";
import notificacaoRoutes from "./notificacao.routes";
import chatRoutes from "./chat.routes";
import agendaroutes from "./agenda.routes";
import especialidadeRouter from './especialidade.routes';
import bloqueioRouter from "./bloqueio.routes";
import moodRouter from "./mood.routes";
import adminRoutes from "./admin.routes";
import sessaoRoutes from "./sessao.routes";


const router = Router(); 

// --- Agregação dos Routers ---

// Rotas de Autenticação
router.use("/auth", authRoutes); // Ex: POST /auth/login

// Rotas do Módulo Usuário (Gerenciamento)
router.use("/usuarios", usuarioRoutes); // Ex: GET /usuarios/1, POST /usuarios/registrar

// Rotas do Módulo Paciente (Dados específicos de paciente)
router.use("/pacientes", pacienteRoutes); // Ex: GET /pacientes/1/prontuario

// Rotas do Módulo Profissional (Dados específicos de profissional)
router.use("/profissionais", profissionalRoutes); // Ex: GET /profissionais/5/especialidade

// Rotas do Módulo Relatos 
router.use("/relato", relatoRouters);

// Rotas do Módulo de Notificações
router.use("/notificacoes", notificacaoRoutes); 

// Rotas do Módulo Chat
router.use("/chat", chatRoutes);

// Rota do Módulo Agenda
router.use("/agenda", agendaroutes);

// Rota do Módulo de Bloqueio
router.use("/bloqueio", bloqueioRouter);

// Rota do Módulo de Especialidades
router.use("/especialidade", especialidadeRouter);

// Rota do Módulo de Mood
router.use("/mood", moodRouter);

// Rota do Módulo de Admin
router.use("/admin", adminRoutes);

// Rota do Módulo de Sessao
router.use("/sessoes", sessaoRoutes);

// Exporta o Router principal
export default router;