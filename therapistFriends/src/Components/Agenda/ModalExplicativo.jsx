// src/Components/Agenda/ModalExplicativo.jsx

import Modal from 'react-modal';
import styles from './ModalExplicativo.module.css';
import { FaCalendarCheck, FaMousePointer, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

Modal.setAppElement('#root');

const ModalExplicativo = ({ isOpen, onRequestClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Explicação da Agenda"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <FaCalendarCheck />
                </div>

                <div className={styles.headerText}>
                    <span className={styles.eyebrow}>
                        GUIA DA AGENDA
                    </span>

                    <h2>Como funciona a agenda?</h2>

                    <p>
                        Entenda como identificar os horários e realizar seus agendamentos.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onRequestClose}
                    aria-label="Fechar"
                >
                    <FiX />
                </button>
            </header>

            <div className={styles.content}>
                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>
                            <FaMousePointer />
                        </span>

                        <h3>Realizando um agendamento</h3>
                    </div>

                    <p>
                        Clique em um horário marcado como{' '}
                        <strong>Disponível</strong> para iniciar
                        seu agendamento.
                    </p>

                    <div className={styles.mobileHint}>
                        <FaInfoCircle />

                        <span>
                            No celular ou tablet, pressione o horário desejado por aproximadamente 2 segundos.
                        </span>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>
                            <FaCalendarCheck />
                        </span>

                        <h3>Legenda dos horários</h3>
                    </div>

                    <div className={styles.legenda}>
                        <div className={styles.legendaItem}>
                            <span
                                className={`${styles.indicativo} ${styles.disponivel}`}
                            />

                            <div>
                                <strong>Disponível</strong>
                                <span>
                                    Horário aberto para solicitar um agendamento.
                                </span>
                            </div>
                        </div>

                        <div className={styles.legendaItem}>
                            <span
                                className={`${styles.indicativo} ${styles.aguardando}`}
                            />

                            <div>
                                <strong>Pendente</strong>
                                <span>
                                    Solicitação enviada e aguardando confirmação do profissional.
                                </span>
                            </div>
                        </div>

                        <div className={styles.legendaItem}>
                            <span
                                className={`${styles.indicativo} ${styles.confirmado}`}
                            />

                            <div>
                                <strong>Confirmado</strong>
                                <span>
                                    Agendamento confirmado e reservado
                                    para você.
                                </span>
                            </div>
                        </div>

                        <div className={styles.legendaItem}>
                            <span
                                className={`${styles.indicativo} ${styles.vip}`}
                            />

                            <div>
                                <strong>Urgência</strong>
                                <span>
                                    Horário disponibilizado especialmente
                                    para casos de urgência.
                                </span>
                            </div>
                        </div>

                        <div className={styles.legendaItem}>
                            <span
                                className={`${styles.indicativo} ${styles.indisponivel}`}
                            />
                            
                            <div>
                                <strong>Indisponível</strong>
                                <span>
                                    Horário indisponível do profissional.
                                </span>
                            </div>

                        </div>
                    </div>
                </section>

                <section className={styles.cancelamento}>
                    <div className={styles.cancelamentoHeader}>
                        <div className={styles.alertIcon}>
                            <FaExclamationTriangle />
                        </div>

                        <div>
                            <span className={styles.eyebrow}>
                                CANCELAMENTO
                            </span>

                            <h3>Política de cancelamento</h3>
                        </div>
                    </div>

                    <p>
                        Para cancelar um agendamento, clique sobre
                        o evento <strong>Confirmado</strong> ou{' '}
                        <strong>Aguardando</strong> na agenda.
                    </p>

                    <div className={styles.regra}>
                        <strong>
                            O cancelamento precisa ser feito com
                            pelo menos 24 horas de antecedência.
                        </strong>

                        <span>
                            Após esse prazo, o cancelamento online não estará disponível.
                        </span>
                    </div>
                </section>
            </div>

            <footer className={styles.footer}>
                <button
                    type="button"
                    className={styles.fecharButton}
                    onClick={onRequestClose}
                >
                    Entendi
                </button>
            </footer>
        </Modal>
    );
};

export default ModalExplicativo;