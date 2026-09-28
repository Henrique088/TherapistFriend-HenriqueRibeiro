// src/pages/Admin/PacienteAdmin.jsx

import React, { useEffect, useState } from 'react';
import MenuLateralAdmin from '../../Components/Menu/MenuLateralAdmin';
import styles from './Admin.module.css';
import api from '../../api/apiConfig';

function PacientesAdmin() {
  const [pacientes, setPacientes] = useState([]);
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
  // CARREGAR PACIENTES
  // ============================

  useEffect(() => {
    const carregarPacientes = async () => {
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

        const response = await api.get('/admin/pacientes', {
          params,
        });

        setPacientes(response.data.dados || []);
        setTotalPaginas(response.data.totalPaginas || 1);
        setTotalRegistros(response.data.total || 0);

      } catch (error) {
        setError(
          'Não foi possível carregar os pacientes.'
        );
      } finally {
        setLoading(false);
      }
    };

    carregarPacientes();
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
            Pacientes
          </h1>

          <p>
            Consulte e acompanhe os pacientes cadastrados
            na plataforma.
          </p>

        </header>


        {/* =========================
            ÁREA DE BUSCA
        ========================= */}

        <section className={styles.listaSection}>

          <div className={styles.listaHeader}>

            <div>
              <span className={styles.sectionEyebrow}>
                PACIENTES CADASTRADOS
              </span>

              <h2>
                Lista de pacientes
              </h2>
            </div>

            <div className={styles.totalBadge}>
              {totalRegistros} registros
            </div>

          </div>


          <div className={styles.filtroContainer}>

            <div className={styles.searchIcon}>
              🔎
            </div>

            <input
              type="text"
              placeholder="Buscar por nome, email ou codinome..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className={styles.filtroInput}
              aria-label="Buscar pacientes"
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
              CONTEÚDO
          ========================= */}

          {loading ? (

            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />

              <span>
                Carregando pacientes...
              </span>
            </div>

          ) : error ? (

            <div className={styles.errorState}>

              <strong>
                Não foi possível carregar os pacientes
              </strong>

              <span>
                {error}
              </span>

            </div>

          ) : (

            <>

              {pacientes.length === 0 ? (

                <div className={styles.emptyState}>

                  <div className={styles.emptyIcon}>
                    👤
                  </div>

                  <strong>
                    {buscaFinal
                      ? 'Nenhum paciente encontrado'
                      : 'Nenhum paciente cadastrado'}
                  </strong>

                  <span>
                    {buscaFinal
                      ? `Não encontramos pacientes para "${buscaFinal}".`
                      : 'Ainda não existem pacientes cadastrados na plataforma.'}
                  </span>

                </div>

              ) : (

                <div className={styles.tabelaWrapper}>

                  <table className={styles.tabelaPacientes}>

                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Codinome</th>
                        <th>Telefone</th>
                      </tr>
                    </thead>

                    <tbody>

                      {pacientes.map((p) => (

                        <tr key={p.id}>

                          <td data-label="ID">
                            <span className={styles.idPaciente}>
                              #{p.id}
                            </span>
                          </td>

                          <td data-label="Nome">

                            <div className={styles.nomePaciente}>

                              <div className={styles.avatarPaciente}>
                                {p.nome?.charAt(0)?.toUpperCase() || '?'}
                              </div>

                              <span>
                                {p.nome}
                              </span>

                            </div>

                          </td>

                          <td data-label="Email">
                            <span className={styles.emailPaciente}>
                              {p.email}
                            </span>
                          </td>

                          <td data-label="Codinome">

                            <span className={styles.codinomeTag}>
                              {p.codinome || '---'}
                            </span>

                          </td>

                          <td data-label="Telefone">
                            {p.telefone || '---'}
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
                        setPaginaAtual((prev) => prev - 1)
                      }
                      disabled={paginaAtual === 1}
                      className={styles.btnPaginacao}
                    >
                      ← Anterior
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setPaginaAtual((prev) => prev + 1)
                      }
                      disabled={paginaAtual === totalPaginas}
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

export default PacientesAdmin;