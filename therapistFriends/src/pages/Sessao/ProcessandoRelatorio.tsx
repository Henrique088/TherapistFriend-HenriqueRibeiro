// src/pages/Sessao/ProcessandoRelatorio.tsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader, Clock, Info, CheckCircle2, } from 'lucide-react';

import styles from './PosSessao.module.css';

interface RelatorioLocationState {
    elegivelParaRelatorio?: boolean;
}

export const ProcessandoRelatorio = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as RelatorioLocationState | null;

    const elegivelParaRelatorio = state?.elegivelParaRelatorio ?? false;

    const [segundos, setSegundos] = useState(10);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setSegundos((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    navigate('/dashboard');
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [navigate]);

    /*
     * =====================================================
     * SESSÃO NÃO ELEGÍVEL PARA RELATÓRIO
     * =====================================================
     */

    if (!elegivelParaRelatorio) {
        return (
            <div className={styles.posSessaoContainer}>
                <div className={styles.cardStatus}>
                    <div className={styles.statusIconContainer}>
                        <CheckCircle2 className={styles.statusIcon} />
                    </div>

                    <div className={styles.statusContent}>
                        <span className={styles.statusEyebrow}>
                            Sessão encerrada
                        </span>

                        <h1 className={styles.statusTitle}>
                            Relatório não será gerado
                        </h1>

                        <p className={styles.statusDescription}>
                            A sessão foi encerrada antes do tempo mínimo necessário para a geração do relatório emocional.
                        </p>

                        <p className={styles.statusSecondary}>
                            Por esse motivo, a inteligência artificial não realizará a análise
                            desta sessão e nenhum relatório será disponibilizado para este atendimento.
                        </p>
                    </div>

                    <div className={styles.statusInfo}>
                        <Info size={17} />

                        <span>
                            Sessões muito curtas podem não fornecer dados suficientes para uma análise adequada.
                        </span>
                    </div>

                    <div className={styles.timerBadge}>
                        <Clock size={16} />

                        <span>
                            Redirecionando em {segundos}s...
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => navigate('/dashboard') }
                    >
                        Ir para o Dashboard
                    </button>
                </div>
            </div>
        );
    }

    /*
     * =====================================================
     * SESSÃO ELEGÍVEL PARA RELATÓRIO
     * =====================================================
     */

    return (
        <div className={styles.posSessaoContainer}>
            <div className={styles.cardStatus}>
                <div className={styles.spinnerContainer}>
                    <Loader className={styles.spinIcon} />
                </div>

                <div className={styles.statusContent}>
                    <span className={styles.statusEyebrow}>
                        Sessão encerrada
                    </span>

                    <h1 className={styles.statusTitle}>
                        Processando relatório
                    </h1>

                    <p className={styles.statusDescription}>
                        A inteligência artificial está analisando os dados emocionais registrados durante a sessão.
                    </p>

                    <p className={styles.statusSecondary}>
                        O relatório completo estará disponível na sua listagem assim que o processamento for concluído.
                    </p>
                </div>

                <div className={styles.timerBadge}>
                    <Clock size={16} />

                    <span>
                        Redirecionando em {segundos}s...
                    </span>
                </div>

                <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => navigate('/dashboard') }
                >
                    Ir para o Dashboard agora
                </button>
            </div>
        </div>
    );
};