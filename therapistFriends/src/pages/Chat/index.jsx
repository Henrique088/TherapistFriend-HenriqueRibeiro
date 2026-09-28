// src/pages/Chat/index.js

import React, { useEffect, useState, useRef, useCallback } from 'react';
import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './Chat.module.css';
import { useSocket } from './../../contexts/SocketContext';
import { useUser } from '../../contexts/UserContext';
import { useChat } from '../../contexts/ChatContext';
import EmojiPicker from '../../Utils/emojiPicker';
import { FaCheckDouble } from "react-icons/fa6";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaRegComment } from "react-icons/fa";
import api from '../../api/apiConfig';

export default function Chats() {
  const [conversas, setConversas] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para edição inline
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  const ultimaMensagemRef = useRef(null);
  const mensagemRefs = useRef(new Map());
  const chatAreaRef = useRef(null);
  const inputEdicaoRef = useRef(null);
  const inputMensagemRef = useRef(null);

  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);
  const socket = useSocket();
  const { usuario } = useUser();
  const { conversationUnreadCounts, clearUnreadCountForConversation, setActiveConversationId } = useChat();
  const tipo = usuario?.tipo_usuario === 'paciente' ? 'paciente' : 'profissional';

  //para paginação

  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const carregandoMaisRef = useRef(false);
  const deveFazerScrollRef = useRef(true);

  const rolarParaUltimaMensagem = useCallback(() => {
    ultimaMensagemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  const rolarParaPrimeiraNaoLida = useCallback(() => {
    const primeiraNaoLida = mensagens.find(msg => !msg.lida && msg.remetente_id !== usuario.id);
    let elementoParaRolar = null;

    if (primeiraNaoLida) {
      elementoParaRolar = mensagemRefs.current.get(primeiraNaoLida.id);
    } else {
      elementoParaRolar = ultimaMensagemRef.current;
    }

    if (elementoParaRolar) {
      elementoParaRolar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [mensagens, usuario.id]);

  useEffect(() => {
    const fetchConversas = async () => {
      try {
        const response = await api.get('/chat/conversas');
        setConversas(response.data);
      } catch (error) {

      }
    };

    fetchConversas();
  }, []);

  useEffect(() => {
    if (conversaSelecionada && inputMensagemRef.current) {
      // Pequeno timeout para garantir que a transição do DOM terminou
      const timer = setTimeout(() => {
        inputMensagemRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [conversaSelecionada]);

  useEffect(() => {
    const ajustarTeclado = () => {
      const formEnvioEl = document.getElementsByClassName(styles.formEnvio)[0];
      const chatHeaderEl = document.getElementsByClassName(styles.chatHeader)[0];
      const chatArea = chatAreaRef.current;

      if (!formEnvioEl || !window.visualViewport || !chatArea || !chatHeaderEl || !conversaSelecionada) {
        resetAltura();
        return;
      }

      const alturaTeclado = window.innerHeight - window.visualViewport.height;
      const alturaForm = formEnvioEl.offsetHeight;
      const alturaHeader = chatHeaderEl.offsetHeight;
      const alturaVisivel = window.visualViewport.height;

      formEnvioEl.style.bottom = `${alturaTeclado}px`;
      chatArea.style.height = `${alturaVisivel - alturaHeader - alturaForm}px`;

      const rolarAoFim = () => { chatArea.scrollTop = chatArea.scrollHeight };

      requestAnimationFrame(rolarAoFim);
      setTimeout(rolarAoFim, 50);
    };

    const resetAltura = () => {
      const chatArea = chatAreaRef.current;
      const formEnvioEl = document.getElementsByClassName(styles.formEnvio)[0];

      if (chatArea) {
        chatArea.style.height = 'auto';
        chatArea.style.flex = '1';
      }
      if (formEnvioEl) {
        formEnvioEl.style.bottom = '0';
      }
    };

    window.visualViewport?.addEventListener('resize', ajustarTeclado);
    window.addEventListener('focusin', ajustarTeclado);
    window.addEventListener('focusout', resetAltura);

    return () => {
      window.visualViewport?.removeEventListener('resize', ajustarTeclado);
      window.removeEventListener('focusin', ajustarTeclado);
      window.removeEventListener('focusout', resetAltura);
    };
  }, [styles, conversaSelecionada]);

  useEffect(() => {
    if (
      mensagens.length > 0 &&
      !carregandoMaisRef.current &&
      deveFazerScrollRef.current
    ) {
      rolarParaPrimeiraNaoLida();
    }
  }, [mensagens, usuario.id, rolarParaPrimeiraNaoLida]);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  const toggleMenu = (mensagemId) => {
    setMenuAberto(menuAberto === mensagemId ? null : mensagemId);
  };

  const marcarMensagensComoLidas = async (idDaConversa, listaDeMensagens) => {
    if (!idDaConversa || !listaDeMensagens.length) return;

    const idsNaoLidos = listaDeMensagens
      .filter(msg => !msg.lida && msg.remetenteId !== usuario.id)
      .map(msg => msg.id);

    if (!idsNaoLidos.length) return;

    try {
      await api.put(`/chat/visualizar`, { mensagemIds: idsNaoLidos });
      clearUnreadCountForConversation(idDaConversa);

      setMensagens(prev =>
        prev.map(msg => idsNaoLidos.includes(msg.id) ? { ...msg, lida: true } : msg )
      );
    } catch (error) {
      console.error('Erro ao marcar como lidas:', error);
    }
  };

  const carregarMensagens = async (conversaId) => {
    if (conversaSelecionada) {
      socket.off('join_conversa', conversaSelecionada);
    }

    socket.emit('join_conversa', conversaId);
    setActiveConversationId(conversaId);

    try {
      setPagina(1);
      setHasMore(true);

      const response = await api.get(`/chat/conversas/${conversaId}/mensagens?page=1`);

      const mensagensRecebidas = Array.isArray(response.data) ? response.data : [];

      setMensagens(mensagensRecebidas);
      setConversaSelecionada(conversaId);
      clearUnreadCountForConversation(conversaId);

      setEditandoId(null);
      setTextoEditado('');

      marcarMensagensComoLidas(conversaId, mensagensRecebidas);

      // Se veio menos que 50, acabou
      if (mensagensRecebidas.length < 50) {
        setHasMore(false);
      }

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error.response?.data || error.message);
    }
  };

  const estaNoFinal = () => {
    const el = chatAreaRef.current;
    if (!el) return false;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    deveFazerScrollRef.current = true;
  }, [mensagens]);


  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const handleScroll = () => {
      if (chatArea.scrollTop < 50) {
        carregarMaisMensagens();
      }
    };

    chatArea.addEventListener('scroll', handleScroll);

    return () => {
      chatArea.removeEventListener('scroll', handleScroll);
    };
  }, [pagina, hasMore, loadingMais, conversaSelecionada]);

  const formatarHora = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Erro ao formatar hora:", error);
      return 'Erro';
    }
  };

  const carregarMaisMensagens = async () => {
    if (!hasMore || loadingMais || !conversaSelecionada || mensagens.length === 0) return;

    carregandoMaisRef.current = true;
    deveFazerScrollRef.current = false;
    setLoadingMais(true);

    const scrollAtual = chatAreaRef.current.scrollHeight;

    try {
      const cursor = mensagens[0]?.dataEnvio

      const response = await api.get(
        `/chat/conversas/${conversaSelecionada}/mensagens`,
        {
          params: {
            cursor,
            limit: 50
          }
        }
      );

      const novasMensagens = Array.isArray(response.data) ? response.data : [];

      if (novasMensagens.length === 0) {
        setHasMore(false);
        return;
      }

      setMensagens(prev => [...novasMensagens, ...prev]);


      if (novasMensagens.length < 50) {
        setHasMore(false);
      }

      // Mantém posição do scroll
      requestAnimationFrame(() => {
        const novoScroll = chatAreaRef.current.scrollHeight;
        chatAreaRef.current.scrollTop = novoScroll - scrollAtual;
      });

    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    } finally {
      setTimeout(() => {
        carregandoMaisRef.current = false;
      }, 100);
      setLoadingMais(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNovaMensagem(prevMessage => prevMessage + emoji);
    inputMensagemRef.current?.focus();
  };

  const podeEditarOuDeletar = (enviada_em) => {
    const agora = new Date();
    const enviada = new Date(enviada_em);
    const diffMinutos = (agora - enviada) / 1000 / 60;
    return diffMinutos <= 2;
  };

  const deletarMensagem = async (mensagemId) => {
    try {
      await api.delete(`/chat/mensagens/${mensagemId}`);
      // Socket emitirá evento para atualizar outros clientes
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error.response?.data || error.message);
    } finally {
      setMenuAberto(null);
    }
  };

  // FUNÇÕES PARA EDIÇÃO INLINE
  const iniciarEdicao = (mensagemId, textoAtual) => {
    setEditandoId(mensagemId);
    setTextoEditado(textoAtual);
    setMenuAberto(null);

    // Focar no input após renderização
    setTimeout(() => {
      inputEdicaoRef.current?.focus();
      inputEdicaoRef.current?.select();
    }, 0);
  };

  const salvarEdicao = async (mensagemId) => {
    if (!textoEditado.trim()) {
      cancelarEdicao();
      return;
    }

    const mensagemOriginal = mensagens.find(m => m.id === mensagemId);
    if (textoEditado === mensagemOriginal?.texto) {
      cancelarEdicao();
      return;
    }

    try {
      await api.put(`/chat/mensagens/${mensagemId}`, { novoTexto: textoEditado });

      // Atualiza localmente
      setMensagens(prev => prev.map(msg =>
        msg.id === mensagemId ? { ...msg, texto: textoEditado } : msg
      ));

      setEditandoId(null);
      setTextoEditado('');
    } catch (error) {
      console.error('Erro ao editar mensagem:', error.response?.data || error.message);
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEditado('');
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) {
      console.error('Nenhuma conversa selecionada ou mensagem vazia');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/chat/conversas/${conversaSelecionada}/mensagens`, {
        conversa_id: conversaSelecionada,
        texto: novaMensagem,
      });

      setNovaMensagem('');
      rolarParaUltimaMensagem();

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputMensagemRef.current?.focus(), 10);
    }
  };

  useEffect(() => {
    const handleNewMessage = (mensagem) => {
      if (mensagem.conversaId === conversaSelecionada) {

        const deveScrollar = estaNoFinal();
        setMensagens((prev) => {
          const novaLista = [...prev, mensagem];
          marcarMensagensComoLidas(conversaSelecionada, novaLista);
          if (deveScrollar) {
            rolarParaUltimaMensagem();
          }

          setTimeout(() => clearUnreadCountForConversation(conversaSelecionada), 50);
          return novaLista;
        });
      }
    };

    const handleMessagesRead = ({ conversaId, mensagemIds, lidoPor }) => {
      if (conversaId !== conversaSelecionada) return;
      if (lidoPor === usuario.id) return;
      if (!Array.isArray(mensagemIds) || mensagemIds.length === 0) return;

      deveFazerScrollRef.current = false;

      setMensagens(prevMensagens =>
        prevMensagens.map(msg =>
          mensagemIds.includes(msg.id)
            ? { ...msg, lida: true }
            : msg
        )
      );
    };

    socket.on('nova_mensagem', handleNewMessage);
    socket.on('mensagens_lidas', handleMessagesRead);
    socket.on('connection_error', (err) => {
      console.error('Erro de conexão:', err.message);
    });
    socket.on('edicao_mensagem', ({ mensagemId, novoTexto }) => {
      setMensagens((prev) =>
        prev.map((msg) =>
          msg.id === mensagemId
            ? { ...msg, texto: novoTexto }
            : msg
        )
      );
    });
    socket.on('excluir_mensagem', ({ mensagemId }) => {
      setMensagens((prev) => prev.filter((msg) => msg.id !== mensagemId));
    });

    return () => {
      socket.off('nova_mensagem', handleNewMessage);
      socket.off('mensagens_lidas', handleMessagesRead);
      socket.off('connection_error');
      socket.off('edicao_mensagem');
      socket.off('excluir_mensagem');
    };
  }, [conversaSelecionada, usuario, socket, rolarParaUltimaMensagem]);

  const renderizarMensagemComLinks = (texto) => {
    if (!texto) return null;

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const partes = texto.split(urlRegex);

    return partes.map((parte, index) => {
      if (typeof parte === 'string' && parte.match(urlRegex)) {
        const href = parte.startsWith('http') ? parte : `http://${parte}`;
        return <a key={index} href={href} target="_blank" rel="noopener noreferrer">{parte}</a>;
      }

      if (typeof parte === 'string') {
        const linhas = parte.split('\n');
        return linhas.map((linha, linhaIndex) => (
          <React.Fragment key={`${index}-${linhaIndex}`}>
            {linha}
            {linhaIndex < linhas.length - 1 && <br />}
          </React.Fragment>
        ));
      }

      return parte;
    });
  };

  const deselecionarConversa = () => {
    if (conversaSelecionada) {
      socket.off('join_conversa', conversaSelecionada);
    }
    setActiveConversationId(null);
    setConversaSelecionada(null);
    setMensagens([]);
    setEditandoId(null);
    setTextoEditado('');
  };

  return (
    <div className={`${styles.container} ${conversaSelecionada ? styles.chatAtivoMobile : ''}`}>
      <MenuLateral></MenuLateral>

      {/* SIDEBAR (LISTA DE CONVERSAS) */}
      <div className={`${styles.sidebar} ${conversaSelecionada ? styles.ocultarMobile : ''}`}>
        <h2>Conversas</h2>
        <ul className={styles.lista}>
          {Array.isArray(conversas) && conversas.map((conv) => (
            <li
              key={conv.props.id}
              className={`${styles.item} ${conversaSelecionada === conv.props?.id ? styles.itemSelecionado : ''}`}
              onClick={() => carregarMensagens(conv.props?.id)}
            >
              <div className={styles.conteudoConversa}>
                {usuario.tipo_usuario === "paciente" ? (
                  <span>{conv.props?.profissionalNome}</span>
                ) : (
                  <span>{conv.props?.pacienteCodinome}</span>
                )}
                {conversationUnreadCounts[conv.props.id] > 0 && (
                  <span className={styles.badge}>{conversationUnreadCounts[conv.props?.id]}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ÁREA DO CHAT */}
      <div className={`${styles.chatArea} ${!conversaSelecionada ? styles.ocultarMobile : ''}`}>
        {conversaSelecionada ? (
          <>
            <div className={styles.chatHeader}>
              <button onClick={deselecionarConversa} className={styles.voltarBtn}>
                <IoArrowBackCircleOutline />
              </button>
              <h3>
                {(() => {
                  const conversaAtual = conversas.find(c => c.props?.id === conversaSelecionada);

                  if (!conversaAtual) return 'Chat';

                  if (usuario.tipo_usuario === "paciente") {
                    return (
                      <a
                        href={`/perfil-publico/${conversaAtual.props.profissionalId}`}
                        title={`Ver perfil de ${conversaAtual.props.profissionalNome}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#007bff'}
                        onMouseOut={(e) => e.target.style.color = 'inherit'}
                      >
                        {conversaAtual.props.profissionalNome}
                      </a>
                    );
                  } else {
                    return conversaAtual.props.pacienteCodinome;
                  }
                })()}
              </h3>
            </div>

            <div className={styles.mensagens} ref={chatAreaRef}>
              {loadingMais && (
                <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px' }}>
                  Carregando mensagens antigas...
                </div>
              )}
              {mensagens.map((msg) => {
                const setRef = (el) => {
                  if (el) {
                    mensagemRefs.current.set(msg.id, el);
                  } else {
                    mensagemRefs.current.delete(msg.id);
                  }
                };

                const isEditando = editandoId === msg.id;

                return (
                  <div
                    key={msg.id}
                    ref={setRef}
                    className={`${styles.mensagem} ${usuario.id === msg.remetenteId ? styles.enviada : styles.recebida}`}
                  >
                    <div className={styles.mensagemTopo}>
                      <strong>
                        <span className={usuario.id === msg.remetenteId ? styles.nome : styles.nome_02}>
                          {(() => {
                            const conversaAtual = conversas.find(c => c.props?.id === conversaSelecionada);
                            if (!conversaAtual) return 'Usuário';

                            const mostrarNomeProfissional =
                              (msg.remetenteId === usuario.id && usuario.tipo_usuario === "profissional") ||
                              (msg.remetenteId !== usuario.id && usuario.tipo_usuario === "paciente");

                            if (mostrarNomeProfissional) {
                              return (
                                <a
                                  href={`/perfil-publico/${conversaAtual.props.profissionalId}`}
                                  title={`Ver perfil de ${conversaAtual.props.profissionalNome}`}
                                  style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#007bff'}
                                  onMouseOut={(e) => e.target.style.color = 'inherit'}
                                >
                                  {conversaAtual.props.profissionalNome}
                                </a>
                              );
                            } else {
                              return conversaAtual.props.pacienteCodinome;
                            }
                          })()}
                        </span>
                      </strong>
                      <div className={styles.menuContainer}>
                        {usuario.id === msg.remetenteId && podeEditarOuDeletar(msg.dataEnvio) && !isEditando && (
                          <>
                            <button onClick={() => toggleMenu(msg.id)} className={styles.menuBtn}>⋮</button>
                            {menuAberto === msg.id && (
                              <div ref={menuRef} className={styles.popupMenu}>
                                <button onClick={() => iniciarEdicao(msg.id, msg.texto)}>
                                  <FaEdit style={{ marginRight: '8px' }} /> Editar
                                </button>
                                <button onClick={() => deletarMensagem(msg.id)}>
                                  <FaTrash style={{ marginRight: '8px' }} /> Deletar
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* CONTEÚDO DA MENSAGEM (EDITÁVEL OU NORMAL) */}
                    {isEditando ? (
                      <div className={styles.containerEdicao}>
                        <textarea
                          ref={inputEdicaoRef}
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              salvarEdicao(msg.id);
                            }
                            if (e.key === 'Escape') {
                              cancelarEdicao();
                            }
                          }}
                          className={styles.inputEdicao}
                          rows={Math.min(Math.max(textoEditado.split('\n').length, 1), 5)}
                        />
                        <div className={styles.botoesEdicao}>
                          <button onClick={() => salvarEdicao(msg.id)} className={styles.btnSalvarEdicao}>
                            <FaCheck />
                          </button>
                          <button onClick={cancelarEdicao} className={styles.btnCancelarEdicao}>
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.textoMensagem}>
                        {renderizarMensagemComLinks(msg.texto)}
                      </div>
                    )}

                    <div className={styles.mensagemRodape}>
                      {usuario.id === msg.remetenteId && msg.lida && (<span className={styles.lida}><FaCheckDouble /></span>)}
                      <span className={styles.horario}>{formatarHora(msg.dataEnvio)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={ultimaMensagemRef}></div>
            </div>
            <div className={styles.formEnvio}>
              <EmojiPicker onEmojiSelect={handleEmojiSelect} position="center" />
              <textarea
                ref={inputMensagemRef}
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem();
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={enviarMensagem}
                className={styles.botao}
                disabled={loading || !novaMensagem.trim()}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.estadoVazio}>
            <div className={styles.estadoVazioIcone}>
              <FaRegComment />
            </div>

            <h3>Suas conversas</h3>

            <p>
              Selecione uma conversa ao lado para começar a trocar mensagens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}