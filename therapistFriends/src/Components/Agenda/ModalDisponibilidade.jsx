// src/Components/Agenda/ModalDisponibilidade.jsx

import React, { useState } from 'react';
import styles from './ModalDisponibilidade.module.css';
import { AgendaService } from '../../api/agendaService';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

export default function ModalDisponibilidade({ visible, onClose, usuarioId }) {
    const [carregando, setCarregando] = useState(false);

    const [horarios, setHorarios] = useState([
        {
            dia_semana: 1,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 2,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 3,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 4,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 5,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 6,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
        {
            dia_semana: 0,
            ativo: false,
            intervalos: [{ inicio: '08:00', fim: '12:00' }]
        },
    ]);

    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const toggleDia = (index) => {
        setHorarios(prev =>
            prev.map((dia, i) =>
                i === index
                    ? { ...dia, ativo: !dia.ativo }
                    : dia
            )
        );
    };

    const adicionarIntervalo = (diaIndex) => {
        setHorarios(prev =>
            prev.map((dia, i) =>
                i === diaIndex
                    ? {
                        ...dia,
                        intervalos: [
                            ...dia.intervalos,
                            {
                                inicio: '13:00',
                                fim: '18:00'
                            }
                        ]
                    }
                    : dia
            )
        );
    };

    const removerIntervalo = (diaIndex, intIndex) => {
        setHorarios(prev =>
            prev.map((dia, i) =>
                i === diaIndex
                    ? {
                        ...dia,
                        intervalos: dia.intervalos.filter(
                            (_, index) => index !== intIndex
                        )
                    }
                    : dia
            )
        );
    };

    const atualizarHorario = (
        diaIndex,
        intIndex,
        campo,
        valor
    ) => {
        setHorarios(prev =>
            prev.map((dia, i) => {
                if (i !== diaIndex) return dia;

                return {
                    ...dia,
                    intervalos: dia.intervalos.map(
                        (intervalo, index) =>
                            index === intIndex
                                ? {
                                    ...intervalo,
                                    [campo]: valor
                                }
                                : intervalo
                    )
                };
            })
        );
    };

    const salvarDisponibilidade = async () => {
        const selecionados = horarios.filter(
            horario => horario.ativo
        );

        if (selecionados.length === 0) {
            toast.error( 'Selecione pelo menos um dia para atendimento.');
            return;
        }

        const gradesFormatadas = selecionados.flatMap(dia =>
            dia.intervalos.map(intervalo => ({
                diaSemana: dia.dia_semana,
                horaInicio: intervalo.inicio,
                horaFim: intervalo.fim
            }))
        );

        const payload = { grades: gradesFormatadas };

        try {
            setCarregando(true);

            await AgendaService.saveDisponibilidade( usuarioId, payload );

            toast.success('Horários de expediente atualizados!' );

            onClose();
        } catch (error) {
            // console.error('Erro ao salvar disponibilidade:', error);

            // toast.error( error.response?.data?.erro || 'Não foi possível atualizar os horários.');

        } finally {
            setCarregando(false);
        }
    };

    if (!visible) return null;

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="disponibilidade-title"
            >
                <header className={styles.header}>
                    <div className={styles.headerIcon}>
                        <FaCalendarCheck />
                    </div>

                    <div className={styles.headerText}>
                        <span className={styles.eyebrow}>
                            AGENDA
                        </span>

                        <h2 id="disponibilidade-title">
                            Configurar expediente
                        </h2>

                        <p>
                            Defina os dias e horários em que você estará disponível para atendimento.
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
                    <FaClock />

                    <span>
                        Esses horários serão usados como sua disponibilidade padrão semanal.
                    </span>
                </div>

                <div className={styles.listaDias}>
                    {horarios.map((dia, dIdx) => (
                        <section
                            key={dia.dia_semana}
                            className={`${styles.diaItem} ${
                                dia.ativo ? styles.diaAtivo : ''
                            }`}
                        >
                            <div className={styles.diaHeader}>
                                <label
                                    className={styles.diaToggle}
                                >
                                    <input
                                        type="checkbox"
                                        checked={dia.ativo}
                                        onChange={() => toggleDia(dIdx) }
                                    />

                                    <span
                                        className={ styles.toggleVisual }
                                    />
                                </label>

                                <div
                                    className={styles.diaNome}
                                >
                                    <strong>
                                        {diasNomes[dia.dia_semana]}
                                    </strong>

                                    <span>
                                        {dia.ativo
                                            ? `${dia.intervalos.length} ${
                                                dia.intervalos.length === 1
                                                    ? 'período'
                                                    : 'períodos'
                                            } configurado${
                                                dia.intervalos.length === 1
                                                    ? ''
                                                    : 's'
                                            }`
                                            : 'Sem atendimento'}
                                    </span>
                                </div>
                            </div>

                            {dia.ativo && (
                                <div className={ styles.intervalosContainer} >
                                    {dia.intervalos.map(
                                        (intervalo, iIdx) => (
                                            <div key={iIdx} className={ styles.intervalo } >

                                                <div className={ styles.horarioCampo } >
                                                    <span>
                                                        Início
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={ intervalo.inicio }
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                dIdx,
                                                                iIdx,
                                                                'inicio',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <span className={ styles.separador } >
                                                    até
                                                </span>

                                                <div className={ styles.horarioCampo } >
                                                    
                                                    <span>
                                                        Fim
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={ intervalo.fim }
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                dIdx,
                                                                iIdx,
                                                                'fim',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {dia.intervalos
                                                    .length > 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.removerButton }
                                                        onClick={() =>
                                                            removerIntervalo( dIdx, iIdx )
                                                        }
                                                        aria-label="Remover período"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        className={ styles.adicionarButton }
                                        onClick={() => adicionarIntervalo( dIdx ) }
                                    >
                                        <FaPlus />
                                        Adicionar outro período
                                    </button>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                <footer className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelarButton}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className={styles.salvarButton}
                        onClick={salvarDisponibilidade}
                        disabled={carregando}
                    >
                        {carregando
                            ? 'Salvando...'
                            : 'Salvar horários'}
                    </button>
                </footer>
            </div>
        </div>
    );
}