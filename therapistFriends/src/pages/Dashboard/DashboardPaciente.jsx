// src/pages/Dashboard/DashboardPaciente.jsx

import React, { useState, useEffect, useRef } from 'react';
import styles from './DashboardPaciente.module.css';

import MenuLateral from '../../Components/Menu/MenuLateral';
import ExibirRelatos from '../../Components/Relatos/RelatosComponente';
import RelatoForm from '../../Components/FormularioRelatos/FormularioRelatos';
import RegistroHumorInfo from '../../Components/Humor/RegistroHumorInfo';

import { useUser } from '../../contexts/UserContext';
import { useCards } from '../../contexts/CardsContext';

import api from '../../api/apiConfig';
import { toast } from 'react-toastify';

export default function DashboardPaciente() {
  const [showForm, setShowForm] = useState(false);
  const [recarregarRelatos, setRecarregarRelatos] = useState(0);

  const { usuario } = useUser();
  const { cardsAtuais } = useCards();

  // Tradução dos humores para o formato esperado pelo backend.
  const dic = {
    Triste: 'tristeza',
    Neutro: 'neutral',
    Feliz: 'felicidade',
    Ansioso: 'ansiedade',
  };

  const [periodo, setPeriodo] = useState('manha');

  /* =========================================================
     DEFINE PERÍODO DO DIA
  ========================================================= */

  useEffect(() => {
    const atualizarPeriodo = () => {
      const hora = new Date().getHours();

      if (hora >= 6 && hora < 12) {
        setPeriodo('manha');
      } else if (hora >= 12 && hora < 18) {
        setPeriodo('tarde');
      } else {
        setPeriodo('noite');
      }
    };

    atualizarPeriodo();

    const interval = setInterval(
      atualizarPeriodo,
      60000
    );

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     SOLICITA CARDS AUTOMATICAMENTE
  ========================================================= */

  useEffect(() => {
    const gerarCardsAutomatico = async () => {
      try {
        
        await api.get('/mood/cards');
      } catch (err) {
        // A geração dos cards é tratada pelo backend/socket.
      }
    };

    gerarCardsAutomatico();
  }, []);

  /* =========================================================
     REGISTRAR HUMOR
  ========================================================= */

  const registrarMood = async ({
    mood,
    intensidade,
  }) => {
    try {
      await api.post('/mood/registrar', {
        mood,
        intensidade,
      });

      toast.success( 'Humor registrado com sucesso!' );
    } catch (err) {
      if (err?.messages) {
        err.messages.forEach((msg) => { toast.warn(msg); });
      }

      console.error( 'Erro ao registrar mood:', err );
    }
  };

  /* =========================================================
     RESPIRAÇÃO GUIADA
  ========================================================= */

  const BreathingCircle = () => {
    const [isBreathing, setIsBreathing] =
      useState(false);

    return (
      <div className={styles.breathingCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardEyebrow}>
            Pausa rápida
          </span>

          <h3>
            Respiração guiada
          </h3>

          <p>
            Reserve alguns segundos para desacelerar.
          </p>
        </div>

        <div className={`${styles.breathingContainer} ${ isBreathing ? styles.breathingActive : '' }`} >
          <div className={styles.circleOuter} />

          <div className={styles.circleInner} />

          <span className={styles.breathingText} >
            {isBreathing ? 'Inspira... Expira...' : 'Começar'}
          </span>
        </div>

        <button
          type="button"
          className={styles.btnBreathing}
          onClick={() => setIsBreathing( (prev) => !prev ) }
        >
          {isBreathing ? 'Parar' : 'Respirar'}
        </button>
      </div>
    );
  };

  /* =========================================================
     CHECK-IN DE HUMOR
  ========================================================= */

  const MoodTracker = ({ onSalvar }) => {
    const [moodSelecionado, setMoodSelecionado] =
      useState(null);

    const [intensidade, setIntensidade] =
      useState(null);

    const [mostrarInfo, setMostrarInfo] =
      useState(false);

    const moodCardRef = useRef(null);

    const moods = [
      {
        label: 'Triste',
        emoji: '😢',
      },
      {
        label: 'Neutro',
        emoji: '😐',
      },
      {
        label: 'Feliz',
        emoji: '😊',
      },
      {
        label: 'Ansioso',
        emoji: '🔥',
      },
    ];

    const escala = [
      1,
      2,
      3,
      4,
      5,
    ];

    /*
     * Fecha a seleção de intensidade quando
     * o usuário clica fora do card.
     */
    useEffect(() => {
      const handleClickOutside = (event) => {
        if ( moodCardRef.current && !moodCardRef.current.contains( event.target ) ) {
          setMoodSelecionado(null);
          setIntensidade(null);
        }
      };

      document.addEventListener( 'mousedown', handleClickOutside );

      return () => {
        document.removeEventListener( 'mousedown', handleClickOutside );
      };
    }, []);

    const handleSalvar = () => {
      if ( !moodSelecionado || !intensidade ) {
        return;
      }

      onSalvar({ mood: dic[moodSelecionado], intensidade });

      setMoodSelecionado(null);
      setIntensidade(null);
    };

    return (
      <div
        ref={moodCardRef}
        className={`${styles.moodCard} ${ moodSelecionado ? styles.moodCardExpanded : '' }`}
      >
        {/* =================================================
            CABEÇALHO DO CHECK-IN
        ================================================= */}

        <div className={styles.cardHeader}>
          <div className={styles.moodTitleRow}>
            <div>
              <span
                className={ styles.cardEyebrow } >
                Check-in
              </span>

              <h3>
                Como você está agora?
              </h3>
            </div>

            <button
              type="button"
              className={ styles.moodInfoButton }
              onClick={() => setMostrarInfo(true) }
              aria-label="Saiba mais sobre o registro de humor"
              title="Sobre o registro de humor"
            >
              <span>i</span>
            </button>
          </div>

          <p>
            Registre como você está se sentindo neste momento.
          </p>
        </div>

        {/* =================================================
            HUMORES
        ================================================= */}

        <div className={styles.moodOptions}>
          {moods.map((m) => {
            const isActive = moodSelecionado === m.label;

            return (
              <button
                key={m.label}
                type="button"
                className={`${styles.moodBtn} ${
                  isActive
                    ? styles.moodBtnActive
                    : ''
                }`}
                onClick={() => {
                  setMoodSelecionado( m.label );

                  setIntensidade(null);
                }}
                aria-pressed={isActive} >
                <span className={styles.emoji} >
                  {m.emoji}
                </span>

                <span className={styles.label} >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* =================================================
            INTENSIDADE
        ================================================= */}

        {moodSelecionado && (
          <div className={ styles.intensidadeBox } >
            <p>
              Qual a intensidade?
            </p>

            <div className={ styles.intensidadeOpcoes } >
              {escala.map(
                (valor) => {
                  const isActive = intensidade === valor;

                  return (
                    <button
                      key={valor}
                      type="button"
                      className={`${styles.intensidadeBtn} ${
                        isActive
                          ? styles.intensidadeBtnActive
                          : ''
                      }`}
                      onClick={() => setIntensidade( valor ) }
                      aria-label={`Intensidade ${valor} de 5`}
                      aria-pressed={ isActive }
                    >
                      {valor}
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              className={ styles.salvarMood }
              onClick={handleSalvar}
              disabled={!intensidade}
            >
              Registrar
            </button>
          </div>
        )}

        {/* =================================================
            MODAL INFORMATIVO
        ================================================= */}

        <RegistroHumorInfo
          aberto={mostrarInfo}
          onFechar={() => setMostrarInfo(false) }
        />
      </div>
    );
  };

  /* =========================================================
     SUBMIT DO RELATO
  ========================================================= */

  const handleSubmit = () => {
    setRecarregarRelatos( (prev) => prev + 1 );

    setShowForm(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className={`${styles.appPaciente} ${ styles[periodo] }`} >

      <MenuLateral />

      {showForm && (
        <RelatoForm
          onCancel={() => setShowForm(false) }
          onSubmit={handleSubmit}
        />
      )}

      <main className={ styles.mainContent } >

        <div className={ styles.dashboardContainer } >
          {/* =================================================
              CABEÇALHO
          ================================================= */}

          <div className={ styles.contentHeader } >

            <div className={ styles.welcomeSection } >

              <span className={ styles.welcomeEyebrow } >
                Seu espaço
              </span>

              <h1>
                Bem-vindo,{' '}
                {usuario?.perfil ?.codinome || 'Paciente'}
              </h1>

              <p>
                Que bom ter você por aqui.
              </p>
            </div>

            <button
              type="button"
              className={ styles.createPostButton }
              onClick={() => setShowForm(true) }
            >
              <span className={ styles.createPostIcon } >
                +
              </span>

              Criar Desabafo
            </button>
          </div>

          {/* =================================================
              GRID PRINCIPAL
          ================================================= */}

          <div className={ styles.dashboardGrid } >
            
            {/* ===============================================
                COLUNA PRINCIPAL
            =============================================== */}

            <div className={ styles.mainColumn } >
              <div
                className={ styles.sectionTitle } >
                <span className={ styles.sectionEyebrow } >
                  Comunidade
                </span>

                <h2>
                  Relatos recentes
                </h2>
              </div>

              <ExibirRelatos
                numRelatos={3}
                recarregar={recarregarRelatos }
              />

              {/* =============================================
                  CARDS EMOCIONAIS
              ============================================= */}

              <div
                className={ styles.sectionHeading } >
                <div>
                  <span className={ styles.sectionEyebrow } >
                    Seu espaço
                  </span>

                  <h2>
                    Para você
                  </h2>
                </div>
              </div>

              <div className={ styles.infoCardsContainer } >

                {!cardsAtuais ? (
                  [1, 2, 3].map(
                    (n) => (
                      <div key={n} className={`${styles.infoCard} ${styles.skeletonCard}`} >
                        <div className={ styles.skeletonTitle } />

                        <div className={ styles.skeletonText } />

                        <div className={`${styles.skeletonText} ${styles.skeletonTextShort}`} />
                      </div>
                    )
                  )
                ) : (
                  cardsAtuais.cards?.map(
                    (
                      card,
                      index
                    ) => (
                      <div
                        key={index}
                        className={`${styles.infoCard} ${ styles[ `infoCard${card.titulo}`] || '' }`}
                      >
                        <h3>
                          {card.titulo}
                        </h3>

                        <p>
                          { card.descricao }
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* ===============================================
                COLUNA DIREITA
            =============================================== */}

            <div className={ styles.rightColumn } >
              <MoodTracker onSalvar={registrarMood } />

              <BreathingCircle />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}