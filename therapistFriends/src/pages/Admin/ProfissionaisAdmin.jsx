// src/pages/admin/ProfissionaisAdmin.jsx

import React, { useEffect, useState } from 'react';
import MenuLateralAdmin from '../../Components/Menu/MenuLateralAdmin';
import styles from './Admin.module.css';
import api from '../../api/apiConfig';

function ProfissionaisAdmin() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================
  // PAGINAÇÃO
  // ============================
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [limite] = useState(10);

  // ============================
  // MODAIS
  // ============================
  const [modalOpen, setModalOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);

  const [motivo, setMotivo] = useState('');
  const [status, setStatus] = useState('validado');
  const [historico, setHistorico] = useState([]);

  // ============================
  // BUSCA E FILTRO
  // ============================
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [buscaFinal, setBuscaFinal] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  // ============================
  // DEBOUNCE
  // ============================
  useEffect(() => {
    const handler = setTimeout(() => {
      setBuscaFinal(termoPesquisa);
      setPaginaAtual(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [termoPesquisa]);

  // ============================
  // BUSCAR PROFISSIONAIS
  // ============================
  useEffect(() => {
    const buscarProfissionais = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: paginaAtual,
          limit: limite,
        };

        if (statusFiltro !== 'todos') {
          let statusParam;
          switch (statusFiltro) {
            case 'validados':
              statusParam = 'validado';
              break;
            case 'naoValidados':
              statusParam = 'recusado';
              break;
            case 'pendentes':
              statusParam = 'pendente';
              break;
            case 'revogado':
              statusParam = 'revogado';
              break;
            default:
              statusParam = statusFiltro;
          }
          params.status = statusParam;
        }

        if (buscaFinal.trim()) {
          params.busca = buscaFinal;
        }

        const response = await api.get('/admin/profissionais', { params });

        if (response.data.dados) {
          setProfissionais(response.data.dados);
          setTotalPaginas(response.data.totalPaginas);
          setTotalRegistros(response.data.total);
        } else {
          setProfissionais(response.data || []);
          setTotalPaginas(1);
          setTotalRegistros(response.data.length || 0);
        }
      } catch (error) {
        setError('Erro ao carregar lista de profissionais');
      } finally {
        setLoading(false);
      }
    };

    buscarProfissionais();
  }, [paginaAtual, statusFiltro, buscaFinal, limite]);

  // ============================
  // FILTRO DE STATUS
  // ============================
  const handleFiltroStatus = (e) => {
    setStatusFiltro(e.target.value);
    setPaginaAtual(1);
  };

  // ============================
  // ABRIR MODAL DE DECISÃO
  // ============================
  const abrirModal = (prof) => {
    setProfissionalSelecionado(prof);
    setMotivo('');
    setStatus('validado');
    setModalOpen(true);
  };

  // ============================
  // ABRIR HISTÓRICO
  // ============================
  const abrirHistorico = async (prof) => {
    setProfissionalSelecionado(prof);

    try {
      const response = await api.get(`/admin/historico/${prof.id}`);
      setHistorico(response.data);
      setHistoricoOpen(true);
    } catch (error) {
      setHistorico([]);
    }
  };

  // ============================
  // ENVIAR DECISÃO (ATUALIZADO)
  // ============================
  const enviarDecisao = async () => {
    if (!motivo.trim()) {
      alert('O motivo é obrigatório.');
      return;
    }

    try {
      await api.post('/admin/validar', {
        profissionalId: profissionalSelecionado.id,
        status,
        motivo,
      });

      alert('Decisão registrada com sucesso!');

      // Converte a string de status enviada para o boolean/estado correspondente
      const novoValidado = status === 'validado' ? true : status === 'revogado' ? false : null;

      // Atualiza o estado da lista localmente de forma instantânea
      setProfissionais((prevProfissionais) =>
        prevProfissionais.map((p) => {
          const idItem = p.id_usuario || p.id;
          const idSelecionado = profissionalSelecionado.id_usuario || profissionalSelecionado.id;

          if (idItem === idSelecionado) {
            return {
              ...p,
              validado: novoValidado,
              status: status, 
            };
          }
          return p;
        })
      );

      setModalOpen(false);
    } catch (error) {
      alert('Erro ao registrar decisão.');
    }
  };

  // ============================
  // STATUS
  // ============================
  const getStatusDisplay = (p) => {
    if (p.validado === true) {
      return {
        texto: 'Validado',
        classe: styles.statusValidado,
      };
    }

    if (p.validado === false) {
      return {
        texto: 'Não validado',
        classe: styles.statusReprovado,
      };
    }

    return {
      texto: 'Em espera',
      classe: styles.statusPendente,
    };
  };

  return (
    <div className={styles.adminContainer}>
      <MenuLateralAdmin />

      <main className={styles.adminConteudo}>
        {/* CABEÇALHO */}
        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>GESTÃO PROFISSIONAL</span>
          <h1>Profissionais</h1>
          <p>
            Gerencie os profissionais cadastrados, valide seus registros e acompanhe o histórico de decisões.
          </p>
        </header>

        {/* LISTA */}
        <section className={styles.listaSection}>
          <div className={styles.listaHeader}>
            <div>
              <span className={styles.sectionEyebrow}>PROFISSIONAIS CADASTRADOS</span>
              <h2>Lista de profissionais</h2>
            </div>
            <div className={styles.totalBadge}>{totalRegistros} registros</div>
          </div>

          {/* FILTROS */}
          <div className={styles.filtrosAdmin}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone, CPF ou CRP..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className={styles.filtroInput}
                aria-label="Buscar profissionais"
              />
              {termoPesquisa && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => setTermoPesquisa('')}
                  aria-label="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFiltro}
              onChange={handleFiltroStatus}
              className={styles.filtroSelect}
              aria-label="Filtrar por status"
            >
              <option value="todos">Todos os profissionais</option>
              <option value="validados">Validados</option>
              <option value="revogado">Revogados</option>
              <option value="pendentes">Pendentes</option>
            </select>
          </div>

          {/* TABELA */}
          <div className={styles.tabelaWrapper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <span>Carregando profissionais...</span>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <strong>Não foi possível carregar os profissionais</strong>
                <span>{error}</span>
              </div>
            ) : (
              <table className={styles.tabelaProfissionais}>
                <thead>
                  <tr>
                    <th>Profissional</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>CPF</th>
                    <th>CRP</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profissionais.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={styles.tabelaVazia}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>🩺</div>
                          <strong>Nenhum profissional encontrado</strong>
                          <span>
                            {buscaFinal
                              ? `Não encontramos profissionais para "${buscaFinal}".`
                              : 'Ainda não existem profissionais cadastrados.'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    profissionais.map((p) => {
                      const statusDisplay = getStatusDisplay(p);
                      const nome = p.usuario?.nome || p.nome;
                      const email = p.usuario?.email || p.email;

                      return (
                        <tr key={p.id_usuario || p.id}>
                          <td data-label="Profissional">
                            <div className={styles.nomeUsuario}>
                              <div className={styles.avatarProfissional}>
                                {nome?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className={styles.usuarioInfo}>
                                <strong>{nome}</strong>
                                <span>Profissional</span>
                              </div>
                            </div>
                          </td>
                          <td data-label="Email">
                            <span className={styles.emailUsuario}>{email}</span>
                          </td>
                          <td data-label="Telefone">{p.telefone || '---'}</td>
                          <td data-label="CPF">{p.cpf || '---'}</td>
                          <td data-label="CRP">
                            <span className={styles.crpValue}>{p.crp || '---'}</span>
                          </td>
                          <td data-label="Status">
                            <span className={statusDisplay.classe}>
                              <span className={styles.statusDot} />
                              {statusDisplay.texto}
                            </span>
                          </td>
                          <td data-label="Ações">
                            <div className={styles.acoesAdmin}>
                              <button
                                type="button"
                                className={styles.btnValidar}
                                onClick={() => abrirModal(p)}
                              >
                                Validar
                              </button>
                              <button
                                type="button"
                                className={styles.btnHistorico}
                                onClick={() => abrirHistorico(p)}
                              >
                                Histórico
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {!loading && totalPaginas > 1 && (
            <div className={styles.paginacao}>
              <div className={styles.infoPagina}>
                Página <strong>{paginaAtual}</strong> de <strong>{totalPaginas}</strong> <span>•</span>{' '}
                {totalRegistros} registros
              </div>
              <div className={styles.botoesPaginacao}>
                <button
                  type="button"
                  onClick={() => setPaginaAtual((prev) => prev - 1)}
                  disabled={paginaAtual === 1}
                  className={styles.btnPaginacao}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaAtual((prev) => prev + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={styles.btnPaginacao}
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL DECISÃO */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modalAdmin}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>ANÁLISE PROFISSIONAL</span>
                <h2>Decisão de validação</h2>
                <p>{profissionalSelecionado?.usuario?.nome || profissionalSelecionado?.nome}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setModalOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Status da análise</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.modalSelect}
                >
                  <option value="validado">Validar profissional</option>
                  <option value="pendente">Manter como pendente</option>
                  <option value="revogado">Revogar validação</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Motivo da decisão</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo da decisão..."
                  rows={5}
                  required
                  className={styles.modalTextarea}
                />
                <span className={styles.helperText}>
                  O motivo será registrado no histórico do profissional.
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnCancelarModal}
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.btnSalvarModal} onClick={enviarDecisao}>
                Salvar decisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO */}
      {historicoOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setHistoricoOpen(false);
          }}
        >
          <div className={`${styles.modalAdmin} ${styles.modalHistorico}`}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>REGISTRO DE DECISÕES</span>
                <h2>Histórico</h2>
                <p>{profissionalSelecionado?.usuario?.nome || profissionalSelecionado?.nome}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setHistoricoOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className={styles.historicoContent}>
              {historico.length === 0 ? (
                <div className={styles.emptyHistorico}>
                  <div className={styles.emptyIcon}>🗂️</div>
                  <strong>Sem registros</strong>
                  <span>Nenhuma decisão foi registrada para este profissional.</span>
                </div>
              ) : (
                <div className={styles.historicoLista}>
                  {historico.map((h) => (
                    <article key={h.id} className={styles.historicoItem}>
                      <div className={styles.historicoTop}>
                        <strong>{new Date(h.data_decisao).toLocaleString('pt-BR')}</strong>
                        <span
                          className={`${styles.historicoStatus} ${
                            styles[`historicoStatus_${h.status}`] || ''
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <div className={styles.historicoMotivo}>
                        <span>Motivo</span>
                        <p>{h.motivo}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnCancelarModal}
                onClick={() => setHistoricoOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfissionaisAdmin;