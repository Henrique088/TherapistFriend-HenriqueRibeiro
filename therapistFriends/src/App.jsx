
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import useNotificacoes from './hooks/useNotificacoes';
import { useUser } from './contexts/UserContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import DashboardPaciente from './pages/Dashboard/DashboardPaciente';
import DashboardProfissional from './pages/Dashboard/DashboardProfissional';
import Relato from './pages/Relato';
import Chat from './pages/Chat';
import PerfilPaciente from './pages/Perfil/PerfilPaciente';
import PerfilProfissional from './pages/Perfil/PerfilProfissional';
import Explorar from './pages/Explorar';
import Notificacoes from './pages/Notificacoes';
import Agenda from './pages/Agenda/AgendaProfissional';
import AgendaPaciente from './pages/Agenda/AgendaPaciente';
import DashboardAdmin from './pages/Admin/DashboardAdmin';
import UsuariosAdmin from './pages/Admin/UsuariosAdmin';
import ProfissionaisAdmin from './pages/Admin/ProfissionaisAdmin';
import PacientesAdmin from './pages/Admin/PacienteAdmin';
import RelatosProprios from './pages/Relato/RelatosProprios';
import {SalaEspera } from './pages/Sessao/SalaEspera';

import ModalCodinome from './Components/ModalCodinome/ModalCodinome';
import ModalCadastroProfissional from './Components/modalProfissional/ModalCadastroProfissional';
import CodigoVerificacaoModal from './Components/CodigoVerificacaoModal/ModalCodigoVerificacao'

import { NotificationProvider } from './contexts/NotificationContext';
import { ChatProvider } from './contexts/ChatContext';
import { RelatorioFinalDashboard } from './pages/Sessao/RelatorioFinalDashboard';
import { ListaRelatorios } from './pages/Sessao/ListarRelatorios';
import { ProcessandoRelatorio } from './pages/Sessao/ProcessandoRelatorio';
import { AvaliacaoPaciente } from './pages/Sessao/AvaliacaoPaciente';
import PerfilPublicoProfissional from './pages/Perfil/PerfilPublicoProfissional';


// =============================================================================
// ROTAS PROTEGIDAS
// =============================================================================

function ProtectedRoute({ children, allowedTypes }) {
  const { usuario, loadingUsuario } = useUser();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (loadingUsuario) return;

    if (!usuario) {
      toast.warning("Faça login novamente.");
      return setRedirect("/login");
    }

    if (!allowedTypes.includes(usuario.tipo_usuario)) {
      toast.error("Acesso negado.");
      return setRedirect("/login");
    }

    // Caso dados extras ainda não foram preenchidos
    if (usuario.tipo_usuario !== 'admin' && !usuario.perfil) {
      return setRedirect("/login");
    }

    setRedirect(false);
  }, [usuario, loadingUsuario]);

  if (redirect) return <Navigate to={redirect} replace />;
  if (redirect === null || loadingUsuario) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5em'
    }}>
      <div className="z z-1">Z</div>
      <div className="z z-2">Z</div>
      <div className="z z-3">Z</div>
      <div className="z z-4">Z</div>
    </div>
  );

  return children;
}

// Rotas públicas
function PublicRoute({ children }) {
  const { usuario, loadingUsuario } = useUser();
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (loadingUsuario) return;

    if (usuario) {

      if (!usuario.verificado_telefone || !usuario.verificado_email) {
        setRedirectTo(false);
        return;
      }
      setRedirectTo(
        usuario.tipo_usuario === "paciente"
          ? "/dashboard-paciente"
          : usuario.tipo_usuario === "profissional"
            ? "/dashboard-profissional"
            : "/admin/dashboard"
      );
    } else {
      setRedirectTo(false);
    }
  }, [usuario, loadingUsuario]);

  if (redirectTo) return <Navigate to={redirectTo} replace />;
  if (redirectTo === null) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5em'
    }}>
      <div className="z z-1">Z</div>
      <div className="z z-2">Z</div>
      <div className="z z-3">Z</div>
      <div className="z z-4">Z</div>
    </div>
  );

  return children;
}


// =============================================================================
// APP PRINCIPAL
// =============================================================================

export default function App() {
  const { usuario, loadingUsuario, fetchUsuario, logout } = useUser();
  const [showModal, setShowModal] = useState(null); // codinome | profissional | verificarTelefone/verificarEmail
  const [telefoneVerificacao, setTelefoneVerificacao] = useState("");
  const [emailVerificacao, setEmailVerificacao] = useState("");

  useNotificacoes();

  useEffect(() => {
    if (loadingUsuario) return;

    if (!usuario) {
      setShowModal(null);
      return;
    }


    // Email não verificado → ABRE MODAL
    if (!usuario.verificado_email) {
      setTelefoneVerificacao(usuario.email || "");
      setShowModal("verificarEmail");
      return;
    }

    // Telefone não verificado → ABRE MODAL
    if (!usuario.verificado_telefone) {
      setTelefoneVerificacao(usuario.email || "");
      setShowModal("verificarTelefone");
      return;
    }

    // Dados extras obrigatórios
    if (!usuario.perfil?.codinome && usuario.tipo_usuario == "paciente") {
          setShowModal("codinome");
          return;

    }
      if (!usuario.perfil && usuario.tipo_usuario === "profissional" || (usuario.perfil && usuario.perfil.validado === false)) {
        console.log(usuario.perfil)
        setShowModal("profissional");
        return;
      }
      
    


    // Tudo ok — fecha modais
    setShowModal(null);

  }, [usuario, loadingUsuario]);


  // ===== Tela de carregamento inicial =====
  if (loadingUsuario) {
    return (
      <>
        <ToastContainer theme="colored" />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5em'
        }}>
          <div className="z z-1">Z</div>
          <div className="z z-2">Z</div>
          <div className="z z-3">Z</div>
          <div className="z z-4">Z</div>
        </div>
      </>
    );
  }

  // ===== Renderização de modal global COM ToastContainer =====
  if (showModal === "codinome") {
    return (
      <>
        <ToastContainer theme="colored" />
        <ModalCodinome
          isOpen
          onClose={() => {
            setShowModal(null);
            fetchUsuario();
          }}
        />
      </>
    );
  }

  if (showModal === "profissional") {
    return (
      <>
        <ToastContainer theme="colored" />
        <ModalCadastroProfissional
          isOpen
          onClose={() => {
            setShowModal(null);
            fetchUsuario();
          }}
        />
      </>
    );
  }

  // Dentro do return do App()
  if (showModal === "verificarEmail" || showModal === "verificarTelefone") {
    const isEmail = showModal === "verificarEmail";

    return (
      <>
        <ToastContainer theme="colored" />
        <CodigoVerificacaoModal
          isOpen={true}
          tipo={isEmail ? 'email' : 'sms'} // Define se o back deve enviar e-mail ou SMS
          // valorDestino={isEmail ? usuario.email : usuario.telefone} 
          email={usuario.email}
          telefone={usuario.telefone.replace(/\D/g, '')}
          onClose={() => {
            // Caso o usuário clique em "Cancelar" ou feche no X
            logout();
            setShowModal(null);
          }}
          onSuccess={() => {
            // CASO DE SUCESSO: Primeiro fecha o modal, depois atualiza o usuário
            setShowModal(null);
            fetchUsuario();
            toast.success("Perfil atualizado!");
          }}
        />
      </>
    );
  }




  // =============================================================================
  // ROTAS PRINCIPAIS
  // =============================================================================

  return (
    <NotificationProvider>
      <ChatProvider>
        <ToastContainer theme="colored" />

        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />

          <Route path="/dashboard-paciente" element={<ProtectedRoute allowedTypes={['paciente']}><DashboardPaciente /></ProtectedRoute>} />
          <Route path="/dashboard-profissional" element={<ProtectedRoute allowedTypes={['profissional']}><DashboardProfissional /></ProtectedRoute>} />

          
          <Route path="/relato" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><Relato /></ProtectedRoute>} />
          <Route path="/relatos-proprios" element={<ProtectedRoute allowedTypes={['paciente']}><RelatosProprios /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><Chat /></ProtectedRoute>} />
          <Route path="/perfil-paciente" element={<ProtectedRoute allowedTypes={['paciente']}><PerfilPaciente /></ProtectedRoute>} />
          <Route path="/perfil-profissional" element={<ProtectedRoute allowedTypes={['profissional']}><PerfilProfissional /></ProtectedRoute>} />

          <Route path="/explorar" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><Explorar /></ProtectedRoute>} />
          <Route path="/notificacao" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><Notificacoes /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute allowedTypes={['profissional']}><Agenda /></ProtectedRoute>} />
          <Route path="/agenda-paciente/:profissionalId/:profissionalNome" element={<ProtectedRoute allowedTypes={['paciente']}><AgendaPaciente /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute allowedTypes={['admin']}><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedTypes={['admin']}><UsuariosAdmin /></ProtectedRoute>} />
          <Route path="/admin/profissionais" element={<ProtectedRoute allowedTypes={['admin']}><ProfissionaisAdmin /></ProtectedRoute>} />
          <Route path="/admin/pacientes" element={<ProtectedRoute allowedTypes={['admin']}><PacientesAdmin /></ProtectedRoute>} />

          <Route path="/sala/:id" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><SalaEspera /></ProtectedRoute>} />
          <Route path="/relatorio/:id" element={<ProtectedRoute allowedTypes={['profissional']}><RelatorioFinalDashboard/></ProtectedRoute>} />
          <Route path="/relatorio/" element={<ProtectedRoute allowedTypes={['profissional']}><ListaRelatorios/></ProtectedRoute>} />
          <Route path="/relatorio/processando" element={<ProtectedRoute allowedTypes={['profissional']}><ProcessandoRelatorio/></ProtectedRoute>} />
          <Route path="/sessao/avaliando/:id" element={<ProtectedRoute allowedTypes={['paciente']}><AvaliacaoPaciente/></ProtectedRoute>} />

          <Route path="/perfil-publico/:id" element={<ProtectedRoute allowedTypes={['paciente', 'profissional']}><PerfilPublicoProfissional/></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ChatProvider>
    </NotificationProvider>
  );
}