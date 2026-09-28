// src/pages/admin/DashboardAdmin.jsx

import React, { useEffect, useState } from 'react';
import MenuLateralAdmin from '../../Components/Menu/MenuLateralAdmin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import styles from './Admin.module.css';

import { FaUsers } from 'react-icons/fa';
import { FaHandHoldingMedical } from 'react-icons/fa';
import { GiMedicalDrip } from 'react-icons/gi';
import { BsCalendarCheck } from 'react-icons/bs';
import { TfiWrite } from 'react-icons/tfi';

import api from '../../api/apiConfig';

function DashboardAdmin() {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setEstatisticas(response.data);
      } catch (error) {
        setError('Não foi possível carregar as estatísticas.');
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <MenuLateralAdmin />

        <main className={styles.adminConteudo}>
          <div className={styles.pageHeader}>
            <span className={styles.eyebrow}>PAINEL ADMINISTRATIVO</span>
            <h1>Dashboard</h1>
            <p>
              Acompanhe os principais indicadores da plataforma.
            </p>
          </div>

          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <span>Carregando estatísticas...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminContainer}>
        <MenuLateralAdmin />

        <main className={styles.adminConteudo}>
          <div className={styles.pageHeader}>
            <span className={styles.eyebrow}>PAINEL ADMINISTRATIVO</span>
            <h1>Dashboard</h1>
            <p>
              Acompanhe os principais indicadores da plataforma.
            </p>
          </div>

          <div className={styles.errorState}>
            <strong>Não foi possível carregar os dados</strong>
            <span>{error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <MenuLateralAdmin />

      <main className={styles.adminConteudo}>

        {/* =========================
            CABEÇALHO
        ========================= */}

        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>
            PAINEL ADMINISTRATIVO
          </span>

          <h1>Dashboard</h1>

          <p>
            Acompanhe os principais indicadores e movimentações
            do TherapistFriend.
          </p>
        </header>


        {/* =========================
            CARDS DE RESUMO
        ========================= */}

        <section className={styles.cards}>

          <div className={`${styles.card} ${styles.cardUsuarios}`}>
            <div className={styles.cardIcon}>
              <FaUsers />
            </div>

            <div className={styles.cardInfo}>
              <span className={styles.cardLabel}>
                Usuários
              </span>

              <strong>
                {estatisticas?.totalUsuarios || 0}
              </strong>

              <small>
                cadastrados na plataforma
              </small>
            </div>
          </div>


          <div className={`${styles.card} ${styles.cardProfissionais}`}>
            <div className={styles.cardIcon}>
              <FaHandHoldingMedical />
            </div>

            <div className={styles.cardInfo}>
              <span className={styles.cardLabel}>
                Profissionais
              </span>

              <strong>
                {estatisticas?.totalProfissionais || 0}
              </strong>

              <small>
                profissionais cadastrados
              </small>
            </div>
          </div>


          <div className={`${styles.card} ${styles.cardPacientes}`}>
            <div className={styles.cardIcon}>
              <GiMedicalDrip />
            </div>

            <div className={styles.cardInfo}>
              <span className={styles.cardLabel}>
                Pacientes
              </span>

              <strong>
                {estatisticas?.totalPacientes || 0}
              </strong>

              <small>
                pacientes cadastrados
              </small>
            </div>
          </div>


          <div className={`${styles.card} ${styles.cardAgendamentos}`}>
            <div className={styles.cardIcon}>
              <BsCalendarCheck />
            </div>

            <div className={styles.cardInfo}>
              <span className={styles.cardLabel}>
                Agendamentos
              </span>

              <strong>
                {estatisticas?.totalAgendamentos || 0}
              </strong>

              <small>
                agendamentos realizados
              </small>
            </div>
          </div>


          <div className={`${styles.card} ${styles.cardRelatos}`}>
            <div className={styles.cardIcon}>
              <TfiWrite />
            </div>

            <div className={styles.cardInfo}>
              <span className={styles.cardLabel}>
                Relatos
              </span>

              <strong>
                {estatisticas?.totalRelatos || 0}
              </strong>

              <small>
                relatos registrados
              </small>
            </div>
          </div>

        </section>


        {/* =========================
            GRÁFICO
        ========================= */}

        <section className={styles.grafico}>

          <div className={styles.graficoHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                MOVIMENTAÇÃO
              </span>

              <h2>
                Agendamentos por mês
              </h2>

              <p>
                Visualização dos agendamentos registrados ao longo
                dos meses.
              </p>
            </div>

            <div className={styles.chartIcon}>
              <BsCalendarCheck />
            </div>
          </div>


          <div className={styles.chartWrapper}>

            {estatisticas?.agendamentosPorMes?.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={estatisticas.agendamentosPorMes}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -10,
                    bottom: 0
                  }}
                  barCategoryGap="25%"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(79, 127, 120, 0.12)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#6c7b78',
                      fontSize: 12
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{
                      fill: '#6c7b78',
                      fontSize: 12
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: 'rgba(79, 127, 120, 0.06)'
                    }}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e1e8e5',
                      borderRadius: '12px',
                      boxShadow:
                        '0 8px 24px rgba(36, 51, 49, 0.10)',
                      fontSize: '0.85rem'
                    }}
                  />

                  <Bar
                    dataKey="total"
                    fill="#4f7f78"
                    radius={[8, 8, 2, 2]}
                    maxBarSize={48}
                  />

                </BarChart>
              </ResponsiveContainer>

            ) : (

              <div className={styles.emptyChart}>
                <div className={styles.emptyChartIcon}>
                  <BsCalendarCheck />
                </div>

                <strong>
                  Nenhum agendamento encontrado
                </strong>

                <span>
                  Ainda não há dados de agendamentos
                  disponíveis para exibição.
                </span>
              </div>

            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default DashboardAdmin;