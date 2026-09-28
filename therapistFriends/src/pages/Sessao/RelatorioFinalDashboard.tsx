// src/pages/Sessao/RelatorioFinalDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/apiConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiBarChart2, FiCalendar, FiClock, FiFileText, FiShield, FiActivity, FiAlertCircle,FiCheckCircle } from 'react-icons/fi';

import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './RelatorioFinal.module.css';

interface TimelineData {
  timestamp: string;
  label: string;
  score: number;
}

interface Analise {
  emocao_predominante: string;
  confianca_media: number;
  timeline: TimelineData[];
  insights_ia: {
    nivel_ansiedade: 'baixo' | 'moderado' | 'alto';
    sugestao_abordagem: string;
    picos_emocionais: number;
  };
}

interface ReportData {
  sessaoId: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  analise: Analise;
  geradoEm: string;
}

export const RelatorioFinalDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/sessoes/${id}/obter-relatorio`);

        if (response.data.status === 'processing') {
          setTimeout(fetchReport, 3000);
          return;
        }

        console.log('Dados recebidos:', response.data);

        setReport(response.data);
        setComment(response.data.comentarioProfissional || '');
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleSaveComment = async () => {
    setSaving(true);

    try {
      await api.patch(`sessoes/relatorios/${id}/comentar`, { comment });

      toast.success('Observações clínicas salvas!');
    } catch (err) {
      // toast.error('Erro ao salvar comentário.');
    } finally {
      setSaving(false);
    }
  };

  const todosScoresZero =
    report?.analise?.timeline?.every((item) => item.score === 0) ?? true;

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);

    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.app}>
        <MenuLateral />

        <main className={styles.loadingContainer}>
          <div className={styles.loadingIcon}>
            <FiActivity />
          </div>

          <div className={styles.loadingSpinner} />

          <span className={styles.loadingEyebrow}>
            PROCESSAMENTO
          </span>

          <p className={styles.loadingText}>
            Sincronizando com o microserviço de IA...
          </p>

          <span className={styles.loadingSubtext}>
            Aguarde enquanto os dados da sessão são processados.
          </span>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.app}>
        <MenuLateral />

        <main className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <FiAlertCircle />
          </div>

          <span className={styles.eyebrow}>
            RELATÓRIO
          </span>

          <h1>Relatório não encontrado</h1>

          <p>
            Não foi possível localizar os dados desta sessão.
          </p>

          <Link to="/relatorio" className={styles.backButton}>
            <FiArrowLeft />
            Voltar aos relatórios
          </Link>
        </main>
      </div>
    );
  }

  const nivelAnsiedade = report.analise?.insights_ia?.nivel_ansiedade || 'N/A';

  return (
    <div className={styles.app}>
      <MenuLateral />

      <main className={styles.content}>
        <div className={styles.contentInner}>

          {/* HEADER */}
          <header className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.eyebrow}>
                ANÁLISE DA SESSÃO
              </span>

              <h1>Relatório Clínico</h1>

              <div className={styles.sessionMeta}>
                <span>
                  <FiFileText />
                  SESSION_{report.sessaoId?.split('-')[0]}
                </span>

                <span>
                  <FiCalendar />
                  {formatarData(report.dataInicio)}
                </span>

                <span>
                  <FiClock />
                  {formatarData(report.dataFim)}
                </span>
              </div>
            </div>

            <Link to="/relatorio" className={styles.backButton}>
              <FiArrowLeft />
              <span>Voltar</span>
            </Link>
          </header>

          {/* MÉTRICAS */}
          <section className={styles.metricsGrid}>

            <article className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <FiActivity />
              </div>

              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>
                  Emoção predominante
                </span>

                <strong className={`${styles.metricValue} ${styles.emotionValue}`}>
                  {report.analise?.emocao_predominante || 'N/A'}
                </strong>
              </div>
            </article>

            <article className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.anxietyIcon}`}>
                <FiActivity />
              </div>

              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>
                  Nível de ansiedade
                </span>

                <strong
                  className={`${styles.metricValue} ${
                    styles[`anxiety_${nivelAnsiedade}`]
                  }`}
                >
                  {nivelAnsiedade}
                </strong>
              </div>
            </article>

            <article className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.confidenceIcon}`}>
                <FiCheckCircle />
              </div>

              <div className={styles.metricContent}>
                <span className={styles.metricLabel}>
                  Confiança média
                </span>

                <strong className={styles.metricValue}>
                  {report.analise?.confianca_media || 0}%
                </strong>
              </div>
            </article>

          </section>

          {/* TIMELINE */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  MONITORAMENTO
                </span>

                <h2>Desenvolvimento emocional</h2>

                <p>
                  Variação dos indicadores emocionais identificados
                  durante a sessão.
                </p>
              </div>

              <div className={styles.chartBadge}>
                <FiActivity />
                <span>
                  {report.analise?.insights_ia?.picos_emocionais || 0}
                </span>
                <small>picos</small>
              </div>
            </div>

            {todosScoresZero ? (
              <div className={styles.chartEmpty}>
                <div className={styles.emptyIcon}>
                  <FiBarChart2 />
                </div>

                <h3>Nenhuma variação detectada</h3>

                <p>
                  Todos os marcadores permaneceram em estado neutro durante a sessão.
                </p>
              </div>
            ) : (
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.analise?.timeline || []} >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e1e8e5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="timestamp"
                      stroke="#9aa9a5"
                      fontSize={11}
                      tick={{ fill: '#6c7b78' }}
                    />

                    <YAxis
                      stroke="#9aa9a5"
                      fontSize={11}
                      tick={{ fill: '#6c7b78' }}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#243331',
                        border: '1px solid #315d57',
                        borderRadius: '12px',
                        color: '#ffffff'
                      }}
                      labelStyle={{
                        color: '#b8c4c1'
                      }}
                      formatter={(
                        value: number,
                        name: string,
                        props: any
                      ) => {
                        return [
                          `Score: ${value} - ${props.payload.label}`,
                          'Emoção'
                        ];
                      }}
                    />

                    <ReferenceLine
                      y={50}
                      stroke="#b8c4c1"
                      strokeDasharray="3 3"
                    />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4f7f78"
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;

                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill={
                              payload.score > 50
                                ? '#8f4d49'
                                : '#4f7f78'
                            }
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{
                        r: 8,
                        fill: '#315d57'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* IA */}
          <section className={styles.aiSection}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>
                <FiActivity />
              </div>

              <div>
                <span className={styles.sectionEyebrow}>
                  ANÁLISE COMPUTACIONAL
                </span>

                <h2>Sugestão de abordagem clínica</h2>
              </div>

              <span className={styles.aiBadge}>
                Gerado por IA
              </span>
            </div>

            <div className={styles.aiContent}>
              <p>
                {report.analise?.insights_ia?.sugestao_abordagem ||
                  'Análise em processamento'}
              </p>
            </div>

            <div className={styles.aiDisclaimer}>
              <FiShield />

              <span>
                Esta análise é um recurso de apoio e não substitui
                a avaliação profissional.
              </span>
            </div>
          </section>

          {/* OBSERVAÇÕES */}
          <section className={styles.commentSection}>
            <div className={styles.commentHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  REGISTRO PROFISSIONAL
                </span>

                <h2>Observações da sessão</h2>
              </div>

              <div className={styles.privateBadge}>
                <FiShield />
                Documento protegido
              </div>
            </div>

            <textarea
              className={styles.commentTextarea}
              placeholder="Registre suas conclusões sobre a sessão, observações comportamentais ou pontos importantes para o próximo encontro..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className={styles.commentFooter}>
              <span>
                As observações são armazenadas de forma privada.
              </span>

              <button
                onClick={handleSaveComment}
                disabled={saving}
                className={styles.saveButton}
              >
                <FiCheckCircle />

                {saving
                  ? 'Salvando...'
                  : 'Salvar observações'}
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};