// src/Components/Agenda/ModalSolicitacaoUrgencia.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { AgendaService } from '../../api/agendaService';
import { AiFillAlert } from 'react-icons/ai';
import { FiClock, FiInfo, FiX } from 'react-icons/fi';
import styles from './ModalSolicitacaoUrgencia.module.css';

Modal.setAppElement('#root');

const ModalSolicitacaoUrgencia = ({
    isOpen,
    onRequestClose,
    profissionalId,
    pacienteId
}) => {
    const [motivo, setMotivo] = useState('');
    const [janelaDeTempo, setJanelaDeTempo] = useState('3_dias');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!motivo.trim() || motivo.length < 10) {
            toast.error( 'Descreva o motivo da urgência com mais detalhes.' );
            return;
        }

        if (!profissionalId || !pacienteId) {
            toast.error( 'Erro de autenticação: Profissional ou Paciente não identificados.' );
            return;
        }

        setLoading(true);

        try {
            const response = await AgendaService.solicitarUrgencia( profissionalId, pacienteId, motivo, janelaDeTempo );

            // toast.success( response.message || 'Sua solicitação de urgência foi enviada ao profissional!' );

            setMotivo('');
            setJanelaDeTempo('3_dias');

            onRequestClose();

        } catch (error) {
            // toast.error( error.response?.data?.erro || 'Não foi possível enviar a solicitação de urgência.' );

            // console.error( 'Erro ao solicitar urgência:', error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Solicitar Atendimento de Urgência"
            className={styles.modal}
            overlayClassName={styles.overlay}
            closeTimeoutMS={150}
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
                        Solicitar atendimento de urgência
                    </h2>

                    <p>
                        Informe o motivo da solicitação e o período em que você precisa de atendimento.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onRequestClose}
                    disabled={loading}
                    aria-label="Fechar"
                >
                    <FiX />
                </button>
            </header>

            <div className={styles.content}>
                <div className={styles.alertBox}>
                    <div className={styles.alertIcon}>
                        <FiInfo />
                    </div>

                    <div>
                        <strong>
                            Como funciona?
                        </strong>

                        <p>
                            Esta é uma solicitação de prioridade. O profissional analisará o pedido e, se aprovado,
                            o sistema iniciará o processo de realocação de horários.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form} >
                    <div className={styles.field}>
                        <label htmlFor="motivo">
                            Motivo da urgência
                        </label>

                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={5}
                            placeholder="Explique brevemente por que você precisa de um atendimento prioritário."
                            required
                            disabled={loading}
                        />

                        <div className={styles.fieldHint}>
                            <span>
                                Descreva sua situação com clareza para ajudar o profissional na avaliação.
                            </span>

                            <span>
                                {motivo.length} caracteres
                            </span>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="janela">
                            <FiClock />
                            Janela de atendimento desejada
                        </label>

                        <select
                            id="janela"
                            value={janelaDeTempo}
                            onChange={(e) => setJanelaDeTempo(e.target.value) }
                            disabled={loading}
                        >
                            <option value="3_dias">
                                Próximos 3 dias
                            </option>

                            <option value="7_dias">
                                Próximos 7 dias
                            </option>
                        </select>
                    </div>

                    <div className={styles.infoFooter}>
                        <FiInfo />

                        <span>
                            A solicitação não garante um novo horário. A disponibilidade dependerá da análise do
                            profissional e da agenda.
                        </span>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onRequestClose}
                            disabled={loading}
                            className={styles.cancelButton}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Enviando solicitação...' : 'Confirmar solicitação' }
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ModalSolicitacaoUrgencia;