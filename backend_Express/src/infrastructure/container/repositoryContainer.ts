// src/infrastructure/container/repositoryContainer.ts

// Repositorios e Model de auth
import { RefreshTokenModel, RefreshTokenModelStatic } from '../database/models/refreshToken.model';
import { RefreshTokenRepository } from '../database/repositories/RefreshTokenRepository';

const refreshTokenModel: RefreshTokenModelStatic = RefreshTokenModel;

export const refreshTokenRepository = new RefreshTokenRepository(refreshTokenModel);


// Repositorios e Model de Usuario
import { UsuarioModel, UsuarioModelStatic } from '../database/models/usuario.model';
import { UsuarioRepository } from '../database/repositories/UsuarioRepository';

const usuarioModel: UsuarioModelStatic = UsuarioModel;

export const usuarioRepository = new UsuarioRepository(usuarioModel);

// Repositorios e Model de Historico Validação
import { HistoricoValidacaoModel } from '../database/models/historico_validacao_profissional.model';
import { HistoricoValidacaoRepository } from '../database/repositories/HistoricoValidacaoRepository';
import { HistoricoValidacaoModelStatic } from '../database/models/historico_validacao_profissional.model';

const historicoValidacaoModel : HistoricoValidacaoModelStatic  = HistoricoValidacaoModel;

export const historicoValidacaoRepository = new HistoricoValidacaoRepository(historicoValidacaoModel);


// Repositorios e models de Profissional

import { ProfissionalRepository } from '../database/repositories/ProfissionalRepository';
import { EspecialidadeModel } from '../database/models/especialidade.model';
import { ProfissionalEspecialidadeModel } from '../database/models/profissional_especialidade.model';


import { ProfissionalModel, ProfissionalModelStatic } from '../database/models/profissional.model';
import { EspecialidadeModelStatic } from '../database/models/especialidade.model';
import { ProfissionalEspecialidadeModelStatic } from '../database/models/profissional_especialidade.model';


const profissionalModel: ProfissionalModelStatic = ProfissionalModel;

const especialidadeModel: EspecialidadeModelStatic = EspecialidadeModel;
const pivoModel: ProfissionalEspecialidadeModelStatic = ProfissionalEspecialidadeModel;




export const profissionalRepository = new ProfissionalRepository(
    profissionalModel, 
    usuarioModel, 
    pivoModel,
    especialidadeModel,
    historicoValidacaoModel
);


// Repositórios e Models de Paciente
import { PacienteModel, PacienteModelStatic } from '../database/models/paciente.model';
import { PacienteRepository } from '../database/repositories/PacienteRepository';


const pacienteModel: PacienteModelStatic = PacienteModel;

export const pacienteRepository = new PacienteRepository(pacienteModel, usuarioModel);


// Repositórios e Models de Agenda/Bloqueios/Urgencia 
import { BloqueioModel, BloqueioModelStatic } from '../database/models/bloqueio-agenda.model';
import { BloqueioExcecaoModel, BloqueioExcecaoModelStatic } from '../database/models/bloqueio-excecao.model';
import { AgendamentoModel, AgendamentoModelStatic } from '../database/models/agendamento.model';
import { DisponibilidadeModel, DisponibilidadeModelStatic } from '../database/models/disponibilidade-profissional.model';
import { UrgenciaModel, UrgenciaModelStatic } from '../database/models/urgencia.model';


import { BloqueioRepository } from '../database/repositories/BloqueioRepository';
import { AgendamentoRepository } from '../database/repositories/AgendamentoRepository';
import { DisponibilidadeRepository } from '../database/repositories/DisponibilidadeRepository';
import { UrgenciaRepository} from '../database/repositories/UrgenciaRepository';

const bloqueioModel: BloqueioModelStatic = BloqueioModel;
const bloqueioExcecaoModel: BloqueioExcecaoModelStatic = BloqueioExcecaoModel;
const agendamentoModel: AgendamentoModelStatic = AgendamentoModel;
const disponibilidadeModel: DisponibilidadeModelStatic = DisponibilidadeModel;
const urgenciaModel: UrgenciaModelStatic = UrgenciaModel;


// Exportação das instâncias (Singletons)
export const bloqueioRepository = new BloqueioRepository(bloqueioModel, bloqueioExcecaoModel);
export const agendamentoRepository = new AgendamentoRepository(agendamentoModel);
export const disponibilidadeRepository = new DisponibilidadeRepository(disponibilidadeModel);
export const urgenciaRepository = new UrgenciaRepository(urgenciaModel, pacienteModel);



// Repositórios e Models de especialidade
import { EspecialidadeRepository } from '../database/repositories/EspecialidadeRepository';

export const especialiadeRepository = new EspecialidadeRepository(especialidadeModel);


// Repositórios e models de  Conversa e Mensagem
import { ConversaModel } from '../database/models/conversa.model';
import { MensagemModel } from '../database/models/mensagem.model';
import { ConversaRepository } from '../database/repositories/ConversaRepository';
import { MensagemRepository } from '../database/repositories/MensagemRepository';
import { ConversaModelStatic } from '../database/models/conversa.model';
import { MensagemModelStatic } from '../database/models/mensagem.model';

// Aplicando a tipagem forte aos Models
const conversaModel: ConversaModelStatic = ConversaModel;
const mensagemModel: MensagemModelStatic = MensagemModel;

// Instâncias únicas (Singletons) para toda a aplicação
export const conversaRepository = new ConversaRepository(conversaModel, usuarioModel, pacienteModel, profissionalModel);
export const mensagemRepository = new MensagemRepository(mensagemModel, conversaModel);



// Repositorios e Model de MoodRegistro
import { MoodRegistroModel } from '../database/models/mood_registro.model';
import { MoodRegistroRepository } from '../database/repositories/MoodRegistroRepository';
import { MoodRegistroModelStatic } from '../database/models/mood_registro.model';

const moodRegistroModel: MoodRegistroModelStatic = MoodRegistroModel;

export const moodRegistroRepository = new MoodRegistroRepository(moodRegistroModel);



import { RelatoModel } from '../database/models/relato.model';
import { RelatoRepository } from '../database/repositories/RelatoRepository';
import { RelatoModelStatic } from '../database/models/relato.model';

const relatoModel : RelatoModelStatic = RelatoModel;

export const relatoRepository = new RelatoRepository(relatoModel);



// Repositórios e Models de Notificação
import { NotificacaoModel } from '../database/models/notificacao.model';
import { NotificacaoRepository } from '../database/repositories/NotificacaoRepository';
import { NotificacaoModelStatic } from '../database/models/notificacao.model';

const notificacaoModel: NotificacaoModelStatic = NotificacaoModel;

export const notificacaoRepository = new NotificacaoRepository(notificacaoModel);


// Repositorios e Models de sessão

import { SessaoModel } from '../database/models/sessao.model';
import { SessaoRepository } from '../database/repositories/SessaoRepository';
import { SessaoModelStatic } from '../database/models/sessao.model';

const sessaoModel: SessaoModelStatic = SessaoModel;

export const sessaoRepository = new SessaoRepository(sessaoModel);


// Repositorios e Models de Relatórios

import { SessionReportModel } from '../database/models/sessao_report.model';
import { SessionReportRepository } from '../database/repositories/SessionReportRepository';
import { SessionReportModelStatic } from '../database/models/sessao_report.model';

const sessaoReportModel : SessionReportModelStatic = SessionReportModel;

export const sessionReportRepository = new SessionReportRepository(sessaoReportModel);


// Repositorios de acesso ao redis 

import { RedisAnalysisRepository } from '../database/repositories/RedisAnalysisRepository';

export const redisAnalysisRepository =  new RedisAnalysisRepository();



import { SessaoAvaliacaoRepository } from '../database/repositories/SessaoAvaliacaoRepository';
import {SessaoAvaliacaoModel, SessaoAvaliacaoModelStatic} from '../database/models/sessao_avaliacao.model';

const sessaoAvaliacaoModel : SessaoAvaliacaoModelStatic = SessaoAvaliacaoModel;
export const sessaoAvaliacaoRepository = new SessaoAvaliacaoRepository(sessaoAvaliacaoModel);



// Repositorio Like

import { LikeModel, LikeModelStatic } from '../database/models/like.model';
import { LikeRepository } from '../database/repositories/LikeRepository';

const likeModel: LikeModelStatic = LikeModel;

export const likeRepository = new LikeRepository(likeModel);



// Repositorio Validação

import { ValidacaoRepository } from '../database/repositories/ValidacaoRepository';


export const validacaoRepository = new ValidacaoRepository();