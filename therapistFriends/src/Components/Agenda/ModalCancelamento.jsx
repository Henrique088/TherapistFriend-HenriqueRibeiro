// src/Components/Agenda/ModalCancelamento.jsx

import Modal from 'react-modal';
import moment from 'moment';
import { toast } from 'react-toastify';
import { AgendaService } from '../../api/agendaService';
import styles from './ModalCancelamento.module.css';
import { IoIosClose } from 'react-icons/io';
import { FaExclamation } from 'react-icons/fa';
import { GiCheckMark } from 'react-icons/gi';

Modal.setAppElement('#root');

const ModalCancelamento = ({
    isOpen,
    onRequestClose,
    evento,
    onCancelamentoConcluido
}) => {
    if (!evento) return null;

    const inicioAgendamento = moment(evento.start);
    const limiteCancelamento = moment(evento.start).subtract(24, 'hours');
    const agora = moment();

    const podeCancelar = agora.isBefore(limiteCancelamento);

    const handleCancelar = async () => {
        if (!podeCancelar) {
            toast.error('O cancelamento é permitido apenas com mais de 24 horas de antecedência.');
            return;
        }

        try {
            await AgendaService.cancelarAgendamento(evento.id);

            toast.success( 'Agendamento cancelado com sucesso!' );

            onCancelamentoConcluido();
        } catch (error) {

        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Confirmar cancelamento"
            className={styles.modalCancelamento}
            overlayClassName={styles.overlayCancelamento}
        >
            <div className={styles.header}>
                <div
                    className={`${styles.headerIcon} ${podeCancelar
                            ? styles.headerIconWarning
                            : styles.headerIconBlocked
                        }`}
                >
                    {podeCancelar ? <FaExclamation /> : <IoIosClose />}
                </div>

                <div className={styles.headerContent}>
                    <span className={styles.eyebrow}>
                        AGENDAMENTO
                    </span>

                    <h2>
                        {podeCancelar
                            ? 'Cancelar consulta?'
                            : 'Cancelamento indisponível'
                        }
                    </h2>
                </div>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onRequestClose}
                    aria-label="Fechar"
                >
                    <IoIosClose />
                </button>
            </div>

            <div className={styles.content}>
                <p className={styles.description}>
                    {podeCancelar
                        ? 'Você está prestes a cancelar o seguinte agendamento. Essa ação não poderá ser desfeita.'
                        : 'Este agendamento não pode mais ser cancelado pelo sistema.'
                    }
                </p>

                <div className={styles.agendamentoInfo}>
                    <div className={styles.infoRow}>
                        <span>Data</span>

                        <strong>
                            {inicioAgendamento.format('DD/MM/YYYY')}
                        </strong>
                    </div>

                    <div className={styles.infoRow}>
                        <span>Horário</span>

                        <strong>
                            {inicioAgendamento.format('HH:mm')}
                        </strong>
                    </div>

                    <div className={styles.infoRow}>
                        <span>Status atual</span>

                        <span className={styles.status}>
                            {evento.status}
                        </span>
                    </div>
                </div>

                {podeCancelar ? (
                    <>
                        <div className={styles.alertaPermitido}>
                            <div className={styles.alertaIcon}>
                                <GiCheckMark />
                            </div>

                            <div>
                                <strong>
                                    Cancelamento permitido
                                </strong>

                                <p>
                                    O cancelamento está sendo realizado com mais de 24 horas de antecedência.
                                </p>
                            </div>
                        </div>

                        <p className={styles.confirmacao}>
                            Tem certeza que deseja cancelar esta consulta?
                        </p>

                        <div className={styles.botoesModal}>
                            <button
                                type="button"
                                className={styles.botaoFechar}
                                onClick={onRequestClose}
                            >
                                Não, manter
                            </button>

                            <button
                                type="button"
                                className={styles.botaoCancelar}
                                onClick={handleCancelar}
                            >
                                Sim, cancelar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.alertaErro}>
                            <div className={styles.alertaIcon}>
                                <IoIosClose />
                            </div>

                            <div>
                                <strong>
                                    Prazo de cancelamento encerrado
                                </strong>

                                <p>
                                    O cancelamento precisa ser realizado com mais de 24 horas de antecedência.
                                </p>
                            </div>
                        </div>

                        <div className={styles.limite}>
                            <span>
                                Limite para cancelamento
                            </span>

                            <strong>
                                {limiteCancelamento.format(
                                    'DD/MM/YYYY [às] HH:mm'
                                )}
                            </strong>
                        </div>

                        <div className={styles.botoesModal}>
                            <button
                                type="button"
                                className={styles.botaoFechar}
                                onClick={onRequestClose}
                            >
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ModalCancelamento;