// src/infrastructure/container/useCaseContainer.ts

// imports gerais
import { tokenService } from "../../application/services";
import { eventDispatcher } from "./eventContainer";
import { criptografiaService, turnCredentialService } from "./serviceContainer";
import { bullMQService } from "./bullMQContainer";
import db from '../database';

// imports Repositories
import { agendamentoRepository, 
    profissionalRepository, 
    relatoRepository, 
    usuarioRepository, 
    pacienteRepository, 
    disponibilidadeRepository, 
    bloqueioRepository, 
    urgenciaRepository, 
    refreshTokenRepository, 
    likeRepository, 
    mensagemRepository, 
    moodRegistroRepository, 
    notificacaoRepository, 
    validacaoRepository } from "../../infrastructure/container/repositoryContainer";
import { sessaoRepository, sessionReportRepository, sessaoAvaliacaoRepository } from "./repositoryContainer";



// Inicio Use-Cases
import { EncerrarSessaoUseCase } from "../../application/use-cases/sessao/EncerrarSessaoUseCase";
import { ObterRelatorioSessaoUseCase } from "../../application/use-cases/sessao/ObterRelatorioSessaoUseCase";
import { GerarAcessoSessaoUseCase } from "../../application/use-cases/sessao/GerarAcessoSessaoUseCase";
import { ListarRelatoriosUseCase } from "../../application/use-cases/sessao/ListarRelatoriosUseCase";
import { ComentarRelatorioUseCase } from "../../application/use-cases/sessao/ComentarRelatorioUseCase";
import { AvaliarSessaoUseCase } from '../../application/use-cases/sessao/AvaliarSessaoUseCase';
import { sessionRuntimeService } from "../../application/services";
import { DisconnectTimeoutUseCase } from "../../application/use-cases/sessao/DisconnectTimeoutUseCase";
import { EntrarSessaoUseCase } from "../../application/use-cases/sessao/EntrarSessaoUseCase";
import { IniciarSessaoUseCase } from "../../application/use-cases/sessao/IniciarSessaoUseCase";
import { VerificarTimeoutSessaoUseCase } from "../../application/use-cases/sessao/VerificarTimeoutSessaoUseCase";
import { RegistrarPresencaSessaoUseCase } from "../../application/use-cases/sessao/RegistrarPresencaSessaoUseCase";
import { ParticipanteOfflineUseCase } from "../../application/use-cases/sessao/ParticipanteOfflineUseCase";



/**
* UseCases Sessão
* 
* Aqui são instanciados os casos de uso relacionados à sessão, utilizando os repositórios e serviços necessários.
* Cada caso de uso encapsula a lógica de negócio específica para uma operação relacionada à sessão.
*/
export const encerrarSessaoUseCase = new EncerrarSessaoUseCase(sessaoRepository, sessionRuntimeService, eventDispatcher);

export const obterRelatorioSessaoUseCase = new ObterRelatorioSessaoUseCase(sessaoRepository, sessionReportRepository);

export const gerarAcessoUseCase = new GerarAcessoSessaoUseCase(sessaoRepository, turnCredentialService, sessionRuntimeService, tokenService);

export const listarRelatoriosUseCase = new ListarRelatoriosUseCase(sessionReportRepository);

export const comentarRelatorioUseCase = new ComentarRelatorioUseCase(sessionReportRepository);

export const avaliarSessaoUseCase = new AvaliarSessaoUseCase(sessaoAvaliacaoRepository, sessionReportRepository);

export const registrarPresencaSessaoUseCase = new RegistrarPresencaSessaoUseCase(sessionRuntimeService);

export const entrarSessaoUseCase = new EntrarSessaoUseCase(sessaoRepository, sessionRuntimeService);

export const iniciarSessaoUseCase = new IniciarSessaoUseCase(sessaoRepository, sessionRuntimeService);

export const disconnectTimeoutUseCase = new DisconnectTimeoutUseCase(sessaoRepository, encerrarSessaoUseCase);

export const verificarTimeoutSessaoUseCase = new VerificarTimeoutSessaoUseCase(sessionRuntimeService, eventDispatcher);

export const participanteOfflineUseCase = new ParticipanteOfflineUseCase(sessionRuntimeService, eventDispatcher);



/**
* UseCases Administração
* 
* Aqui são instanciados os casos de uso relacionados à administração, utilizando os repositórios e serviços necessários.
* 
*/



import { ValidarProfissionalUseCase } from "../../application/use-cases/profissional/ValidarProfissionalUseCase";
import { historicoValidacaoRepository } from "../../infrastructure/container/repositoryContainer";
import { ListarProfissionalParaAdminUseCase } from "../../application/use-cases/profissional/ListarProfissionaisParaAdminUseCase";
import { GerarDashboardUseCase } from "../../application/use-cases/admin/GerarDashboardUseCase";
import { ListarUsuarioParaAdminUsecase } from "../../application/use-cases/usuario/ListarUsuarioParaAdminUsecase";
import { ListarPacienteParaAdminUseCase } from "../../application/use-cases/paciente/ListarPacienteParaAdminUseCase";
import { ListarHistoricoValidacaoUseCase } from "../../application/use-cases/profissional/ListarHistoricoValidacao";

export const validarProfissionalUseCase = new ValidarProfissionalUseCase(profissionalRepository, historicoValidacaoRepository);

export const listarProfissionalParaAdminUseCase = new ListarProfissionalParaAdminUseCase(profissionalRepository);

export const gerarDashboardUseCase = new GerarDashboardUseCase(usuarioRepository, agendamentoRepository, relatoRepository);

export const listarUsuarioParaAdminUseCase = new ListarUsuarioParaAdminUsecase(usuarioRepository);

export const listarPacienteParaAdminUseCase = new ListarPacienteParaAdminUseCase(pacienteRepository);

export const listarHistoricoValidacaoUseCase = new ListarHistoricoValidacaoUseCase(historicoValidacaoRepository);





/**
* UseCases agenda
* 
* Aqui são instanciados os casos de uso relacionados à agenda, utilizando os repositórios e serviços necessários.
* 
*/



import { SalvarGradeDisponibilidadeUseCase } from '../../application/use-cases/agenda/SalvarGradeDisponibilidadeUseCase';
import { ListarHorariosLivresUseCase } from '../../application/use-cases/agenda/ListarHorariosLivresUseCase';
import { ListarEventosCalendarioUseCase } from '../../application/use-cases/agenda/ListarEventosCalendarioUseCase';
import { AgendarConsultaUseCase } from '../../application/use-cases/agenda/AgendarConsultaUseCase';
import { ResponderAgendamentoUseCase } from '../../application/use-cases/agenda/ResponderAgendamentoUseCase';
import { CancelarAgendamentoPacienteUseCase } from '../../application/use-cases/agenda/CancelarAgendamentoPacienteUseCase';
import { ListarUrgenciasProfissionalUseCase } from '../../application/use-cases/agenda/ListarUrgenciasProfissionalUseCase';
import { AprovarUrgenciaUseCase } from '../../application/use-cases/agenda/AprovarUrgenciaUseCase';
import { GerarDashboadParaProfissionalUseCase } from '../../application/use-cases/agenda/GerarDashboadParaProfissionalUseCase';
import { SolicitarUrgenciaUseCase } from '../../application/use-cases/agenda/SolicitarUrgenciaUseCase';



export const salvarGradeUseCase = new SalvarGradeDisponibilidadeUseCase(disponibilidadeRepository);

export const listarLivresUseCase = new ListarHorariosLivresUseCase(disponibilidadeRepository, agendamentoRepository, bloqueioRepository, urgenciaRepository);

export const listarEventosUseCase = new ListarEventosCalendarioUseCase(agendamentoRepository, bloqueioRepository, disponibilidadeRepository);

export const agendarUseCase = new AgendarConsultaUseCase(agendamentoRepository, bloqueioRepository, disponibilidadeRepository, pacienteRepository, profissionalRepository, eventDispatcher);

export const responderUseCase = new ResponderAgendamentoUseCase(agendamentoRepository, pacienteRepository, profissionalRepository, eventDispatcher, bullMQService, sessaoRepository);

export const cancelarUseCase = new CancelarAgendamentoPacienteUseCase(agendamentoRepository, eventDispatcher);

export const solicitarUrgenciaUsecase = new SolicitarUrgenciaUseCase(urgenciaRepository);

export const listarUrgenciasProfissionalUseCase = new ListarUrgenciasProfissionalUseCase(urgenciaRepository);

export const aprovarUrgeciaUseCase = new AprovarUrgenciaUseCase(urgenciaRepository, pacienteRepository, profissionalRepository, eventDispatcher);

export const gerarDashboadParaProfissionalUseCase = new GerarDashboadParaProfissionalUseCase(agendamentoRepository);




/**
* UseCases auth
* 
* Aqui são instanciados os casos de uso relacionados à autenticação, utilizando os repositórios e serviços necessários.
* 
*/

import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';



export const loginUseCase = new LoginUseCase(usuarioRepository, criptografiaService, tokenService, refreshTokenRepository);

export const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository, usuarioRepository, tokenService, criptografiaService);

export const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenService);





/**
* UseCases bloqueio
* 
* Aqui são instanciados os casos de uso relacionados à bloqueio da agenda, utilizando os repositórios e serviços necessários.
* 
*/


import { CriarBloqueioUseCase } from '../../application/use-cases/agenda/CriarBloqueioUseCase';
import { AdicionarExcecaoBloqueioUseCase } from '../../application/use-cases/agenda/AdicionarExcecaoBloqueioUseCase';
import { RemoverBloqueioUseCase } from '../../application/use-cases/agenda/RemoverBloqueioUseCase';
import { RemoverExcecaoUseCase } from '../../application/use-cases/agenda/RemoverExcecaoUseCase';


export const criarBoqueioUseCase = new CriarBloqueioUseCase(bloqueioRepository);

export const adicionarExcecaoBloqueioUseCase = new AdicionarExcecaoBloqueioUseCase(bloqueioRepository);

export const removerBloqueioUseCase = new RemoverBloqueioUseCase(bloqueioRepository);

export const removerExcecaoUseCase = new RemoverExcecaoUseCase(bloqueioRepository);




/**
* UseCases conversa
* 
* Aqui são instanciados os casos de uso relacionados à conversa, utilizando os repositórios e serviços necessários.
* 
*/


import { conversaRepository } from '../../infrastructure/container/repositoryContainer';
import { ListarConversasUseCase } from '../../application/use-cases/chat/ListarConversasUseCase';


export const listarConversasUseCase = new ListarConversasUseCase(conversaRepository);




/**
* UseCases especialidades
* 
* Aqui são instanciados os casos de uso relacionados à especialidades profissionais, utilizando os repositórios e serviços necessários.
* 
*/


import { ListarEspecialidadesUseCase } from "../../application/use-cases/especialidades/ListarEspecialidadesUseCase";
import { especialiadeRepository } from "../../infrastructure/container/repositoryContainer";



export const listarEspecialidadesUseCase = new ListarEspecialidadesUseCase(especialiadeRepository);




/**
* UseCases like
* 
* Aqui são instanciados os casos de uso relacionados à likes relatos, utilizando os repositórios e serviços necessários.
* 
*/



import { AlternarLikeRelatoUseCase } from '../../application/use-cases/relato/AlternarLikeRelatoUseCase';



export const alternarLikeUseCase = new AlternarLikeRelatoUseCase(likeRepository);





/**
* UseCases mensagem
* 
* Aqui são instanciados os casos de uso relacionados à mensagens, utilizando os repositórios e serviços necessários.
* 
*/


import { EnviarMensagemUseCase } from '../../application/use-cases/chat/EnviarMensagemUseCase';
import { ListarMensagensUseCase } from '../../application/use-cases/chat/ListarMensagensUseCase';
import { EditarMensagemUseCase } from '../../application/use-cases/chat/EditarMensagemUseCase';
import { VisualizarMensagemUseCase } from '../../application/use-cases/chat/VisualizarMensagemUseCase';
import { DeletarMensagemUseCase } from '../../application/use-cases/chat/DeletarMensagemUseCase';
import { ContarMensagensNaoLidasUseCase } from '../../application/use-cases/chat/ContarMensagensNaoLidasUseCase';



export const enviarMensagemUseCase = new EnviarMensagemUseCase(mensagemRepository, conversaRepository, eventDispatcher);

export const listarMensagensUseCase = new ListarMensagensUseCase(mensagemRepository, conversaRepository);

export const editarMensagemUseCase = new EditarMensagemUseCase(mensagemRepository, eventDispatcher);

export const visualizarMensagemUseCase = new VisualizarMensagemUseCase(mensagemRepository, eventDispatcher);

export const deletarMensagemUseCase = new DeletarMensagemUseCase(mensagemRepository, conversaRepository, eventDispatcher);

export const contarMensagensNaoLidasUseCase = new ContarMensagensNaoLidasUseCase(mensagemRepository);




/**
* UseCases mood
* 
* Aqui são instanciados os casos de uso relacionados à mood, utilizando os repositórios e serviços necessários.
* 
*/



import { RegistrarMoodUseCase } from "../../application/use-cases/mood/RegistrarMoodUseCase";
import { GerarCardsPorMoodUseCase } from "../../application/use-cases/mood/GerarCardsPorMoodUseCase";




export const registrarMoodUseCase = new RegistrarMoodUseCase(moodRegistroRepository, { moodCooldownMinutes: Number(process.env.MOOD_COOLDOWN_MINUTES || 20) }, bullMQService);

export const gerarCardsPorMoodUseCase = new GerarCardsPorMoodUseCase(moodRegistroRepository, bullMQService);


/**
* UseCases notificacao
* 
* Aqui são instanciados os casos de uso relacionados à notificação, utilizando os repositórios e serviços necessários.
* 
*/



import { ListarNotificacoesUseCase } from '../../application/use-cases/notificacao/ListarNotificacoesUseCase';
import { MarcarNotificacaoComoLidaUseCase } from '../../application/use-cases/notificacao/MarcarNotificacaoComoLidaUseCase';
import { ContarNotificacoesNaoLidasUseCase } from '../../application/use-cases/notificacao/ContarNotificacoesNaoLidasUseCase';



export const listarNotificacoesUseCase = new ListarNotificacoesUseCase(notificacaoRepository);

export const marcarNotificacaoComoLidaUseCase = new MarcarNotificacaoComoLidaUseCase(notificacaoRepository);

export const contarNotificacoesNaoLidasUseCase = new ContarNotificacoesNaoLidasUseCase(notificacaoRepository);




/**
* UseCases paciente
* 
* Aqui são instanciados os casos de uso relacionados à paciente, utilizando os repositórios e serviços necessários.
* 
*/


import { CriarPacienteUseCase } from '../../application/use-cases/paciente/CriarPacienteUseCase';
import { BuscarPacientePorUsuarioUseCase } from '../../application/use-cases/paciente/BuscarPacientePorUsuarioUseCase';
import { AtualizarPacienteUseCase } from '../../application/use-cases/paciente/AtualizarPacienteUseCase';


export const criarPacienteUseCase = new CriarPacienteUseCase(pacienteRepository);

export const buscarPacientePorUsuarioIdUseCase = new BuscarPacientePorUsuarioUseCase(pacienteRepository);

export const atualizarPacienteUseCase = new AtualizarPacienteUseCase(pacienteRepository);




/**
* UseCases profissional
* 
* Aqui são instanciados os casos de uso relacionados à profissional, utilizando os repositórios e serviços necessários.
* 
*/



import { CompletarPerfilProfissionalUseCase } from '../../application/use-cases/profissional/CompletarPerfilProfissionalUseCase';
import { ListarProfissionalUseCase } from '../../application/use-cases/profissional/ListarProfissionaisUseCase';
import { PerfilPublicoProfissional } from '../../application/use-cases/profissional/PerfilPublicoProfissionalUseCase';



export const completarPerfilProfissionalUseCase = new CompletarPerfilProfissionalUseCase(profissionalRepository);

export const listarProfissionaisUseCase = new ListarProfissionalUseCase(profissionalRepository);

export const perfilPublicoProfissional = new PerfilPublicoProfissional(profissionalRepository, sessaoAvaliacaoRepository);



/**
* UseCases relato
* 
* Aqui são instanciados os casos de uso relacionados à relato, utilizando os repositórios e serviços necessários.
* 
*/



import { CriarRelatoUseCase } from '../../application/use-cases/relato/CriarRelatoUseCase';
import { AssumirRelatoUseCase } from '../../application/use-cases/relato/AssumirRelatoUseCase';
import { DecidirVinculoUseCase } from '../../application/use-cases/relato/DecidirVinculoUseCase';
import { RecusarRelatoUseCase } from '../../application/use-cases/relato/RecusarRelatoUseCase';
import { ListarRelatosDisponiveisUseCase } from '../../application/use-cases/relato/ListarRelatosDisponiveisUseCase';
import { ListarRelatosPacientesUseCase } from '../../application/use-cases/relato/ListarRelatosPacientes';
import {DeletarRelatoUseCase} from '../../application/use-cases/relato/DeletarRelatoUseCase';
import { AtualizarRelatoUseCase } from '../../application/use-cases/relato/AtualizarRelatoUseCase';


// sequelize instance
const sequelize = db.sequelize;

export const criarRelatoUseCase = new CriarRelatoUseCase(relatoRepository, bullMQService);

export const assumirRelatoUseCase = new AssumirRelatoUseCase(relatoRepository, eventDispatcher);

export const decidirVinculoUseCase = new DecidirVinculoUseCase(relatoRepository, conversaRepository, sequelize, eventDispatcher);

export const recusarRelatoUseCase = new RecusarRelatoUseCase(relatoRepository);

export const listarRelatosDisponiveisUseCase = new ListarRelatosDisponiveisUseCase(relatoRepository);

export const listarRelatosParaPacientesUseCase = new ListarRelatosPacientesUseCase(relatoRepository);

export const deletarRelatoUseCase = new DeletarRelatoUseCase(relatoRepository);

export const atualizarRelatoUseCase = new AtualizarRelatoUseCase(relatoRepository);




/**
* UseCases usuario
* 
* Aqui são instanciados os casos de uso relacionados à usuario, utilizando os repositórios e serviços necessários.
* 
*/


// Factories de Apoio
import { EntidadeRelacionadaFactory } from '../../infrastructure/factories/EntidadeRelacionadaFactory';

import { CriarUsuarioUseCase } from '../../application/use-cases/usuario/CriarUsuarioUseCase';
import { BuscarUsuarioPorEmailUseCase } from '../../application/use-cases/usuario/BuscarUsuarioPorEmailUseCase';
import { BuscarUsuarioPorIdUseCase } from '../../application/use-cases/usuario/BuscarUsuarioPorIdUseCase';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/usuario/AtualizarUsuarioUseCase';
import { DesativarUsuarioUseCase } from '../../application/use-cases/usuario/DesativarUsuarioUseCase';
import { ObterPerfilUsuarioUseCase } from '../../application/use-cases/usuario/ObterPerfilUsuarioUseCase';
import { EnviarCodigoEmailUseCase } from '../../application/use-cases/usuario/EnviarCodigoEmailUseCase';
import { EnviarCodigoSmsUseCase } from '../../application/use-cases/usuario/EnviarCodigoSmsUseCase';
import { ValidarCodigoEmailUseCase } from '../../application/use-cases/usuario/ValidarCodigoEmailUseCase';
import { ValidarCodigoSmsUseCase } from '../../application/use-cases/usuario/ValidarCodigoSmsUseCase';

// Use Case de Profissional (Sub-Use Case Orquestrado)
import { CriarProfissionalUseCase } from '../../application/use-cases/profissional/CriarProfissionalUseCase';



// Instância do sub-Use Case com a injeção do Repositório
export const criarProfissionalUseCase = new CriarProfissionalUseCase(profissionalRepository);

export const entidadeRelacionadaFactory = new EntidadeRelacionadaFactory(criarPacienteUseCase, criarProfissionalUseCase);

export const registrarUsuarioUseCase = new CriarUsuarioUseCase(
    usuarioRepository,
    entidadeRelacionadaFactory,
    criptografiaService,
    sequelize
);

export const buscarUsuarioPorEmailUseCase = new BuscarUsuarioPorEmailUseCase(
    usuarioRepository
);

export const buscarUsuarioPorIdUseCase = new BuscarUsuarioPorIdUseCase(
    usuarioRepository
);

export const atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(
    usuarioRepository
);

export const desativarUsuarioUseCase = new DesativarUsuarioUseCase(
    usuarioRepository
);

export const obterPerfilUsuarioUseCase = new ObterPerfilUsuarioUseCase(
    usuarioRepository,
    pacienteRepository,
    profissionalRepository
);

export const enviarCodigoEmailUseCase = new EnviarCodigoEmailUseCase(
    validacaoRepository,
    usuarioRepository,
    bullMQService
);

export const enviarCodigoSmsUseCase = new EnviarCodigoSmsUseCase(
    validacaoRepository,
    usuarioRepository,
    bullMQService
);

export const validarCodigoEmailUseCase = new ValidarCodigoEmailUseCase(
    validacaoRepository,
    usuarioRepository
);

export const validarCodigoSmsUseCase = new ValidarCodigoSmsUseCase(
    validacaoRepository,
    usuarioRepository
);