// src/pages/Dashboard/DashboardProfissional.jsx

import React, { useState, useEffect, useRef } from 'react';
import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './DashboardProfissional.module.css';

import { FiBell, FiHeart, FiBookOpen, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { useUser } from '../../contexts/UserContext';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { AgendaService } from '../../api/agendaService';
import { useSocketStabilityTest } from '../../hooks/useSocketStabilityTest';
import { useNotifications } from '../../contexts/NotificationContext';


export default function DashboardProfissional() {
  const { usuario } = useUser();

  const [showNotifications, setShowNotifications] = useState(false);

  const [stats, setStats] = useState({
    resumo: {
      hoje: 0,
      semana: 0,
      mes: 0
    },
    grafico: [],
    geradoEm: null
  });

  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);

  const notificationsRef = useRef(null);
  const notificationButtonRef = useRef(null);

  const {
    unreadCount,
    hasNewNotification
  } = useNotifications();

  useSocketStabilityTest('DashboardProfissional');

  const mentalHealthTips = [
    'Reserve 10 minutos para respirar profundamente: reduz o estresse e melhora o foco.',
    'Manter uma rotina de sono regular ajuda na prevenção de crises de ansiedade.',
    'Praticar gratidão diariamente fortalece o bem-estar emocional.',
    'A escuta empática é tão importante quanto a fala no processo terapêutico.',
    'Atividade física regular pode reduzir sintomas de depressão em até 30%.',
  ];

  const mentalHealthFacts = [
    'A OMS estima que 1 em cada 4 pessoas será afetada por problemas de saúde mental em algum momento da vida.',
    'A terapia online mostrou eficácia semelhante à presencial em diversos estudos clínicos.',
    'O Brasil é o país com maior taxa de transtornos de ansiedade no mundo, segundo a OMS.',
    'Mindfulness e meditação podem reduzir níveis de cortisol, o hormônio do estresse.',
  ];

  // Fecha notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !notificationButtonRef.current?.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Busca dados do Dashboard
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      try {
        const response = await AgendaService.dashboard(usuario?.perfil?.id);
        setStats(response);
      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    if (usuario?.id) {
      fetchStats();
    }

    setTip( mentalHealthTips[ Math.floor(Math.random() * mentalHealthTips.length) ] );
  }, [usuario?.id]);

  // Dados do gráfico
  const chartData = {
    labels: stats.grafico.map((item) => item.mes),

    datasets: [
      {
        label: 'Consultas Totais no mês',
        data: stats.grafico.map((item) => item.total),
        backgroundColor: 'rgba(79, 127, 120, 0.65)',
        borderColor: '#4F7F78',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6C7B78',
          font: {
            family: 'Segoe UI'
          }
        }
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6C7B78'
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          stepSize: 1,
          color: '#6C7B78'
        },

        grid: {
          color: 'rgba(225, 232, 229, 0.7)'
        }
      }
    }
  };

  return (
    <div className={styles.app}>

      <MenuLateral />

      <main className={styles.mainContent}>

        <div className={styles.dashboardContainer}>

          {/* Cabeçalho */}
          <header className={styles.contentHeader}>

            <div className={styles.welcomeSection}>
              <span className={styles.welcomeEyebrow}>
                PAINEL PROFISSIONAL
              </span>

              <h1>
                Bem-vindo(a),{' '}
                {usuario?.nome || 'Profissional'}
              </h1>

              <p>
                Acompanhe sua rotina e seus atendimentos em um só lugar.
              </p>
            </div>

            <div className={styles.notificationWrapper}>

              <button
                className={`${styles.notificationButton} ${
                  hasNewNotification
                    ? styles.notificationActive
                    : ''
                }`}
                ref={notificationButtonRef}
                onClick={() => setShowNotifications(!showNotifications) }
                aria-label="Notificações"
              >
                <FiBell size={22} />

                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={styles.notificationsPanel}
                  ref={notificationsRef}
                >
                  <div className={styles.notificationHeader}>
                    <span>Notificações</span>
                    <FiBell size={17} />
                  </div>

                  <p>
                    {unreadCount === 0
                      ? 'Você não possui novas notificações.'
                      : `Você possui ${unreadCount} nova${
                          unreadCount > 1 ? 's' : ''
                        } notificação${
                          unreadCount > 1 ? 'ões' : ''
                        }.`
                    }
                  </p>
                </div>
              )}

            </div>

          </header>

          {/* Cards de resumo */}
          <section className={styles.statsGrid}>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiCalendar />
              </div>

              <div>
                <span>Consultas hoje</span>

                <strong>
                  {loading ? '...' : stats.resumo.hoje}
                </strong>

                <small>
                  atendimentos agendados
                </small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiCalendar />
              </div>

              <div>
                <span>Consultas na semana</span>

                <strong>
                  {loading ? '...' : stats.resumo.semana}
                </strong>

                <small>
                  atendimentos agendados
                </small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiTrendingUp />
              </div>

              <div>
                <span>Consultas no mês</span>

                <strong>
                  {loading ? '...' : stats.resumo.mes}
                </strong>

                <small>
                  total do período
                </small>
              </div>
            </div>

          </section>

          {/* Gráfico */}
          <section className={styles.chartSection}>

            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  DESEMPENHO
                </span>

                <h2>
                  Produtividade mensal
                </h2>

                <p>
                  Acompanhe a evolução dos seus atendimentos
                  nos últimos seis meses.
                </p>
              </div>
            </div>

            <div className={styles.chartWrapper}>

              {loading ? (
                <div className={styles.chartLoading}>
                  <div className={styles.loadingPulse}></div>
                  <p>Carregando gráfico...</p>
                </div>
              ) : stats.grafico.length > 0 ? (
                <Chart
                  type="bar"
                  data={chartData}
                  options={chartOptions}
                />
              ) : (
                <div className={styles.noData}>
                  <FiCalendar size={28} />

                  <p>
                    Nenhum agendamento disponível no período.
                  </p>
                </div>
              )}

            </div>

          </section>

          {/* Informações complementares */}
          <section className={styles.infoGrid}>

            {/* Dica */}
            <article className={styles.tipCard}>

              <div className={styles.cardIcon}>
                <FiHeart />
              </div>

              <div>
                <span className={styles.cardEyebrow}>
                  BEM-ESTAR
                </span>

                <h2>
                  Dica de Saúde Mental
                </h2>

                <p>
                  "{tip}"
                </p>
              </div>

            </article>

            {/* Curiosidades */}
            <article className={styles.factsCard}>

              <div className={styles.cardIcon}>
                <FiBookOpen />
              </div>

              <div>
                <span className={styles.cardEyebrow}>
                  CONHECIMENTO
                </span>

                <h2>
                  Curiosidades da Área
                </h2>

                <ul>
                  {mentalHealthFacts.map((fact, index) => (
                    <li key={index}>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>

            </article>

          </section>

          {/* Links úteis */}
          <section className={styles.resourcesSection}>

            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  REFERÊNCIAS
                </span>

                <h2>
                  Recursos e links
                </h2>

                <p>
                  Fontes úteis para acompanhar conteúdos relacionados à saúde mental.
                </p>
              </div>
            </div>

            <div className={styles.resourcesGrid}>

              <a
                href="https://www.who.int/mental_health/pt/"
                target="_blank"
                rel="noreferrer"
              >
                <strong>OMS</strong>
                <span>
                  Saúde Mental
                </span>
              </a>

              <a
                href="https://www.cfp.org.br/"
                target="_blank"
                rel="noreferrer"
              >
                <strong>CFP</strong>
                <span>
                  Conselho Federal de Psicologia
                </span>
              </a>

              <a
                href="https://www.scielo.org/"
                target="_blank"
                rel="noreferrer"
              >
                <strong>SciELO</strong>
                <span>
                  Artigos Científicos
                </span>
              </a>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}