import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import styles from './Relatos.module.css';

import { FcLikePlaceholder, FcLike } from 'react-icons/fc';
import { MdEdit, MdDelete, MdPersonOutline, MdSend } from 'react-icons/md';

import { formatarData } from '../../Utils/index';
import { darLikeNoRelato } from '../../Utils/likeUtils';
import { useUser } from '../../contexts/UserContext';
import RelatoForm from '../../Components/FormularioRelatos/FormularioRelatos';
import api from '../../api/apiConfig';

const TAGS_VAZIAS = [];

export default function ExibirRelatos({
  numRelatos,
  relatosPessoais,
  recarregar,
  tagsSelecionadas = TAGS_VAZIAS,
  page = 1,
  limit = 9,
  onRelatosCarregados,
  onPaginasTotais
}) {
  const [relatos, setRelatos] = useState([]);
  const [relatoEditando, setRelatoEditando] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingLikeId, setLoadingLikeId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { usuario } = useUser();

  /*
   * ============================================================
   * CARREGAR RELATOS
   * ============================================================
   */
  const carregarRelatos = async () => {
    
    setLoading(true);

    try {
      let response;

      /*
       * Paciente
       */
      if (usuario?.tipo_usuario === 'paciente') {
        response = await api.get('/relato/pacientes', {
          params: {
            page,
            limit,
            busca: tagsSelecionadas
          }
        });
      }

      /*
       * Profissional
       */
      else if (usuario?.tipo_usuario === 'profissional') {
        response = await api.get('/relato/disponiveis', {
          params: {
            page,
            limit,
            busca: tagsSelecionadas
          }
        });
      }

      /*
       * Caso o tipo de usuário ainda não esteja disponível,
       * não há nada para processar.
       */
      if (!response) {
        setRelatos([]);
        onRelatosCarregados?.([]);
        onPaginasTotais?.(1);
        return;
      }

      /*
       * Dados dos relatos
       */
      const dados = Array.isArray(response.data.dados)
        ? response.data.dados
        : [];

      /*
       * Quantidade total de páginas retornada pelo backend.
       */
      const paginasTotais =
        response.data.paginasTotais || 1;

      /*
       * Atualiza o estado interno.
       */
      setRelatos(dados);

      /*
       * Envia os dados para o componente pai,
       * caso os callbacks tenham sido fornecidos.
       *
       * Isso permite que a página Relatos controle
       * a paginação sem obrigar o Dashboard a fazer isso.
       */
      onRelatosCarregados?.(dados);
      onPaginasTotais?.(paginasTotais);

    } catch (error) {
      console.error( 'Erro ao carregar relatos:', error );

      setRelatos([]);

      onRelatosCarregados?.([]);
      onPaginasTotais?.(1);

    } finally {
      setLoading(false);
    }
  };


  /*
   * ============================================================
   * ATUALIZAR RELATOS
   * ============================================================
   *
   * O componente recarrega quando:
   *
   * - recarregar muda
   * - a página muda
   * - o limite muda
   * - o tipo do usuário muda
   * - os filtros mudam
   */
  useEffect(() => {
    carregarRelatos();
  }, [
    recarregar,
    page,
    limit,
    usuario?.tipo_usuario,
    tagsSelecionadas
  ]);


  /*
   * ============================================================
   * FILTRAGEM DOS RELATOS
   * ============================================================
   */
  const relatosFiltrados = useMemo(() => {
    const usuarioId = usuario?.id;
    const usuarioTipo = usuario?.tipo_usuario;

    let relatosParaExibir = [...relatos];


    /*
     * ----------------------------------------------------------
     * Relatos pessoais
     * ----------------------------------------------------------
     */
    if (relatosPessoais && usuarioId) {
      relatosParaExibir =
        relatosParaExibir.filter(
          relato =>
            relato.paciente_id === usuarioId
        );
    }


    /*
     * ----------------------------------------------------------
     * Limitação da quantidade
     * ----------------------------------------------------------
     *
     * Usado principalmente pelo Dashboard.
     *
     * Exemplo:
     *
     * numRelatos={3}
     *
     * Mesmo que a API retorne até 10 relatos,
     * somente os 3 primeiros serão exibidos.
     */
    if (numRelatos && !relatosPessoais) {
      relatosParaExibir = relatosParaExibir
        .filter(relato =>
          usuarioId
            ? relato.paciente_id !== usuarioId
            : true
        )
        .slice(0, numRelatos);
    }


    /*
     * ----------------------------------------------------------
     * Filtragem por tags
     * ----------------------------------------------------------
     */
    if (tagsSelecionadas.length > 0) {

      /*
       * Filtro específico para profissionais:
       *
       * "Disponivéis" = relatos que ainda não
       * possuem profissional vinculado.
       */
      if (
        tagsSelecionadas.includes('Disponivéis') &&
        usuarioTipo === 'profissional'
      ) {
        relatosParaExibir =
          relatosParaExibir.filter(
            relato => !relato.profissionalId
          );
      }


      /*
       * Remove a tag especial para trabalhar
       * somente com as demais categorias/termos.
       */
      const outrasTags =
        tagsSelecionadas.filter(
          tag => tag !== 'Disponivéis'
        );


      /*
       * Busca pelas demais tags.
       */
      if (outrasTags.length > 0) {
        relatosParaExibir =
          relatosParaExibir.filter(relato => {

            return outrasTags.some(tag => {
              const tagLowerCase =
                tag.toLowerCase();

              return (
                relato.categoria
                  ?.toLowerCase()
                  .includes(tagLowerCase) ||

                relato.titulo
                  ?.toLowerCase()
                  .includes(tagLowerCase) ||

                relato.texto
                  ?.toLowerCase()
                  .includes(tagLowerCase) ||

                (
                  relato.resultado_ia &&
                  relato.resultado_ia
                    .toLowerCase()
                    .includes(tagLowerCase)
                ) ||

                (
                  relato.codinomePaciente &&
                  relato.codinomePaciente
                    .toLowerCase()
                    .includes(tagLowerCase)
                )
              );
            });

          });
      }
    }


    return relatosParaExibir;

  }, [
    relatos,
    tagsSelecionadas,
    relatosPessoais,
    numRelatos,
    usuario?.id,
    usuario?.tipo_usuario
  ]);


  /*
   * ============================================================
   * LIKE
   * ============================================================
   */
  const darLike = async (relato_id) => {

    if (!usuario?.id) {
      toast.info( 'Você precisa estar logado para curtir um relato.' );

      return;
    }

    /*
     * Impede múltiplos cliques enquanto a requisição
     * daquele relato ainda estiver sendo processada.
     */
    if (loadingLikeId === relato_id) {
      return;
    }

    setLoadingLikeId(relato_id);

    try {
      const resultado =
        await darLikeNoRelato(relato_id);

      if (resultado.sucesso) {

        setRelatos(prevRelatos =>
          prevRelatos.map(relato =>
            relato.id === relato_id
              ? {
                  ...relato,
                  quantidadeLikes:
                    relato.quantidadeLikes +
                    resultado.quantidadeLikes,
                  jaCurtiu:
                    resultado.liked
                }
              : relato
          )
        );

      } else {
        console.error( 'Erro ao curtir:', resultado.erro );
      }

    } catch (error) {
      console.error( 'Erro ao curtir relato:', error );

    } finally {
      setLoadingLikeId(null);
    }
  };


  /*
   * ============================================================
   * EDITAR RELATO
   * ============================================================
   */
  const editarRelato = (relato) => {
    setRelatoEditando(relato);
    setShowForm(true);
  };


  /*
   * ============================================================
   * EXCLUIR RELATO
   * ============================================================
   */
  const deletarRelato = async (relatoId) => {

    try {
      await api.delete( `/relato/${relatoId}` );

      setRelatos(prev => prev.filter( relato => relato.id !== relatoId ) );

      toast.success( 'Relato excluído com sucesso!' );

    } catch (error) {

      const errorMessage = error.response?.data?.erro || 'Erro ao deletar relato';

      console.error( 'Erro ao deletar relato:', error );

      toast.error(errorMessage);
    }
  };


  /*
   * ============================================================
   * CONFIRMAÇÃO DE EXCLUSÃO
   * ============================================================
   */
  const deletarRelatoComConfirmacao = (relatoId) => {

    toast.info(
      ({ closeToast }) => (
        <div className={styles.confirmToast}>

          <p>
            <strong>
              Deseja realmente excluir este relato?
            </strong>
          </p>

          <div className={styles.confirmActions}>

            <button
              className={styles.confirmDelete}
              onClick={() => {
                deletarRelato(relatoId);
                closeToast();
              }}
            >
              Sim
            </button>

            <button
              className={styles.confirmCancel}
              onClick={closeToast}
            >
              Cancelar
            </button>

          </div>

        </div>
      ),
      {
        autoClose: false
      }
    );
  };


  /*
   * ============================================================
   * CANCELAR EDIÇÃO
   * ============================================================
   */
  const handleCancel = () => {
    setShowForm(false);
    setRelatoEditando(null);
  };


  /*
   * ============================================================
   * SALVAR EDIÇÃO
   * ============================================================
   */
  const handleSubmit = (formData) => {

    setRelatos(prev =>
      prev.map(relato =>
        relato.id === formData.id
          ? {
              ...relato,
              ...formData
            }
          : relato
      )
    );

    setShowForm(false);
    setRelatoEditando(null);
  };


  /*
   * ============================================================
   * PROFISSIONAL ASSUME O RELATO
   * ============================================================
   */
  const entrarEmContato = async (relato) => {

    /*
     * Somente profissionais podem entrar em contato.
     */
    if (
      usuario?.tipo_usuario !== 'profissional'
    ) {
      toast.info( 'Apenas profissionais podem entrar em contato com relatos de pacientes.' );

      return;
    }


    /*
     * Verifica se o relato já possui profissional.
     */
    if (relato.profissionalId) {
      toast.info( 'Este relato já está vinculado a um profissional.' );

      return;
    }


    try {

      await api.patch(
        `/relato/${relato.id}/assumir`
      );


      /*
       * Atualiza o relato localmente para que
       * o botão desapareça imediatamente.
       */
      setRelatos(prevRelatos =>
        prevRelatos.map(item =>
          item.id === relato.id
            ? {
                ...item,
                profissionalId: usuario.id
              }
            : item
        )
      );


      toast.success( 'Solicitação de conversa enviada com sucesso!' );

    } catch (error) {

      const errorMessage =
        error.response?.data?.erro ||
        'Erro ao solicitar conversa';

      toast.error(errorMessage);

      console.error( 'Erro ao solicitar conversa:', error );
    }
  };


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <div className={styles.postsContainer}>

        {[1, 2, 3].map(item => (
          <div
            key={item}
            className={styles.skeletonCard}
          >

            <div className={styles.skeletonHeader}>

              <div
                className={styles.skeletonAvatar}
              />

              <div
                className={styles.skeletonLines}
              >
                <span />
                <span />
              </div>

            </div>

            <div
              className={styles.skeletonTitle}
            />

            <div
              className={styles.skeletonText}
            />

            <div
              className={styles.skeletonTextShort}
            />

            <div
              className={styles.skeletonFooter}
            />

          </div>
        ))}

      </div>
    );
  }


  /*
   * ============================================================
   * SEM RESULTADOS
   * ============================================================
   */
  if (relatosFiltrados.length === 0) {
    return (
      <div className={styles.noResults}>

        <div className={styles.noResultsIcon}>
          <MdPersonOutline size={25} />
        </div>

        <h3>
          Nenhum relato encontrado
        </h3>

        <p>
          {tagsSelecionadas.length > 0
            ? 'Não encontramos relatos correspondentes aos filtros selecionados.'
            : 'Ainda não há relatos disponíveis para exibição.'}
        </p>

      </div>
    );
  }


  /*
   * ============================================================
   * RENDERIZAÇÃO
   * ============================================================
   */
  return (
    <div className={styles.postsContainer}>

      {showForm && (
        <RelatoForm
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          relatoEditando={relatoEditando}
        />
      )}


      {relatosFiltrados.map(relato => {

        const nomePaciente =
          relato?.codinomePaciente ||
          'Paciente';


        const avatarText =
          nomePaciente
            .substring(0, 2)
            .toUpperCase();


        /*
         * Classe usada para indicar o resultado
         * da análise emocional para o profissional.
         */
        const intensidadeClass =
          relato.resultado_ia
            ? styles[
                relato.resultado_ia.toLowerCase()
              ]
            : '';


        const isProfissional = usuario?.tipo_usuario === 'profissional';


        /*
         * O botão de contato só aparece para
         * profissionais em relatos ainda disponíveis.
         */
        const podeEntrarEmContato =
          relato.profissionalId === false &&
          isProfissional;


        /*
         * Verifica se o relato pertence ao
         * paciente atualmente logado.
         */
        const relatoDoUsuario =
          usuario?.id &&
          relato.paciente_id === usuario.id;


        return (
          <article
            key={relato.id}
            className={`${styles.postCard} ${intensidadeClass}`}
          >

            {/* ==================================================
                INDICADOR DE INTENSIDADE
            ================================================== */}

            {isProfissional &&
              relato.resultado_ia && (
                <div
                  className={styles.aiIndicator}
                >
                  <span>
                    Análise emocional
                  </span>

                  <strong>
                    {relato.resultado_ia}
                  </strong>
                </div>
              )}


            {/* ==================================================
                CABEÇALHO
            ================================================== */}

            <div className={styles.postHeader}>

              <div className={styles.userInfo}>

                <div className={styles.userAvatar}>
                  {avatarText}
                </div>

                <div>

                  <div
                    className={styles.username}
                  >
                    {nomePaciente}
                  </div>

                  <div
                    className={styles.postTime}
                  >
                    {formatarData(
                      relato?.data_envio
                    )}
                  </div>

                </div>

              </div>

            </div>


            {/* ==================================================
                META INFORMAÇÕES
            ================================================== */}

            <div className={styles.metaInfo}>

              <div className={styles.metaItem}>

                <span>
                  Título
                </span>

                <strong>
                  {relato?.titulo}
                </strong>

              </div>


              <div className={styles.metaItem}>

                <span>
                  Categoria
                </span>

                <strong>
                  {relato?.categoria}
                </strong>

              </div>

            </div>


            {/* ==================================================
                CONTEÚDO
            ================================================== */}

            <div className={styles.postContent}>
              {relato?.texto}
            </div>


            {/* ==================================================
                AÇÕES
            ================================================== */}

            <div className={styles.postActions}>

              <div className={styles.primaryActions}>

                {/* LIKE */}

                <button
                  className={`${styles.likeButton} ${
                    relato.jaCurtiu
                      ? styles.liked
                      : ''
                  }`}
                  onClick={() =>
                    darLike(relato.id)
                  }
                  disabled={
                    loadingLikeId === relato.id
                  }
                >

                  {loadingLikeId === relato.id ? (
                    <span>
                      ...
                    </span>
                  ) : (
                    <>
                      {relato.jaCurtiu ? (
                        <FcLike size={19} />
                      ) : (
                        <FcLikePlaceholder
                          size={19}
                        />
                      )}

                      <span>
                        {relato.quantidadeLikes || 0}
                      </span>
                    </>
                  )}

                </button>


                {/* ENTRAR EM CONTATO */}

                {podeEntrarEmContato && (
                  <button
                    className={
                      styles.contactButton
                    }
                    onClick={() =>
                      entrarEmContato(relato)
                    }
                  >

                    <MdSend size={18} />

                    <span>
                      Entrar em contato
                    </span>

                  </button>
                )}

              </div>


              {/* EDITAR / EXCLUIR */}

              {relatoDoUsuario && (
                <div
                  className={
                    styles.postActionsExtra
                  }
                >

                  <button
                    className={ styles.editButton }
                    onClick={() => editarRelato(relato) }
                  >

                    <MdEdit size={18} />

                    <span>
                      Editar
                    </span>

                  </button>


                  <button
                    className={ styles.deleteButton }
                    onClick={() =>
                      deletarRelatoComConfirmacao(
                        relato.id
                      )
                    }
                  >

                    <MdDelete size={18} />

                    <span>
                      Excluir
                    </span>

                  </button>

                </div>
              )}

            </div>

          </article>
        );
      })}

    </div>
  );
}