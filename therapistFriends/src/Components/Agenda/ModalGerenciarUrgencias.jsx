// src/Components/Agenda/ModalGerenciarUrgencias.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { AgendaService } from '../../api/agendaService';
import styles from './ModalGerenciarUrgencias.module.css';

import { PiCheckFatFill } from 'react-icons/pi';

import { AiFillAlert } from 'react-icons/ai';

import {FiX, FiClock, FiUser, FiInfo } from 'react-icons/fi';

const ModalGerenciarUrgencias = ({
    visible,
    onClose,
    solicitacoes,
    onDecisao
}) => {
    const [loading, setLoading] = useState(false);

    if (!visible) return null;

    const handleDecidir = async (
        profissionalId,
        solicitacaoId,
        acao,
        motivo = ''
    ) => {
        setLoading(true);

        try {
            await AgendaService.decidirUrgencia( profissionalId, solicitacaoId, acao, motivo );

            toast.success(
                `Urgência ${
                    acao === 'aprovar'
                        ? 'aprovada'
                        : 'rejeitada'
                } com sucesso!`
            );

            onDecisao();

        } catch (error) {
            // console.error( 'Erro ao decidir solicitação de urgência:', error );

            // toast.error(error.response?.data?.erro || 'Não foi possível processar a solicitação.');

        } finally {
            setLoading(false);
        }
    };

    const listaSolicitacoes = Array.isArray(solicitacoes)
        ? solicitacoes
        : [];

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            contentLabel="Gerenciar Urgências"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <AiFillAlert />
                </div>

                <div className={styles.headerText}>
                    <span className={styles.eyebrow}>
                        ATENDIMENTO PRIORITÁRIO
                    </span>

                    <h2>
                        Solicitações de urgência
                    </h2>

                    <p>
                        Analise as solicitações pendentes e decida se deseja iniciar o processo de realocação.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <FiX />
                </button>
            </header>

            <div className={styles.info}>
                <FiInfo />

                <span>
                    Ao aprovar uma solicitação, o sistema poderá iniciar automaticamente o processo de realocação de horário.
                </span>
            </div>

            {listaSolicitacoes.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <AiFillAlert />
                    </div>

                    <h3>
                        Nenhuma solicitação pendente
                    </h3>

                    <p>
                        No momento, não há solicitações de urgência aguardando sua decisão.
                    </p>
                </div>
            ) : (
                <div className={styles.lista}>
                    {listaSolicitacoes.map((solicitacao) => {
                        const dados = solicitacao.props || {};

                        const janela =
                            dados.janela_de_tempo === '7_dias'
                                ? 'Próximos 7 dias'
                                : 'Próximos 3 dias';

                        return (
                            <article key={solicitacao.id} className={styles.urgencia} >

                                <div className={styles.urgenciaHeader}>
                                    <div className={styles.paciente}>
                                        <div className={styles.avatar}>
                                            <FiUser />
                                        </div>

                                        <div>
                                            <span className={styles.label}>
                                                Paciente
                                            </span>

                                            <strong>
                                                {dados.codinome || 'Paciente'}
                                            </strong>
                                        </div>
                                    </div>

                                    <span className={styles.badge}>
                                        <AiFillAlert />
                                        Urgência
                                    </span>
                                </div>

                                <div className={styles.detalhes}>
                                    <div className={styles.detalhe}>
                                        <span className={styles.detalheLabel}>
                                            Motivo
                                        </span>

                                        <p className={styles.motivo}>
                                            {dados.motivo || 'Motivo não informado.'}
                                        </p>
                                    </div>

                                    <div className={styles.detalhe}>
                                        <span className={styles.detalheLabel}>
                                            Janela solicitada
                                        </span>

                                        <div className={styles.janela}>
                                            <FiClock />

                                            <span>
                                                {janela}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.acoes}>
                                    <button
                                        type="button"
                                        className={styles.rejeitar}
                                        onClick={() =>
                                            handleDecidir(
                                                dados.profissionalId,
                                                dados.id,
                                                'rejeitar',
                                                'Não há disponibilidade imediata ou o critério não foi atendido.'
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        {loading ? 'Processando...' : 'Rejeitar'}
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.aprovar}
                                        onClick={() => handleDecidir( dados.profissionalId, dados.id, 'aprovar' ) }
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            'Processando...'
                                        ) : (
                                            <>
                                                <PiCheckFatFill />
                                                Aprovar e iniciar realocação
                                            </>
                                        )}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <footer className={styles.footer}>
                <button
                    type="button"
                    className={styles.fechar}
                    onClick={onClose}
                >
                    Fechar
                </button>
            </footer>
        </Modal>
    );
};

export default ModalGerenciarUrgencias;