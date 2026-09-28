// src/Components/Agenda/Popover.jsx

import React, { useState } from 'react';
import { AgendaService } from '../../api/agendaService';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import { FiX, FiTrash2, FiUnlock, FiLock, FiInfo
} from 'react-icons/fi';
import styles from './Popover.module.css';

const Popover = ({
    evento,
    posicao,
    onClose,
    onConfirm
}) => {
    const { usuario } = useUser();
    const [motivo, setMotivo] = useState('');

    if (!posicao || !evento) return null;

    const handleSubmit = async () => {
        try {
            const profissionalId = usuario?.perfil?.id;
            const bloqueioId = evento.resource?.bloqueioId;
            const excecaoId = evento.resource?.excecaoId;

            if (evento.tipo === 'bloqueio') {
                await AgendaService.deleteBloqueio( profissionalId, bloqueioId );

                // toast.success( 'Bloqueio removido com sucesso!' );

            } else if (evento.tipo === 'excecao') {
                await AgendaService.deleteExcecao( profissionalId, bloqueioId, excecaoId );

                // toast.success('Exceção removida com sucesso!');
            }

            onClose();

        } catch (error) {
            // toast.error( error.response?.data?.erro || 'Erro ao remover bloqueio.');

            // console.error(error);
        }
    };

    const handleAdicionarExcecao = async () => {
        try {
            const profissionalId = usuario?.perfil?.id;
            const bloqueioId = evento.resource?.bloqueioId;

            const dataParaEnvio = moment(evento.start).format( 'YYYY-MM-DD' );

            await AgendaService.createExcecao(profissionalId, bloqueioId, dataParaEnvio, motivo );

            toast.success('Exceção adicionada com sucesso!' );

            onClose();

        } catch (error) {
            // toast.error(error.response?.data?.erro || 'Erro ao adicionar exceção.' );

            // console.error(error);
        }
    };

    const isBloqueio = evento.tipo === 'bloqueio';
    const isExcecao = evento.tipo === 'excecao';
    const isBackground = evento.tipo === 'background';

    const titulo = isBloqueio
        ? 'Gerenciar bloqueio'
        : isExcecao
            ? 'Horário indisponível'
            : 'Horário disponível';

    const subtitulo = isBloqueio
        ? 'Este horário está bloqueado na sua agenda.'
        : isExcecao
            ? 'Este horário possui uma exceção configurada.'
            : 'Você pode bloquear este horário.';

    const tipoBloqueio = evento.resource?.isRecorrente
        ? 'Recorrente'
        : 'Pontual';

    return (
        <div className={styles.popover} style={{ top: posicao.y, left: posicao.x}} >
            <div className={styles.arrow} />

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    {isBackground ? (
                        <FiLock />
                    ) : isExcecao ? (
                        <FiUnlock />
                    ) : (
                        <FiLock />
                    )}
                </div>

                <div className={styles.headerContent}>
                    <span className={styles.eyebrow}>
                        AGENDA
                    </span>

                    <h4>
                        {titulo}
                    </h4>
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

            {/* Informações do horário */}
            <div className={styles.schedule}>
                <span className={styles.scheduleDate}>
                    {moment(evento.start).format('DD/MM/YYYY')}
                </span>

                <strong>
                    {moment(evento.start).format('HH:mm')}
                    {' — '}
                    {moment(evento.end).format('HH:mm')}
                </strong>
            </div>

            <p className={styles.description}>
                {subtitulo}
            </p>

            {/* Bloqueio */}
            {isBloqueio && (
                <div className={styles.section}>
                    <div className={styles.badgeRow}>
                        <span className={styles.badge}>
                            {tipoBloqueio}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                    >
                        <FiTrash2 />

                        <span>
                            Remover bloqueio
                        </span>
                    </button>

                    <div className={styles.exceptionBox}>
                        <div className={styles.exceptionHeader}>
                            <FiUnlock />

                            <strong>
                                Liberar este dia
                            </strong>
                        </div>

                        <p>
                            Crie uma exceção para permitir atendimentoneste horário especificamente neste dia.
                        </p>

                        <input
                            type="text"
                            placeholder="Motivo da exceção (opcional)"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value) }
                            className={styles.input}
                        />

                        <button
                            type="button"
                            onClick={handleAdicionarExcecao}
                            className={`${styles.actionButton} ${styles.primaryButton}`}
                        >
                            <FiUnlock />

                            <span>
                                Adicionar exceção
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Exceção */}
            {isExcecao && (
                <div className={styles.section}>
                    <div className={styles.infoBox}>
                        <FiInfo />

                        <span>
                            Esta exceção foi criada para liberar ou alterar a disponibilidade deste horário.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                    >
                        <FiTrash2 />

                        <span>
                            Remover exceção
                        </span>
                    </button>
                </div>
            )}

            {/* Horário disponível */}
            {isBackground && (
                <div className={styles.section}>
                    <div className={styles.infoBox}>
                        <FiInfo />

                        <span>
                            Este horário faz parte do seu expediente disponível para atendimento.
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => onConfirm({ ...evento, tipo: 'bloqueio' }) }
                        className={`${styles.actionButton} ${styles.primaryButton}`}
                    >
                        <FiLock />

                        <span>
                            Bloquear horário
                        </span>
                    </button>
                </div>
            )}

            <footer className={styles.footer}>
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.cancelButton}
                >
                    Cancelar
                </button>
            </footer>
        </div>
    );
};

export default Popover;