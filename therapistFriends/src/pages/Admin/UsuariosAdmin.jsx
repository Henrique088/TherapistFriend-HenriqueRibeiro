// src/pages/admin/UsuariosAdmin.jsx

import React, { useEffect, useState } from 'react';
import MenuLateralAdmin from '../../Components/Menu/MenuLateralAdmin';
import styles from './Admin.module.css';
import api from '../../api/apiConfig';

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
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
  // BUSCA
  // ============================

  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [buscaFinal, setBuscaFinal] = useState('');

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
  // CARREGAR USUÁRIOS
  // ============================

  useEffect(() => {
    const carregarUsuarios = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: paginaAtual,
          limit: limite,
        };

        if (buscaFinal.trim()) {
          params.busca = buscaFinal;
        }

        const response = await api.get('/admin/usuarios', {
          params,
        });

        setUsuarios(response.data.usuarios || []);
        setTotalPaginas(response.data.totalPaginas || 1);
        setTotalRegistros(response.data.total || 0);

      } catch (error) {
        setError('Erro ao carregar lista de usuários');
      } finally {
        setLoading(false);
      }
    };

    carregarUsuarios();
  }, [paginaAtual, buscaFinal, limite]);

  return (
    <div className={styles.adminContainer}>

      <MenuLateralAdmin />

      <main className={styles.adminConteudo}>

        {/* =========================
            CABEÇALHO
        ========================= */}

        <header className={styles.pageHeader}>

          <span className={styles.eyebrow}>
            GESTÃO DE USUÁRIOS
          </span>

          <h1>
            Usuários
          </h1>

          <p>
            Consulte os usuários cadastrados e acompanhe
            seus respectivos tipos e status.
          </p>

        </header>


        {/* =========================
            LISTA
        ========================= */}

        <section className={styles.listaSection}>

          <div className={styles.listaHeader}>

            <div>
              <span className={styles.sectionEyebrow}>
                USUÁRIOS CADASTRADOS
              </span>

              <h2>
                Lista de usuários
              </h2>
            </div>

            <div className={styles.totalBadge}>
              {totalRegistros} registros
            </div>

          </div>


          {/* =========================
              BUSCA
          ========================= */}

          <div className={styles.filtroContainer}>

            <div className={styles.searchIcon}>
              🔎
            </div>

            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className={styles.filtroInput}
              aria-label="Buscar usuários"
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


          {/* =========================
              ESTADOS
          ========================= */}

          {loading ? (

            <div className={styles.loadingState}>

              <div className={styles.loadingSpinner} />

              <span>
                Carregando usuários...
              </span>

            </div>

          ) : error ? (

            <div className={styles.errorState}>

              <strong>
                Não foi possível carregar os usuários
              </strong>

              <span>
                {error}
              </span>

            </div>

          ) : (

            <>

              {/* =========================
                  VAZIO
              ========================= */}

              {usuarios.length === 0 ? (

                <div className={styles.emptyState}>

                  <div className={styles.emptyIcon}>
                    👥
                  </div>

                  <strong>
                    Nenhum usuário encontrado
                  </strong>

                  <span>
                    {buscaFinal
                      ? `Não encontramos usuários para "${buscaFinal}".`
                      : 'Ainda não existem usuários cadastrados na plataforma.'}
                  </span>

                </div>

              ) : (

                /* =========================
                   TABELA
                ========================= */

                <div className={styles.tabelaWrapper}>

                  <table className={styles.tabelaUsuarios}>

                    <thead>

                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Tipo</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {usuarios.map((u) => (

                        <tr key={u.id}>

                          {/* ID */}

                          <td data-label="ID">
                            <span className={styles.idUsuario}>
                              #{u.id}
                            </span>
                          </td>


                          {/* NOME */}

                          <td data-label="Nome">

                            <div className={styles.nomeUsuario}>

                              <div className={styles.avatarUsuario}>
                                {u.nome?.charAt(0)?.toUpperCase() || '?'}
                              </div>

                              <span>
                                {u.nome}
                              </span>

                            </div>

                          </td>


                          {/* EMAIL */}

                          <td data-label="Email">

                            <span className={styles.emailUsuario}>
                              {u.email}
                            </span>

                          </td>


                          {/* TELEFONE */}

                          <td data-label="Telefone">
                            {u.telefone || '---'}
                          </td>


                          {/* TIPO */}

                          <td data-label="Tipo">

                            <span
                              className={`${styles.tipoBadge} ${
                                u.tipo_usuario === 'profissional'
                                  ? styles.tipoProfissional
                                  : u.tipo_usuario === 'paciente'
                                    ? styles.tipoPaciente
                                    : styles.tipoAdmin
                              }`}
                            >
                              {u.tipo_usuario}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td data-label="Status">

                            <span
                              className={
                                u.ativo
                                  ? styles.statusAtivo
                                  : styles.statusInativo
                              }
                            >
                              <span
                                className={styles.statusDot}
                              />

                              {u.ativo
                                ? 'Ativo'
                                : 'Inativo'}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}


              {/* =========================
                  PAGINAÇÃO
              ========================= */}

              {totalPaginas > 1 && (

                <div className={styles.paginacao}>

                  <div className={styles.infoPagina}>

                    Página{' '}

                    <strong>
                      {paginaAtual}
                    </strong>

                    {' '}de{' '}

                    <strong>
                      {totalPaginas}
                    </strong>

                    <span>
                      •
                    </span>

                    {totalRegistros} registros

                  </div>


                  <div className={styles.botoesPaginacao}>

                    <button
                      type="button"
                      onClick={() =>
                        setPaginaAtual(
                          (prev) => prev - 1
                        )
                      }
                      disabled={paginaAtual === 1}
                      className={styles.btnPaginacao}
                    >
                      ← Anterior
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setPaginaAtual(
                          (prev) => prev + 1
                        )
                      }
                      disabled={
                        paginaAtual === totalPaginas
                      }
                      className={styles.btnPaginacao}
                    >
                      Próxima →
                    </button>

                  </div>

                </div>

              )}

            </>

          )}

        </section>

      </main>

    </div>
  );
}

export default UsuariosAdmin;