// src/pages/Sessao/AvaliacaoPaciente.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, } from 'react-router-dom';

import { Heart, Smile, CheckCircle2, Info, } from 'lucide-react';

import api from '../../api/apiConfig';
import { toast } from 'react-toastify';

import styles from './PosSessao.module.css';

interface AvaliacaoLocationState {
    elegivelParaRelatorio?: boolean;
}

export const AvaliacaoPaciente = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as AvaliacaoLocationState | null;

    const elegivelParaRelatorio = state?.elegivelParaRelatorio ?? false;

    const [nota, setNota] = useState(0);
    const [hoverNota, setHoverNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleEnviarAvaliacao = async () => {
        if (!id || nota === 0) {
            return;
        }

        setEnviando(true);

        try {
            await api.post(`sessoes/${id}/avaliar`, {
                nota,
                comentario,
            });

            toast.success('Obrigado pela sua avaliação!');

            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);
        } catch (error: any) {
            // console.error( 'Erro ao enviar avaliação:', error );

            // toast.error( error?.response?.data?.message || 'Não foi possível enviar sua avaliação.' );
        } finally {
            setEnviando(false);
        }
    };

    const handleVoltarDashboard = () => {
        navigate('/dashboard');
    };

    /*
     * A sessão foi encerrada, mas não está elegível
     * para gerar/enviar uma avaliação.
     */
    if (!elegivelParaRelatorio) {
        return (
            <div className={styles.posSessaoContainer}>
                <div className={styles.cardStatus}>
                    <div className={styles.statusIconContainer}>
                        <CheckCircle2
                            className={styles.statusIcon}
                        />
                    </div>

                    <div className={styles.statusContent}>
                        <span className={styles.statusEyebrow}>
                            Sessão encerrada
                        </span>

                        <h1 className={styles.statusTitle}>
                            A sessão foi finalizada
                        </h1>

                        <p className={styles.statusDescription}>
                            Sua sessão foi encerrada e não há uma avaliação disponível para este atendimento.
                        </p>

                        <p className={styles.statusSecondary}>
                            Você pode voltar ao início e continuar utilizando a plataforma normalmente.
                        </p>
                    </div>

                    <div className={styles.statusInfo}>
                        <Info size={17} />

                        <span>
                            A avaliação só fica disponível quando o atendimento atende aos critérios definidos pela plataforma.
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleVoltarDashboard}
                    >
                        Voltar ao início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.posSessaoContainer}>
            <div className={styles.cardAvaliacao}>
                <div className={styles.avaliacaoHeader}>
                    <div className={styles.iconCircle}>
                        <Smile />
                    </div>

                    <span className={styles.avaliacaoEyebrow}>
                        Avaliação da sessão
                    </span>

                    <h1>
                        Como você se sentiu hoje?
                    </h1>

                    <p>
                        Sua avaliação ajuda a melhorar a experiência dos atendimentos na plataforma.
                    </p>
                </div>

                <div className={styles.coracoesContainer} aria-label="Avaliação de 1 a 5" >
                    {[1, 2, 3, 4, 5].map((index) => {
                        const ativo = (hoverNota || nota) >= index;

                        return (
                            <button
                                key={index}
                                type="button"
                                className={`${styles.coracaoBtn} ${
                                    ativo
                                        ? styles.coracaoAtivo
                                        : ''
                                }`}
                                onClick={() => setNota(index)
                                }
                                onMouseEnter={() => setHoverNota(index)
                                }
                                onMouseLeave={() => setHoverNota(0)
                                }
                                aria-label={`Nota ${index} de 5`}
                            >
                                <Heart
                                    className={
                                        styles.heartIcon
                                    }
                                    fill={
                                        ativo
                                            ? 'currentColor'
                                            : 'transparent'
                                    }
                                />
                            </button>
                        );
                    })}
                </div>

                {nota > 0 && (
                    <span className={styles.notaSelecionada}>
                        {nota} de 5
                    </span>
                )}

                <div className={styles.comentarioField}>
                    <label htmlFor="comentario">
                        Quer deixar uma mensagem para o terapeuta?
                    </label>

                    <textarea
                        id="comentario"
                        placeholder="Escreva como foi a sessão para você..."
                        value={comentario}
                        onChange={(event) => setComentario( event.target.value ) }
                        rows={4}
                        maxLength={1000}
                    />

                    <span
                        className={ styles.contadorCaracteres } >
                        {comentario.length}/1000
                    </span>
                </div>

                <div className={styles.avaliacaoActions}>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleEnviarAvaliacao}
                        disabled={ enviando || nota === 0 }
                    >
                        {enviando
                            ? 'Enviando...'
                            : 'Enviar avaliação'}
                    </button>

                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={handleVoltarDashboard}
                        disabled={enviando}
                    >
                        Pular e voltar ao início
                    </button>
                </div>
            </div>
        </div>
    );
};