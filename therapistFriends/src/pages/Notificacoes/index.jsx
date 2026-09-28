// src/pages/Notificacoes/index.jsx

import React, { useEffect, useState } from 'react';

import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './Notificacoes.module.css';

import { useNotifications } from '../../contexts/NotificationContext';
import api from '../../api/apiConfig';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useUser } from '../../contexts/UserContext';
import { FaCheck } from 'react-icons/fa';

export default function Notificacoes() {
  const { usuario } = useUser();

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  const { markAsRead } = useNotifications();

  // =========================================================
  // PAGINAÇÃO
  // =========================================================

  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const limit = 20;

  // =========================================================
  // FILTRO
  // =========================================================

  const [filtroTipo, setFiltroTipo] = useState('todas');

  // =========================================================
  // AO ALTERAR O FILTRO
  // VOLTA PARA A PRIMEIRA PÁGINA
  // =========================================================

  useEffect(() => {
    setPage(1);
  }, [filtroTipo]);

  // =========================================================
  // BUSCAR NOTIFICAÇÕES
  // =========================================================

  useEffect(() => {
    fetchNotificacoes();
  }, [page, filtroTipo]);

  const fetchNotificacoes = async () => {
    setLoading(true);

    const filtro =
      filtroTipo === 'todas'
        ? ''
        : filtroTipo === 'agendamento'
          ? 'AGENDA'
          : filtroTipo === 'sessao'
            ? 'SESSAO'
            : filtroTipo === 'conversa'
              ? 'CHAT'
              : filtroTipo === 'relatorio'
                ? 'RELATORIO'
                : filtroTipo === 'urgencia'
                  ? 'URGENCIA'
                  : '';

    try {
      const response = await api.get('/notificacoes', {
        params: {
          page,
          limit,
          ...(filtro && { filtro })
        }
      });

      const data = response.data;

      setNotificacoes(data.notificacoes || []);

      setTotalPaginas( data.totalPaginas || 1 );
    } catch (error) {
      console.error( 'Erro ao buscar notificações:', error );

      setNotificacoes([]);
      setTotalPaginas(1);

      toast.error( 'Não foi possível carregar as notificações.' );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MARCAR COMO LIDA
  // =========================================================

  const handleMarcarComoLida = async (notificacaoId) => {
    setUpdating(notificacaoId);

    try {
      await markAsRead(notificacaoId);

      setNotificacoes((prev) => prev.filter( (n) => n.id !== notificacaoId ) );

    } catch (error) {
      console.error( 'Erro ao marcar notificação como lida:', error );
    } finally {
      setUpdating(null);
    }
  };

  // =========================================================
  // ATUALIZAR STATUS DA SOLICITAÇÃO DE CONVERSA
  // =========================================================

  const atualizarStatus = async (
    idSolicitacao,
    status,
    notificacaoId,
    profissionalId,
    pacienteId
  ) => {
    setUpdating(notificacaoId);

    try {
      await api.patch( `/relato/${idSolicitacao}/decidir-vinculo`,
        {
          profissionalId,
          pacienteId,
          decisao: status
        }
      );

      await handleMarcarComoLida(notificacaoId);

      toast.success( 'Solicitação respondida com sucesso!' );
    } catch (error) {
      console.error( 'Erro ao atualizar solicitação:', error );

      setUpdating(null);
    }
  };

  // =========================================================
  // CATEGORIA DA NOTIFICAÇÃO
  // =========================================================

  const getCategoriaNotificacao = (titulo = '') => {
    if (titulo.includes('Urgência')) {
      return 'urgencia';
    }

    if ( titulo.includes('Agendamento') || titulo.includes('Reagendamento') ) {
      return 'agendamento';
    }

    if (titulo.includes('Conversa')) {
      return 'conversa';
    }

    if (titulo.includes('Sessão')) {
      return 'sessao';
    }

    if (titulo.includes('Relatório')) {
      return 'relatorio';
    }

    return 'outros';
  };

  // =========================================================
  // EXTRAIR LINKS DE URGÊNCIA
  // =========================================================

  const extrairLinksUrgencia = (mensagem = '') => {
    const regex = /Aceitar:\s\*(https?:\/\/[^\s|]+)\s\*\|\s\*Recusar:\s\*(https?:\/\/[^\s]+)/;

    const match = mensagem.match(regex);

    if (!match) {
      return {
        texto: mensagem,
        aceitar: null,
        recusar: null
      };
    }

    const textoSemLinks = mensagem.replace( /Aceitar:.*\|.*Recusar:.*$/, '').trim();

    return {
      texto: textoSemLinks,
      aceitar: match[1],
      recusar: match[2]
    };
  };

  // =========================================================
  // CLASSE DO TÍTULO
  // =========================================================

  const getTituloClasse = (titulo = '') => {
    if ( titulo.includes( 'Solicitação de Agendamento' )) {
      return styles.tituloRosa;
    }

    if (titulo.includes('Reagendamento')) {
      return styles.tituloAzul;
    }

    if (titulo.includes('Urgência')) {
      return styles.tituloVermelho;
    }

    if (titulo.includes('confirmado')) {
      return styles.tituloRoxo;
    }

    if (titulo.includes('Rejeitada')) {
      return styles.tituloLaranja;
    }

    if (titulo.includes('Solicitação de Conversa') ) {
      return styles.tituloTusco;
    }

    if (titulo.includes('Sessão')) {
      return styles.tituloAmarelo;
    }

    if (titulo.includes('cancelado')) {
      return styles.tituloCinza;
    }

    if (titulo.includes('Conversa')) {
      return styles.tituloVerde;
    }

    if (titulo.includes('Relatório')) {
      return styles.tituloPreto;
    }

    return '';
  };

  // =========================================================
  // VERIFICAR PRAZO DA URGÊNCIA
  // =========================================================

  const prazoExpirado = (dataEnvio) => {
    const limiteData = new Date(dataEnvio);

    limiteData.setMinutes( limiteData.getMinutes() + 15 );

    return new Date() > limiteData;
  };

  // =========================================================
  // CLIQUE NOS LINKS DE URGÊNCIA
  // =========================================================

  const handleClickLink = (
    url,
    notificacaoId,
    dataEnvio
  ) => {
    const expirado = prazoExpirado( dataEnvio );

    if (expirado) {
      toast.warn( '⚠️ O prazo de 15 minutos para resposta expirou.' );

      handleMarcarComoLida(notificacaoId);

      return;
    }

    handleMarcarComoLida(notificacaoId);

    window.open( url, '_blank', 'noopener,noreferrer' );
  };

  // =========================================================
  // RENDERIZAR MENSAGEM
  // =========================================================

  const renderizarMensagem = (notificacao) => {
    const { mensagem, metadata, titulo } = notificacao;

    // -------------------------------------------------------
    // AGENDAMENTO
    // -------------------------------------------------------

    if ( titulo.includes('Agendamento') && metadata?.dataInicio ) {
      const dataBruta = metadata.dataInicio.replace('Z', '');

      const data = new Date(dataBruta);

      const dataFormatada = moment(data).format( 'DD/MM/YYYY [às] HH:mm' );

      return `${mensagem} ${dataFormatada}.`;
    }

    // -------------------------------------------------------
    // URGÊNCIA
    // -------------------------------------------------------

    if (titulo.includes('Urgência')) {
      return extrairLinksUrgencia( mensagem ).texto;
    }

    // -------------------------------------------------------
    // SESSÃO
    // -------------------------------------------------------

    if ( titulo.includes('Sessão') && metadata?.dataInicio ) {
      const dataBruta = metadata.dataInicio.replace('Z', '');

      const data = new Date(dataBruta);

      const dataFormatada = moment(data).format( 'DD/MM/YYYY [às] HH:mm' );

      const nome = usuario?.tipo_usuario === 'paciente'
          ? metadata?.nomeProfissional ||
            'Profissional'
          : metadata?.nomePaciente ||
            'paciente';
      
      const tipoUsuario = usuario?.tipo_usuario === 'paciente' ? 'profissional' : 'paciente';
     

      return `${mensagem} Com o ${tipoUsuario} ${nome} marcado para o dia ${dataFormatada}.`;
    }

    return mensagem;
  };

  // =========================================================
  // ABRIR RELATÓRIO
  // =========================================================

  const handleAbrirRelatorio = (sessaoId) => {
    window.open(`/relatorio/${sessaoId}`, '_blank', 'noopener,noreferrer' );
  };

  // =========================================================
  // ALTERAR PÁGINA
  // =========================================================

  const handlePaginaAnterior = () => {
    setPage((prev) => Math.max(prev - 1, 1) );
  };

  const handleProximaPagina = () => {
    setPage((prev) => Math.min( prev + 1, totalPaginas ) );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className={styles.container}>
      <MenuLateral />

      <main className={styles.conteudo}>

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              Central de atualizações
            </span>

            <h1>
              Notificações
            </h1>

            <p>
              Acompanhe solicitações, sessões e outras atualizações importantes.
            </p>
          </div>
        </div>

        {/* =================================================
            FILTROS
        ================================================= */}

        <div className={styles.filtrosContainer}>

          <button
            type="button"
            className={`${styles.btnFiltro} ${
              filtroTipo === 'todas'
                ? styles.ativo
                : ''
            }`}
            onClick={() => setFiltroTipo('todas') }
          >
            Todas
          </button>

          <button
            type="button"
            className={`${styles.btnFiltro} ${
              filtroTipo === 'agendamento'
                ? styles.ativo
                : ''
            }`}
            onClick={() => setFiltroTipo( 'agendamento' ) }
          >
            Agendamentos
          </button>

          <button
            type="button"
            className={`${styles.btnFiltro} ${
              filtroTipo === 'sessao'
                ? styles.ativo
                : ''
            }`}
            onClick={() => setFiltroTipo('sessao') }
          >
            Sessões
          </button>

          <button
            type="button"
            className={`${styles.btnFiltro} ${
              filtroTipo === 'conversa'
                ? styles.ativo
                : ''
            }`}
            onClick={() => setFiltroTipo('conversa')
            }
          >
            Conversas
          </button>

          {usuario?.tipo_usuario === 'profissional' && (
            <>
              <button
                type="button"
                className={`${styles.btnFiltro} ${
                  filtroTipo === 'urgencia'
                    ? styles.ativo
                    : ''
                }`}
                onClick={() => setFiltroTipo( 'urgencia' ) }
              >
                Urgências
              </button>

              <button
                type="button"
                className={`${styles.btnFiltro} ${
                  filtroTipo === 'relatorio'
                    ? styles.ativo
                    : ''
                }`}
                onClick={() => setFiltroTipo( 'relatorio' ) }
              >
                Relatórios
              </button>
            </>
          )}
        </div>

        {/* =================================================
            ESTADOS
        ================================================= */}

        {loading ? (
          <div className={styles.estado}>
            <div className={ styles.loadingIcon } >
              <span />
              <span />
              <span />
            </div>

            <p>
              Carregando notificações...
            </p>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className={ styles.estadoVazio } >

            <div className={ styles.emptyIcon } >
              <FaCheck />
            </div>

            <h3>
              Nenhuma notificação
            </h3>

            <p>
              {filtroTipo !== 'todas'
                ? 'Não encontramos notificações para este filtro.'
                : 'Você está em dia. Novas atualizações aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                LISTA
            ================================================= */}

            <ul className={styles.lista}>
              {notificacoes.map(
                (notificacao) => {
                  const { titulo, createdAt } = notificacao;

                  const mensagemFinal = renderizarMensagem( notificacao );

                  const { texto, aceitar, recusar } = extrairLinksUrgencia( mensagemFinal );

                  const expirado = prazoExpirado( createdAt );

                  const tituloClasse = getTituloClasse( titulo );

                  return (
                    <li 
                      key={ notificacao.id }
                      className={`${styles.item} ${tituloClasse}`}
                    >
                      {/* =====================================
                          CABEÇALHO
                      ===================================== */}

                      <div className={ styles.itemHeader } >

                        <div className={`${styles.titulo} ${tituloClasse}`} >
                          {titulo}
                        </div>

                        <span className={ styles.statusDot } />
                      </div>

                      {/* =====================================
                          MENSAGEM
                      ===================================== */}

                      <div className={ styles.mensagem } >
                        {texto}
                      </div>

                      {/* =====================================
                          DATA
                      ===================================== */}

                      <div className={ styles.data } >
                        {new Date( createdAt ).toLocaleString( 'pt-BR' )}

                        {titulo.includes( 'Notificação de Urgência' ) && (
                          <span className={`${styles.prazo} ${ expirado ? styles.prazoExpirado : styles.prazoAtivo }`} >

                            {expirado ? 'Expirada' : 'Dentro do prazo'}
                          </span>
                        )}
                      </div>

                      {/* =====================================
                          URGÊNCIA
                      ===================================== */}

                      {titulo.includes( 'Notificação de Urgência' ) && aceitar && recusar ? (
                        <div className={ styles.botoes } >
                          {expirado ? (
                            <button
                              type="button"
                              className={`${styles.botaoMarcarLida} ${styles.urgencia}`}
                              onClick={() => handleMarcarComoLida( notificacao.id ) }
                              disabled={ updating === notificacao.id }
                            >
                              {updating === notificacao.id ? 'Processando...' : 'Marcar como lida'}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                className={ styles.botaoAceitar }
                                onClick={() => handleClickLink( aceitar, notificacao.id, createdAt ) }
                                disabled={ updating === notificacao.id }
                              >
                                Aceitar
                              </button>

                              <button
                                type="button"
                                className={ styles.botaoRecusar }
                                onClick={() => handleClickLink( recusar, notificacao.id, createdAt ) }
                                disabled={ updating === notificacao.id }
                              >
                                Recusar
                              </button>
                            </>
                          )}
                        </div>
                      ) : titulo.includes( 'Nova Solicitação de Conversa' ) ? (

                        /* =================================
                           SOLICITAÇÃO DE CONVERSA
                        ================================= */

                        <div className={ styles.botoes } >
                          <button
                            type="button"
                            className={ styles.botaoAceitar }
                            onClick={() =>
                              atualizarStatus(
                                notificacao
                                  .metadata
                                  .relatoId,
                                'aceitar',
                                notificacao.id,
                                notificacao
                                  .metadata
                                  .profissionalId,
                                notificacao
                                  .metadata
                                  .pacienteId
                              )
                            }
                            disabled={ updating === notificacao.id }
                          >
                            {updating ===
                            notificacao.id
                              ? 'Processando...'
                              : 'Aceitar'}
                          </button>

                          <button
                            type="button"
                            className={ styles.botaoRecusar }
                            onClick={() =>
                              atualizarStatus(
                                notificacao
                                  .metadata
                                  .relatoId,
                                'recusar',
                                notificacao.id,
                                notificacao
                                  .metadata
                                  .profissionalId,
                                notificacao
                                  .metadata
                                  .pacienteId
                              )
                            }
                            disabled={ updating === notificacao.id }
                          >
                            {updating ===
                            notificacao.id
                              ? 'Processando...'
                              : 'Recusar'}
                          </button>
                        </div>

                      ) : titulo.includes( 'Sessão' ) ? (

                        /* =================================
                           SESSÃO
                        ================================= */

                        <div className={ styles.botoes } >
                          <button
                            type="button"
                            className={ styles.botaoSessao }
                            onClick={() =>
                              window.open(
                                notificacao
                                  .metadata
                                  .link,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }
                            disabled={ updating === notificacao.id }
                          >
                            Entrar na sessão
                          </button>
                        </div>

                      ) : titulo.includes( 'Relatório' ) ? (

                        /* =================================
                           RELATÓRIO
                        ================================= */

                        <div className={ styles.botoes } >
                          <button
                            type="button"
                            className={ styles.botaoRelatorio }
                            onClick={() =>
                              handleAbrirRelatorio(notificacao.metadata.sessaoId)
                            }
                            disabled={ updating === notificacao.id }
                          >
                            {updating ===
                            notificacao.id
                              ? 'Processando...'
                              : 'Ver relatório'}
                          </button>
                        </div>

                      ) : (

                        /* =================================
                           PADRÃO
                        ================================= */

                        <div className={ styles.botoes } >
                          <button
                            type="button"
                            className={`${styles.botaoMarcarLida} ${tituloClasse}`}
                            onClick={() => handleMarcarComoLida( notificacao.id ) }
                            disabled={ updating === notificacao.id }
                          >
                            {updating ===
                            notificacao.id
                              ? 'Processando...'
                              : 'Marcar como lida'}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                }
              )}
            </ul>

            {/* =================================================
                PAGINAÇÃO
            ================================================= */}

            {totalPaginas > 1 && (
              <div className={ styles.paginationRelato } >
                <button
                  type="button"
                  onClick={ handlePaginaAnterior }
                  disabled={page === 1}
                >
                  Anterior
                </button>

                <span>
                  Página{' '}
                  <strong>
                    {page}
                  </strong>{' '}
                  de{' '}
                  <strong>
                    {totalPaginas}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={ handleProximaPagina }
                  disabled={ page >= totalPaginas }
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}