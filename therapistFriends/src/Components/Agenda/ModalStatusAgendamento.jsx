// src/Components/Agenda/ModalStatusAgendamento.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { AgendaService } from '../../api/agendaService';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiUser, FiFileText, FiX, FiAlertCircle } from 'react-icons/fi';
import styles from './ModalStatusAgendamento.module.css';

Modal.setAppElement('#root');

const ModalStatusAgendamento = ({
    evento,
    onClose,
    onStatusChange
}) => {
    const [motivo, setMotivo] = useState('');

    if (!evento) return null;

    const handleStatusChange = async (novoStatus) => {
        try {
            await AgendaService.updateAgendamentoStatus( evento.id, novoStatus, motivo);

            // toast.success( `Agendamento ${novoStatus} com sucesso!`);

            onStatusChange();
            onClose();

        } catch (error) {
            
        }
    };

    const formatTime = (date) => {
        if (!date) return '';

        return ( date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') );
    };

    const formatDate = (date) => {
        if (!date) return '';

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            pendente: 'Aguardando confirmação',
            confirmado: 'Confirmado',
            cancelado: 'Cancelado',
            rejeitado: 'Rejeitado',
            finalizado: 'Finalizado'
        };

        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classes = {
            pendente: styles.statusPendente,
            confirmado: styles.statusConfirmado,
            cancelado: styles.statusCancelado,
            rejeitado: styles.statusRejeitado,
            finalizado: styles.statusFinalizado
        };

        return classes[status] || styles.statusDefault;
    };

    const podeCancelar = evento.status !== 'cancelado' && evento.status !== 'rejeitado';

    return (
        <Modal
            isOpen={true}
            onRequestClose={onClose}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Detalhes do Agendamento"
            closeTimeoutMS={150}
        >
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <FiCalendar />
                </div>

                <div className={styles.headerText}>
                    <span className={styles.eyebrow}>
                        AGENDAMENTO
                    </span>

                    <h2>
                        Detalhes da consulta
                    </h2>

                    <p>
                        Confira as informações e gerencie o status deste agendamento.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Fechar"
                >
                    <FiX />
                </button>
            </header>

            <div className={styles.content}>

                {/* =========================
                    Resumo do agendamento
                ========================= */}

                <section className={styles.resumo}>
                    <div className={styles.resumoHeader}>
                        <div>
                            <span className={styles.resumoLabel}>
                                PACIENTE
                            </span>

                            <div className={styles.paciente}>
                                <div className={styles.avatar}>
                                    <FiUser />
                                </div>

                                <strong>
                                    {evento?.resource?.codinome || 'N/A'}
                                </strong>
                            </div>
                        </div>

                        <span
                            className={`${styles.status} ${getStatusClass(evento.status)}`}
                        >
                            {getStatusLabel(evento.status)}
                        </span>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <FiCalendar />
                            </div>

                            <div>
                                <span>Data</span>
                                <strong>
                                    {formatDate(evento.start)}
                                </strong>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <FiClock />
                            </div>

                            <div>
                                <span>Horário</span>
                                <strong>
                                    {formatTime(evento.start)}
                                    {' - '}
                                    {formatTime(evento.end)}
                                </strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =========================
                    Motivo
                ========================= */}

                <section className={styles.motivoSection}>
                    <div className={styles.sectionTitle}>
                        <FiFileText />

                        <span>
                            Motivo / observações
                        </span>
                    </div>

                    <div className={styles.motivoBox}>
                        {evento?.resource?.observacoes ? (
                            <p>
                                {evento.resource.observacoes}
                            </p>
                        ) : (
                            <span>
                                Nenhuma observação foi informada.
                            </span>
                        )}
                    </div>
                </section>

                {/* =========================
                    Aprovação / rejeição
                ========================= */}

                {evento.status === 'pendente' && (
                    <section className={styles.pendenteSection}>
                        <div className={styles.pendenteHeader}>
                            <div className={styles.pendenteIcon}>
                                <FiAlertCircle />
                            </div>

                            <div>
                                <strong>
                                    Este agendamento aguarda confirmação
                                </strong>

                                <p>
                                    Escolha uma ação para responder à solicitação do paciente.
                                </p>
                            </div>
                        </div>

                        <div className={styles.actionsPrimary}>
                            <button
                                type="button"
                                className={styles.confirmButton}
                                onClick={() => handleStatusChange('confirmado') }
                            >
                                Confirmar agendamento
                            </button>

                            <button
                                type="button"
                                className={styles.rejectButton}
                                onClick={() => handleStatusChange('cancelado') }
                            >
                                Rejeitar solicitação
                            </button>
                        </div>
                    </section>
                )}

                {/* =========================
                    Cancelamento
                ========================= */}

                {podeCancelar && (
                    <section className={styles.cancelSection}>
                        <label htmlFor="motivo-cancelamento" className={styles.sectionTitle} >
                            <FiFileText />

                            <span>
                                Motivo do cancelamento
                            </span>

                            <small>
                                Opcional
                            </small>
                        </label>

                        <input
                            id="motivo-cancelamento"
                            type="text"
                            placeholder="Informe o motivo, se necessário..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value) }
                        />

                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => handleStatusChange('cancelado')}
                        >
                            Cancelar agendamento
                        </button>
                    </section>
                )}

                {/* =========================
                    Footer
                ========================= */}

                <footer className={styles.footer}>
                    <button
                        type="button"
                        className={styles.closeFooterButton}
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                </footer>
            </div>
        </Modal>
    );
};

export default ModalStatusAgendamento;