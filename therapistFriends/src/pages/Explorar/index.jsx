// src/pages/Explorar/index.jsx

import React, { useState, useEffect } from 'react';
import styles from './Explorar.module.css';

import MenuLateral from '../../Components/Menu/MenuLateral';

import Modal from 'react-modal';
import api from '../../api/apiConfig';

import { IoIosClose } from 'react-icons/io';

const Explorar = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  // ============================
  // ESTADOS DE BUSCA
  // ============================

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [buscaFinal, setBuscaFinal] = useState('');
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState(null);

  // ============================
  // PAGINAÇÃO
  // ============================

  const [pagina, setPagina] = useState(1);
  const [paginasTotais, setPaginasTotais] = useState(1);
  const [limite] = useState(20);

  // ============================
  // CONTROLE
  // ============================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOpen = !!profissionalSelecionado;

  const onClose = () => { setProfissionalSelecionado(null) };

  Modal.setAppElement('#root');

  // ============================
  // DEBOUNCE DA PESQUISA
  // ============================

  useEffect(() => {
    const handler = setTimeout(() => {
      setBuscaFinal(termoPesquisa);
      setPagina(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [termoPesquisa]);

  // ============================
  // BUSCA PROFISSIONAIS
  // ============================

  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        setLoading(true);

        const response = await api.get('/profissionais/buscar', {
          params: {
            page: pagina,
            limit: limite,
            nome: buscaFinal || undefined,
            especialidade: buscaFinal || undefined
          }
        });

        setProfissionais(response.data.data || []);
        setPaginasTotais( response.data.paginas_totais || 1 );

        setError(null);
      } catch (err) {
        setError('Erro ao carregar profissionais');
      } finally {
        setLoading(false);
      }
    };

    fetchProfissionais();
  }, [pagina, buscaFinal, limite]);

  // ============================
  // HANDLERS
  // ============================

  const toggleMenu = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  const formatarEspecialidades = (especialidades = []) => {
    if (!especialidades || especialidades.length === 0) {
      return 'Não informado';
    }

    return Array.isArray(especialidades)
      ? especialidades.map((esp) => esp.nome).join(' • ')
      : especialidades;
  };

  const agendarConsulta = (id, nome) => {
    window.location.href = `/agenda-paciente/${id}/${nome}`;
  };

  const verAvaliacoes = (id) => {
    window.location.href = `/perfil-publico/${id}`;
  };

  const getInitials = (nome) => {
    if (!nome) return '?';

    const nomeLimpo = nome.replace(/^Dr\.\s*/i, '').replace(/^Dra\.\s*/i, '').trim();

    const palavras = nomeLimpo.split(' ');

    if (palavras.length === 1) {
      return nomeLimpo.substring(0, 2).toUpperCase();
    }

    const primeira = palavras[0]?.charAt(0) || '';
    const segunda = palavras[1]?.charAt(0) || '';

    return (primeira + segunda).toUpperCase();
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className={styles.appContainer}>

      <MenuLateral
        collapsed={menuCollapsed}
        toggleMenu={toggleMenu}
      />

      <main className={styles.mainContent}>

        {/* ============================
            CABEÇALHO
        ============================ */}

        <header className={styles.pageHeader}>

          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>
              Profissionais
            </span>

            <h1>
              Encontre o profissional ideal
            </h1>

            <p>
              Explore profissionais de saúde mental e conheça suas especialidades.
            </p>
          </div>

          <div className={styles.searchContainer}>

            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              placeholder="Buscar por nome ou especialidade..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value) }
              className={styles.input}
            />

            {termoPesquisa && (
              <button
                className={styles.clearSearch}
                onClick={() => setTermoPesquisa('')}
                aria-label="Limpar pesquisa"
              >
                <IoIosClose />
              </button>
            )}

          </div>

        </header>


        {/* ============================
            CONTEÚDO
        ============================ */}

        {loading ? (

          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />

            <p>
              Buscando profissionais...
            </p>
          </div>

        ) : error ? (

          <div className={styles.errorContainer}>

            <div className={styles.errorIcon}>
              !
            </div>

            <h2>
              Não foi possível carregar os profissionais
            </h2>

            <p>
              Ocorreu um problema ao realizar a busca.
              Tente novamente.
            </p>

            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>

          </div>

        ) : (

          <>

            {/* Resultado da busca */}

            <div className={styles.resultsHeader}>

              <div>
                <h2>
                  Profissionais disponíveis
                </h2>

                {buscaFinal ? (
                  <p>
                    Resultados para{' '}
                    <strong>"{buscaFinal}"</strong>
                  </p>
                ) : (
                  <p>
                    Conheça os profissionais da plataforma.
                  </p>
                )}
              </div>

              {profissionais.length > 0 && (
                <span className={styles.resultCount}>
                  {profissionais.length}{' '}
                  {profissionais.length === 1
                    ? 'profissional'
                    : 'profissionais'}
                </span>
              )}

            </div>


            {/* Lista */}

            <div className={styles.profissionaisList}>

              {profissionais.length > 0 ? (

                profissionais.map((prof) => (

                  <article
                    key={prof.id}
                    className={styles.profissionalCard}
                  >

                    <div className={styles.profissionalAvatar}>
                      {getInitials(prof.nome)}
                    </div>


                    <div className={styles.profissionalInfo}>

                      <h3>
                        {prof.nome}
                      </h3>

                      <div className={styles.specialties}>
                        {formatarEspecialidades( prof.especialidades )}
                      </div>

                      <span
                        className={styles.profissionalCrp}
                      >
                        CRP:{' '}
                        {prof.crp || 'Não informado'}
                      </span>

                    </div>


                    <button
                      onClick={() => setProfissionalSelecionado(prof) }
                      className={styles.profileButton}
                    >
                      Ver perfil completo
                    </button>

                  </article>

                ))

              ) : (

                <div className={styles.noResults}>

                  <div className={styles.noResultsIcon}>
                    ?
                  </div>

                  <h2>
                    Nenhum profissional encontrado
                  </h2>

                  <p>
                    Não encontramos profissionais para{' '}
                    <strong>
                      "{buscaFinal}"
                    </strong>
                    .
                  </p>

                  {buscaFinal && (
                    <button
                      className={styles.clearFiltersButton}
                      onClick={() => setTermoPesquisa('')}
                    >
                      Limpar busca
                    </button>
                  )}

                </div>

              )}

            </div>


            {/* ============================
                PAGINAÇÃO
            ============================ */}

            {paginasTotais > 1 && (
              <div className={styles.pagination}>

                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina((prev) => prev - 1) }
                >
                  Anterior
                </button>

                <span>
                  Página{' '}
                  <strong>{pagina}</strong>{' '}
                  de {paginasTotais}
                </span>

                <button
                  disabled={pagina === paginasTotais}
                  onClick={() => setPagina((prev) => prev + 1) }
                >
                  Próxima
                </button>

              </div>
            )}

          </>

        )}

      </main>


      {/* ============================
          MODAL DO PROFISSIONAL
      ============================ */}

      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        overlayClassName={styles.modalOverlay}
        className={styles.modalContent}
      >

        {profissionalSelecionado && (

          <>

            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fechar perfil"
            >
              <IoIosClose size={28} />
            </button>


            <div className={styles.modalHeader}>

              <div className={styles.modalAvatar}>
                {getInitials( profissionalSelecionado.nome )}
              </div>

              <div className={styles.modalTitle}>
                <span>
                  Profissional
                </span>

                <h2>
                  {profissionalSelecionado.nome}
                </h2>
              </div>

            </div>


            <div className={styles.modalDetails}>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  CRP
                </span>

                <strong>
                  {profissionalSelecionado.crp || 'Não informado'}
                </strong>
              </div>


              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  Especialidades
                </span>

                <strong>
                  {formatarEspecialidades( profissionalSelecionado.especialidades )}
                </strong>
              </div>


              <div className={styles.bioSection}>

                <span className={styles.detailLabel}>
                  Sobre o profissional
                </span>

                <p className={styles.modalBio}>
                  {profissionalSelecionado.bio || 'Este profissional ainda não adicionou uma biografia.'}
                </p>

              </div>

            </div>


            <div className={styles.modalActions}>

              <button
                className={styles.secondaryButton}
                onClick={() => verAvaliacoes( profissionalSelecionado.id ) }
              >
                Ver avaliações
              </button>

              <button
                className={styles.primaryButton}
                onClick={() =>  agendarConsulta( profissionalSelecionado.id, profissionalSelecionado.nome ) }
              >
                Agendar consulta
              </button>

            </div>

          </>

        )}

      </Modal>

    </div>
  );
};

export default Explorar;