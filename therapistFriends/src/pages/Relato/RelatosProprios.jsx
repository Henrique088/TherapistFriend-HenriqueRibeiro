// src/pages/Relato/index.jsx

import React, { useState } from 'react';
import styles from './Relatos.module.css';

import MenuLateral from '../../Components/Menu/MenuLateral';
import ExibirRelatos from '../../Components/Relatos/RelatosComponente';
import RelatoForm from '../../Components/FormularioRelatos/FormularioRelatos';

import { useUser } from '../../contexts/UserContext';

import { MdOutlineQuestionMark } from 'react-icons/md';
import { PiWarningDuotone } from 'react-icons/pi';
import { TbTargetArrow } from 'react-icons/tb';
import { FaLightbulb } from 'react-icons/fa';
import { RiCloseFill } from 'react-icons/ri';

import { useSocketStabilityTest } from '../../hooks/useSocketStabilityTest';


const Relatos = () => {

  /*
   * Controle do formulário
   */
  const [showForm, setShowForm] = useState(false);
  const [relatoEditando, setRelatoEditando] = useState(null);


  /*
   * Controle da atualização dos relatos
   */
  const [recarregarRelatos, setRecarregarRelatos] = useState(0);


  /*
   * Controle do modal de informações
   */
  const [showModalInfo, setShowModalInfo] = useState(false);


  /*
   * Dados dos relatos
   *
   * Os relatos são carregados pelo ExibirRelatos
   * e enviados para este componente através de
   * onRelatosCarregados.
   */
  const [relatos, setRelatos] = useState([]);


  /*
   * Paginação
   */
  const [page, setPage] = useState(1);

  const [paginasTotais, setPaginasTotais] = useState(1);

  const limit = 10;


  /*
   * Usuário autenticado
   */
  const { usuario } = useUser();


  /*
   * Monitoramento do socket
   */
  useSocketStabilityTest('Relatos');


  /*
   * Tags selecionadas
   */
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);


  /*
   * Tags disponíveis
   */
  let tagsDisponiveis = [
    'Ansiedade',
    'Depressão',
    'Estresse',
    'Felicidade',
    'Tristeza',
    'Raiva',
    'Medo',
    'Solidão',
    'Esperança',
    'Culpa',
    'Vergonha',
    'Alívio',
    'Gratidão',
    'Frustração',
    'Confiança',
    'Insegurança',
    'Sofrimento'
  ];


  /*
   * Tags exclusivas do profissional
   */
  if (usuario?.tipo_usuario === 'profissional') {
    tagsDisponiveis.push(
      'Disponivéis',
      'Grave',
      'Mediano',
      'Leve'
    );
  }


  /*
   * Selecionar / remover tag
   */
  const handleTagClick = (tag) => {

    if (tagsSelecionadas.includes(tag)) {

      setTagsSelecionadas( tagsSelecionadas.filter( (t) => t !== tag ) );

    } else {

      setTagsSelecionadas([ ...tagsSelecionadas, tag ]);

    }

    /*
     * Sempre que o filtro mudar,
     * começa novamente na primeira página.
     */
    setPage(1);

    setRecarregarRelatos( (prev) => prev + 1 );
  };


  /*
   * Remover tag selecionada
   */
  const handleRemoveTag = (tagToRemove) => {

    setTagsSelecionadas(tagsSelecionadas.filter((tag) => tag !== tagToRemove));

    /*
     * Volta para a primeira página
     * após alterar o filtro.
     */
    setPage(1);

    setRecarregarRelatos((prev) => prev + 1);
  };


  /*
   * Cancelar formulário
   */
  const handleCancel = () => {

    setShowForm(false);
    setRelatoEditando(null);
  };


  /*
   * Envio do formulário
   */
  const handleSubmit = () => {

    setRecarregarRelatos((prev) => prev + 1);

    setShowForm(false);
    setRelatoEditando(null);

    /*
     * Após criar/editar um relato,
     * voltamos para a primeira página.
     */
    setPage(1);
  };


  /*
   * Criar novo relato
   */
  const createNewPost = () => {

    setShowForm(true);
    setRelatoEditando(null);
  };


  /*
   * Modal de informações
   */
  const toggleModalInfo = () => {

    setShowModalInfo( (prev) => !prev );
  };


  return (
    <div className={styles.appContainer}>

      <MenuLateral />


      <main className={styles.mainContent}>


        {/* =====================================================
            CABEÇALHO
        ====================================================== */}

        <div className={styles.pageHeader}>

          <div className={styles.pageTitleGroup}>

            <span className={styles.eyebrow}>
              Comunidade
            </span>

            <h1 className={styles.pageTitle}>
              Relatos Pessoais
            </h1>

            <p className={styles.pageDescription}>
              Veja os relatos que você compartilhou e acompanhe a evolução do seu bem-estar.

            </p>

          </div>


          {/* ===================================================
              AÇÕES DO PACIENTE
          ==================================================== */}

          {usuario?.tipo_usuario === 'paciente' ? (

            <button
              type="button"
              className={styles.createPostButton}
              onClick={createNewPost}
            >
              <span>+</span>

              Criar Desabafo
            </button>

          ) : (

            /* =================================================
               LEGENDA DA CLASSIFICAÇÃO DO PROFISSIONAL
            ================================================== */

            <div className={styles.classificationContainer}>

              <div className={styles.classificationLegend}>

                <div className={styles.legendItem}>

                  <span className={`${styles.indicativo} ${styles.leve}`} />

                  <span>
                    Leve
                  </span>

                </div>


                <div className={styles.legendItem}>

                  <span className={`${styles.indicativo} ${styles.mediano}`} />

                  <span>
                    Mediano
                  </span>

                </div>


                <div className={styles.legendItem}>

                  <span className={`${styles.indicativo} ${styles.grave}`} />

                  <span>
                    Grave
                  </span>

                </div>


                <div className={styles.legendItem}>

                  <span className={`${styles.indicativo} ${styles.indeterminado}`} />

                  <span>
                    Indeterminado
                  </span>

                </div>

              </div>


              <button
                type="button"
                className={styles.infoButton}
                onClick={toggleModalInfo}
                title="Informações sobre a classificação"
                aria-label="Informações sobre a classificação"
              >
                <MdOutlineQuestionMark />
              </button>

            </div>
          )}

        </div>



        {/* =====================================================
            MODAL DE INFORMAÇÕES
        ====================================================== */}

        {showModalInfo && (

          <div
            className={styles.modalOverlay}
            onClick={toggleModalInfo}
          >

            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >


              {/* HEADER DO MODAL */}

              <div className={styles.modalHeader}>

                <div>

                  <span className={styles.modalEyebrow}>
                    Classificação automática
                  </span>

                  <h2>
                    Sobre a classificação
                  </h2>

                </div>


                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={toggleModalInfo}
                  aria-label="Fechar"
                >
                  <RiCloseFill />
                </button>

              </div>



              {/* CORPO DO MODAL */}

              <div className={styles.modalBody}>

                <p className={styles.modalIntro}>

                  <strong>
                    Os níveis de gravidade são classificados
                    automaticamente por Inteligência Artificial
                  </strong>{' '}

                  com base na análise do conteúdo dos relatos.

                </p>



                {/* IMPORTANTE */}

                <div className={styles.infoSection}>

                  <h3>
                    <PiWarningDuotone />
                    Importante
                  </h3>

                  <ul>

                    <li>
                      Esta classificação é{' '}
                      <strong>
                        apenas uma ferramenta auxiliar
                      </strong>
                    </li>

                    <li>
                      Não substitui a avaliação profissional
                    </li>

                    <li>
                      Pode conter imprecisões
                    </li>

                    <li>
                      Serve como triagem inicial
                    </li>

                  </ul>

                </div>



                {/* OBJETIVO */}

                <div className={styles.infoSection}>

                  <h3>
                    <TbTargetArrow />
                    Objetivo
                  </h3>

                  <ul>

                    <li>
                      Agilizar a identificação de casos prioritários
                    </li>

                    <li>
                      Fornecer insights iniciais
                    </li>

                    <li>
                      Organizar visualmente os relatos
                    </li>

                  </ul>

                </div>



                {/* AVISO FINAL */}

                <div className={styles.infoImportant}>

                  <FaLightbulb />

                  <p>

                    <strong>
                      A avaliação final deve sempre ser realizada
                      por um profissional de saúde mental qualificado.
                    </strong>

                  </p>

                </div>

              </div>



              {/* FOOTER */}

              <div className={styles.modalFooter}>

                <button
                  type="button"
                  className={styles.modalOkButton}
                  onClick={toggleModalInfo}
                >
                  Entendi
                </button>

              </div>

            </div>

          </div>
        )}



        {/* =====================================================
            FILTROS
        ====================================================== */}

        <section className={styles.filtersSection}>


          {/* CABEÇALHO DOS FILTROS */}

          <div className={styles.filtersHeader}>

            <div>

              <h2>
                Filtrar relatos
              </h2>

              <p>
                Selecione uma ou mais categorias para personalizar sua visualização.
              </p>

            </div>


            {tagsSelecionadas.length > 0 && (

              <span className={styles.selectedCount}>

                {tagsSelecionadas.length}{' '}

                {tagsSelecionadas.length === 1
                  ? 'filtro ativo'
                  : 'filtros ativos'}

              </span>

            )}

          </div>



          {/* ===================================================
              TAGS SELECIONADAS
          ==================================================== */}

          <div className={styles.selectedTagsArea}>

            <span className={styles.tagsLabel}>
              Tags selecionadas
            </span>


            <div className={styles.tagsSelecionadas}>

              {tagsSelecionadas.length > 0 ? (

                tagsSelecionadas.map((tag) => (

                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleRemoveTag(tag) }
                    className={styles.tagSelecionada}
                  >

                    <span>
                      {tag}
                    </span>

                    <RiCloseFill />

                  </button>

                ))

              ) : (

                <span className={styles.noSelectedTags}>
                  Nenhuma tag selecionada
                </span>

              )}

            </div>

          </div>



          {/* ===================================================
              TAGS DISPONÍVEIS
          ==================================================== */}

          <div className={styles.availableTagsArea}>

            <span className={styles.tagsLabel}>
              Tags disponíveis
            </span>


            <div className={styles.tagsDisponiveis}>

              {tagsDisponiveis.map((tag) => {

                const selecionada = tagsSelecionadas.includes(tag);


                return (

                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`${styles.tagDisponivel} ${selecionada
                        ? styles.tagDisponivelActive
                        : ''
                      }`}
                    disabled={selecionada}
                  >
                    {tag}
                  </button>

                );

              })}

            </div>

          </div>

        </section>



        {/* =====================================================
            FORMULÁRIO DE RELATO
        ====================================================== */}

        {showForm && (

          <RelatoForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            relatoEditando={relatoEditando}
          />

        )}



        {/* =====================================================
            PAGINAÇÃO SUPERIOR
        ====================================================== */}

        {paginasTotais > 1 && (

          <div className={styles.pagination}>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))
              }
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
                {paginasTotais}
              </strong>

            </span>


            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, paginasTotais))}
              disabled={page >= paginasTotais}
            >
              Próxima
            </button>

          </div>

        )}



        {/* =====================================================
            RELATOS
        ====================================================== */}

        <section className={styles.feedSection}>

          <ExibirRelatos
            recarregar={recarregarRelatos}
            tagsSelecionadas={tagsSelecionadas}
            page={page}
            limit={limit}
            relatosPessoais={true}
            onRelatosCarregados={setRelatos}
            onPaginasTotais={setPaginasTotais}
          />

        </section>



        {/* =====================================================
            PAGINAÇÃO INFERIOR
        ====================================================== */}

        {paginasTotais > 1 && (

          <div
            className={`${styles.pagination} ${styles.paginationInferior}`}
          >

            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))
              }
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
                {paginasTotais}
              </strong>

            </span>


            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, paginasTotais)) }
              disabled={page >= paginasTotais}
            >
              Próxima
            </button>

          </div>

        )}

      </main>

    </div>
  );
};


export default Relatos;