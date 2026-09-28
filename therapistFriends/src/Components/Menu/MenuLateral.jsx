// src/Components/Menu/MenuLateral.jsx

import React, { useState, useEffect, useRef } from 'react';
import lobo from '../../img/lobo.png';

import styles from './MenuLateral.module.css';

import { FaHome, FaBars, FaUserEdit } from 'react-icons/fa';

import { MdPersonSearch } from 'react-icons/md';

import { IoDocumentTextSharp, IoNotificationsCircle, IoPerson } from 'react-icons/io5';

import { RiChatSmile3Fill } from 'react-icons/ri';
import { GiExitDoor } from 'react-icons/gi';

import { AiOutlineCaretRight, AiOutlineCaretLeft, } from 'react-icons/ai';

import { ImBook } from 'react-icons/im';
import { BsPersonCheckFill } from 'react-icons/bs';
import { HiDocumentReport } from 'react-icons/hi';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Navigate, useLocation, Link } from 'react-router-dom';

import { useUser } from '../../contexts/UserContext';
import { useSocket } from '../../contexts/SocketContext';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';

import api from '../../api/apiConfig';

const MenuLateral = () => {
  const { usuario, setUsuario } = useUser();
  const { unreadCount, hasNewNotification } = useNotifications();
  const { unreadChatCount } = useChat();

  const [redirect, setRedirect] = useState(null);
  const [loading, setLoading] = useState(false);

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [submenuPerfilOpen, setSubmenuPerfilOpen] = useState(false);

  const location = useLocation();
  const socket = useSocket();

  const submenuRef = useRef(null);

  const isChatPage = location.pathname === '/chat';
  const isAgendaPage = location.pathname === '/agenda';

  const tipo =
    usuario?.tipo_usuario === 'paciente' ? 'Paciente' : 'Profissional';

  const dashboardPath = `/dashboard-${tipo}`;

  const isActive = (path) => location.pathname === path;

  /*
   * Responsividade
   */
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth <= 1024;

      setIsMobile(mobile);

      if (mobile) {
        if (isAgendaPage) {
          setMenuCollapsed(false);
        }
      } else {
        if (isChatPage || isAgendaPage) {
          setMenuCollapsed(true);
        }
      }
    };

    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [isAgendaPage]);

  /*
   * Fecha menu mobile ao mudar de página
   */
  useEffect(() => {
    setMenuOpenMobile(false);
  }, [location.pathname]);

  /*
   * Fecha submenu ao alterar estado do menu
   */
  useEffect(() => {
    setSubmenuPerfilOpen(false);
  }, [menuCollapsed, menuOpenMobile]);

  /*
   * Fecha submenu ao clicar fora
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ( submenuRef.current && !submenuRef.current.contains(event.target) ) {
        setSubmenuPerfilOpen(false);
      }
    };

    if (submenuPerfilOpen) {
      document.addEventListener( 'mousedown', handleClickOutside );
    }

    return () => {
      document.removeEventListener( 'mousedown', handleClickOutside );
    };
  }, [submenuPerfilOpen]);

  /*
   * Fecha menu mobile com ESC
   */
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && menuOpenMobile) {
        setMenuOpenMobile(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener( 'keydown', handleEscKey );
    };
  }, [menuOpenMobile]);

  const toggleMenu = () => {
    setMenuCollapsed((prev) => !prev);
  };

  const toggleMenuMobile = () => {
    setMenuOpenMobile((prev) => !prev);
  };

  async function logout(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await api.post( '/auth/logout', {}, { withCredentials: true } );

      toast.success('Volte sempre! Saindo...', { autoClose: 2000 });

      socket.disconnect();

      setTimeout(() => {
        setRedirect(true);
      }, 2000);

    } catch (error) {
      console.error( 'Erro no logout:', error.response?.data || error.message );

      setRedirect(true);
    } finally {
      setLoading(false);
    }
  }

  if (redirect) {
    setUsuario(null);

    return ( <Navigate to="/login" replace/> );
  }

  const closeMobileMenu = () => {
    if (isMobile) {
      setMenuOpenMobile(false);
    }
  };

  return (
    <div
      className={`
      ${styles.container}
      ${menuCollapsed ? styles.containerCollapsed : ''}
      ${(isAgendaPage) && !isMobile
          ? styles.containerHiddenDesktop
          : ''
        }
    `}
    >

      {/* Botão mobile */}
      <button
        className={`${styles.hamburgerButton} ${menuOpenMobile ? styles.active : '' }`}
        onClick={toggleMenuMobile}
        title="Abrir menu"
        aria-label="Abrir menu"
        aria-expanded={menuOpenMobile}
      >
        <FaBars />
      </button>

      {/* Overlay mobile */}
      {menuOpenMobile && (
        <div
          className={styles.mobileOverlay}
          onClick={toggleMenuMobile}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${styles.sidebar}
          ${menuCollapsed ? styles.collapsed : ''}
          ${menuOpenMobile ? styles.openMobile : ''}
          ${(isAgendaPage) &&
            !isMobile
            ? styles.hiddenDesktop
            : ''
          }
        `}
      >

        {/* =========================
            HEADER
        ========================== */}

        <div className={styles.sidebarHeader}>

          <Link
            to={dashboardPath}
            className={styles.logo}
            onClick={closeMobileMenu}
          >
            <div className={styles.logoImage}>
              <img
                src={lobo}
                alt="TherapistFriend"
              />
            </div>

            {!menuCollapsed && (
              <div className={styles.logoText}>
                <strong>Therapist</strong>
                <span>Friend</span>
              </div>
            )}
          </Link>

        </div>

        {/* =========================
            MENU
        ========================== */}

        <nav className={styles.sidebarMenu}>

          <div>

            <span className={styles.sectionLabel}>
              {!menuCollapsed && 'NAVEGAÇÃO'}
            </span>

            <ul>

              {/* Início */}
              <li>
                <Link
                  to={dashboardPath}
                  title="Início"
                  onClick={closeMobileMenu}
                  className={
                    isActive(dashboardPath)
                      ? styles.active
                      : ''
                  }
                >
                  <FaHome />

                  {!menuCollapsed && (
                    <span>Início</span>
                  )}
                </Link>
              </li>

              {/* Explorar */}
              {tipo === 'Paciente' && (
                <li>
                  <Link
                    to="/explorar"
                    title="Explorar"
                    onClick={closeMobileMenu}
                    className={
                      isActive('/explorar')
                        ? styles.active
                        : ''
                    }
                  >
                    <MdPersonSearch />

                    {!menuCollapsed && (
                      <span>Explorar</span>
                    )}
                  </Link>
                </li>
              )}

              {/* Relatos */}
              <li>
                <Link
                  to="/relato"
                  title="Relatos"
                  onClick={closeMobileMenu}
                  className={
                    isActive('/relato')
                      ? styles.active
                      : ''
                  }
                >
                  <IoDocumentTextSharp />

                  {!menuCollapsed && (
                    <span>Relatos</span>
                  )}
                </Link>
              </li>

              {/* Meus Relatos */}
              {tipo === 'Paciente' && (
                <li>
                  <Link
                    to="/relatos-proprios"
                    title="Meus Relatos"
                    onClick={closeMobileMenu}
                    className={
                      isActive('/relatos-proprios')
                        ? styles.active
                        : ''
                    }
                  >
                    <IoDocumentTextSharp />

                    {!menuCollapsed && (
                      <span>Meus Relatos</span>
                    )}
                  </Link>
                </li>
              )}

              {/* Chat */}
              <li>
                <Link
                  to="/chat"
                  title="Chats"
                  onClick={closeMobileMenu}
                  className={
                    isActive('/chat')
                      ? styles.active
                      : ''
                  }
                >
                  <RiChatSmile3Fill />

                  {!menuCollapsed && (
                    <span>Chats</span>
                  )}

                  {unreadChatCount > 0 && (
                    <span className={styles.badge}>
                      {unreadChatCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* Notificações */}
              <li>
                <Link
                  to="/notificacao"
                  title="Notificações"
                  onClick={closeMobileMenu}
                  className={
                    isActive('/notificacao')
                      ? styles.active
                      : ''
                  }
                >
                  <IoNotificationsCircle />

                  {!menuCollapsed && (
                    <span>Notificações</span>
                  )}

                  {hasNewNotification && (
                    <span
                      className={`
                        ${styles.badge}
                        ${styles.badgePulse}
                      `}
                    >
                      {unreadCount === 0
                        ? '!'
                        : unreadCount}
                    </span>
                  )}
                </Link>
              </li>

            </ul>

            {/* =========================
                PROFISSIONAL
            ========================== */}

            {tipo === 'Profissional' && (
              <>
                <span className={styles.sectionLabel}>
                  {!menuCollapsed && 'PROFISSIONAL'}
                </span>

                <ul>

                  {/* Agenda */}
                  <li>
                    <Link
                      to="/agenda"
                      title="Agenda"
                      onClick={closeMobileMenu}
                      className={
                        isActive('/agenda')
                          ? styles.active
                          : ''
                      }
                    >
                      <ImBook />

                      {!menuCollapsed && (
                        <span>Agenda</span>
                      )}
                    </Link>
                  </li>

                  {/* Relatórios */}
                  <li>
                    <Link
                      to="/relatorio"
                      title="Relatórios"
                      onClick={closeMobileMenu}
                      className={
                        isActive('/relatorio')
                          ? styles.active
                          : ''
                      }
                    >
                      <HiDocumentReport />

                      {!menuCollapsed && (
                        <span>Relatórios</span>
                      )}
                    </Link>
                  </li>

                  {/* Perfil */}
                  <li
                    className={styles.hasSubmenu}
                    ref={submenuRef}
                  >
                    <button
                      className={styles.submenuToggle}
                      onClick={() =>
                        setSubmenuPerfilOpen(
                          (prev) => !prev
                        )
                      }
                      title="Perfil"
                      aria-expanded={submenuPerfilOpen}
                    >
                      <IoPerson />

                      {!menuCollapsed && (
                        <>
                          <span>Perfil</span>

                          <span
                            className={`
                              ${styles.caret}
                              ${submenuPerfilOpen
                                ? styles.open
                                : ''
                              }
                            `}
                          >
                            ▾
                          </span>
                        </>
                      )}
                    </button>

                    {submenuPerfilOpen && (
                      <ul
                        className={`
                          ${styles.submenuList}
                          ${menuCollapsed
                            ? styles.collapsedSubmenu
                            : ''
                          }
                        `}
                      >
                        <li>
                          <Link
                            to="/perfil-profissional"
                            onClick={() => {
                              closeMobileMenu();
                              setSubmenuPerfilOpen(false);
                            }}
                            className={styles.submenuItem}
                          >
                            <FaUserEdit />

                            <span>
                              {menuCollapsed
                                ? 'Editar'
                                : 'Editar perfil'}
                            </span>
                          </Link>
                        </li>

                        <li>
                          <Link
                            to={`/perfil-publico/${usuario?.perfil?.id}`}
                            onClick={() => {
                              closeMobileMenu();
                              setSubmenuPerfilOpen(false);
                            }}
                            className={styles.submenuItem}
                          >
                            <BsPersonCheckFill />

                            <span>
                              {menuCollapsed
                                ? 'Público'
                                : 'Ver perfil público'}
                            </span>
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                </ul>
              </>
            )}

            {/* =========================
                PACIENTE
            ========================== */}

            {tipo === 'Paciente' && (
              <>
                <span className={styles.sectionLabel}>
                  {!menuCollapsed && 'CONTA'}
                </span>

                <ul>
                  <li>
                    <Link
                      to="/perfil-paciente"
                      title="Perfil"
                      onClick={closeMobileMenu}
                      className={
                        isActive('/perfil-paciente')
                          ? styles.active
                          : ''
                      }
                    >
                      <IoPerson />

                      {!menuCollapsed && (
                        <span>Perfil</span>
                      )}
                    </Link>
                  </li>
                </ul>
              </>
            )}

          </div>

          {/* =========================
              SAIR
          ========================== */}

          <div className={styles.menuBottom}>
            <button
              className={styles.logoutButton}
              onClick={logout}
              title="Sair"
              disabled={loading}
            >
              <GiExitDoor />

              {!menuCollapsed && (
                <span>
                  {loading
                    ? 'Saindo...'
                    : 'Sair'}
                </span>
              )}
            </button>
          </div>

        </nav>

        {/* =========================
            USUÁRIO + TOGGLE
        ========================== */}

        <div className={styles.sidebarFooter}>

          {!menuCollapsed && (
            <div className={styles.userInfo}>

              <div className={styles.avatar}>
                {usuario?.perfil?.codinome
                  ?.substring(0, 2)
                  .toUpperCase() ||
                  usuario?.nome
                    ?.substring(0, 2)
                    .toUpperCase() ||
                  'US'}
              </div>

              <div className={styles.userDetails}>
                <strong>
                  {usuario?.perfil?.codinome ||
                    usuario?.nome}
                </strong>

                <span>
                  {usuario?.email}
                </span>
              </div>

            </div>
          )}

          {!isAgendaPage &&
            !isMobile && (
              <button
                className={styles.toggleButton}
                onClick={toggleMenu}
                title={
                  menuCollapsed
                    ? 'Expandir menu'
                    : 'Recolher menu'
                }
                aria-label={
                  menuCollapsed
                    ? 'Expandir menu'
                    : 'Recolher menu'
                }
              >
                {menuCollapsed ? (
                  <AiOutlineCaretRight />
                ) : (
                  <AiOutlineCaretLeft />
                )}
              </button>
            )}

        </div>

      </aside>
    </div>
  );
};

export default MenuLateral;