// src/pages/Agenda/AgendaPaciente.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'react-big-calendar';
import moment from 'moment';
import localizer from '../../Utils/calendarLocalizer';

import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { toast } from 'react-toastify';

import MenuLateral from '../../Components/Menu/MenuLateral';
import ModalAgendamento from '../../Components/Agenda/ModalAgendamento';
import ModalCancelamento from '../../Components/Agenda/ModalCancelamento';
import ModalExplicativo from '../../Components/Agenda/ModalExplicativo';
import ModalSolicitacaoUrgencia from '../../Components/Agenda/ModalSolicitacaoUrgencia';

import { AgendaService } from '../../api/agendaService';
import { useUser } from '../../contexts/UserContext';

import { FiInfo, FiAlertCircle, FiCalendar, FiClock } from 'react-icons/fi';

import styles from './AgendaPaciente.module.css';

const AgendaPaciente = () => {

    const { usuario } = useUser();

    const { profissionalId, profissionalNome } = useParams();

    const [eventos, setEventos] = useState([]);

    const [loading, setLoading] = useState(false);

    const [dataAtual, setDataAtual] = useState(moment().toDate());

    // =====================================================
    // MODAIS
    // =====================================================

    const [ mostrarModalAgendamento, setMostrarModalAgendamento ] = useState(false);

    const [ slotSelecionado, setSlotSelecionado ] = useState(null);

    const [ mostrarModalCancelamento, setMostrarModalCancelamento ] = useState(false);

    const [ eventoSelecionado, setEventoSelecionado ] = useState(null);

    const [ mostrarModalExplicativo, setMostrarModalExplicativo ] = useState(false);

    const [ mostrarModalUrgencia, setMostrarModalUrgencia ] = useState(false);


    // =====================================================
    // CARREGAR AGENDA
    // =====================================================

    const carregarAgenda = useCallback(
        async (inicio, fim) => {

            if (!profissionalId) {
                return;
            }

            try {

                setLoading(true);

                const pacienteId = usuario?.perfil?.id;

                const response = await AgendaService.getAgenda(
                        profissionalId,
                        inicio.toISOString(),
                        fim.toISOString(),
                        pacienteId
                    );

                const eventosFormatados =
                    response.map(evento => {

                        /*
                         * O backend envia datas em UTC.
                         * Remove o Z para que o calendário
                         * interprete o horário como horário local.
                         */

                        const startString = evento.start.replace('Z', '');

                        const endString = evento.end.replace('Z', '');

                        const startDate = new Date(startString);

                        const endDate = new Date(endString);

                        let title = 'Indisponível';

                        if ( evento.classificacao === 'meu_agendamento' ) {
                            title = 'Minha Consulta';
                        }

                        else if ( evento.classificacao === 'disponivel' ) {
                            title = 'Disponível';
                        }

                        else if (
                            evento.classificacao === 'vaga_vip'
                        ) {
                            title = 'Urgência';
                        }

                        return {
                            ...evento,
                            start: startDate,
                            end: endDate,
                            title
                        };

                    });

                setEventos(eventosFormatados);

            } catch (error) {

                console.error( 'Erro ao carregar agenda:', error );

                toast.error( 'Não foi possível carregar a agenda.' );

            } finally {

                setLoading(false);

            }

        },
        [profissionalId, usuario]
    );


    // =====================================================
    // BUSCA INICIAL / NAVEGAÇÃO
    // =====================================================

    useEffect(() => {

        const inicio = moment(dataAtual).startOf('week');

        const fim = moment(dataAtual).endOf('week');

        carregarAgenda(inicio, fim);

    }, [
        dataAtual,
        carregarAgenda
    ]);


    // =====================================================
    // SELECIONAR EVENTO
    // =====================================================

    const onSelectEvent = (evento) => {

        const agora = moment();


        // -------------------------------------------------
        // HORÁRIO DISPONÍVEL / URGÊNCIA
        // -------------------------------------------------

        if ( evento.classificacao === 'disponivel' || evento.classificacao === 'vaga_vip' ) {

            if ( moment(evento.start).isBefore(agora) ) {

                toast.error( 'Não é possível agendar em horários passados.' );

                return;
            }

            setSlotSelecionado({

                start: evento.start,

                end: evento.end,

                urgenciaId: evento.resource?.urgenciaId

            });

            setMostrarModalAgendamento(true);

            return;
        }


        // -------------------------------------------------
        // CONSULTA DO PACIENTE
        // -------------------------------------------------

        if ( evento.classificacao === 'meu_agendamento' ) {

            if ( moment(evento.start).isBefore(agora) ) {

                toast.info( 'Consultas passadas não podem ser alteradas.' );

                return;
            }

            setEventoSelecionado(evento);

            setMostrarModalCancelamento(true);

        }

    };


    // =====================================================
    // ESTILO DOS EVENTOS
    // =====================================================

    const eventStyleGetter = (event) => {

        const style = {
            borderRadius: '7px',
            border: 'none',
            display: 'block',
            cursor: 'default',
            padding: '4px 7px',
            fontSize: '0.72rem',
            fontWeight: 650,
            color: '#ffffff',
            opacity: 0.97,
            boxShadow: '0 2px 6px rgba(36, 51, 49, 0.10)'
        };

        switch (event.classificacao) {

            // -------------------------------------------------
            // HORÁRIO DISPONÍVEL
            // -------------------------------------------------

            case 'disponivel':

                style.backgroundColor = '#e6f3f0';

                style.color = '#28766d';

                style.border = '1px dashed #62aaa0';

                style.cursor = 'pointer';

                style.opacity = 1;

                break;


            // -------------------------------------------------
            // VAGA DE URGÊNCIA
            // -------------------------------------------------

            case 'vaga_vip':

                style.backgroundColor = '#d65c5c';

                style.color = '#ffffff';

                style.border = '1px solid #b74747';

                style.cursor = 'pointer';

                style.fontWeight = 750;

                style.boxShadow = '0 3px 8px rgba(214, 92, 92, 0.20)';

                break;


            // -------------------------------------------------
            // MINHA CONSULTA
            // -------------------------------------------------

            case 'meu_agendamento':

                if (event.status === 'confirmado') {

                    style.backgroundColor = '#2f8f83';

                    style.color = '#ffffff';

                    style.border = '1px solid #24756b';

                    style.boxShadow = '0 3px 8px rgba(47, 143, 131, 0.20)';

                } else {

                    style.backgroundColor = '#e39a3b';

                    style.color = '#ffffff';

                    style.border = '1px solid #c77d20';

                    style.boxShadow = '0 3px 8px rgba(227, 154, 59, 0.20)';
                }

                style.fontWeight = 750;

                style.cursor = 'pointer';

                break;


            // -------------------------------------------------
            // HORÁRIO INDISPONÍVEL
            // -------------------------------------------------

            case 'bloqueio_comum':

                style.backgroundColor = '#e4e8e7';

                style.color = '#687572';

                style.border = '1px solid #aeb9b6';

                style.cursor = 'not-allowed';

                style.opacity = 0.9;

                break;


            // -------------------------------------------------
            // PADRÃO
            // -------------------------------------------------

            default:

                style.backgroundColor = '#e6ecea';

                style.color = '#6c7b78';

                style.border = '1px solid #d2dcda';

                break;
        }

        return { style };
    };

    // =====================================================
    // ATUALIZAR AGENDA
    // =====================================================

    const atualizarAgenda = () => {

        carregarAgenda( moment(dataAtual).startOf('week'),  moment(dataAtual).endOf('week') );

    };


    return (

        <div className={styles.containerAgenda}>

            <MenuLateral />

            <main className={styles.conteudoAgenda}>

                {/* =================================================
                    CABEÇALHO
                ================================================== */}

                <header className={styles.topoAgenda}>

                    <div className={styles.tituloArea}>

                        <span className={styles.eyebrow}>
                            Agendamento
                        </span>

                        <div className={styles.tituloLinha}>

                            <div className={styles.iconeTitulo}>
                                <FiCalendar />
                            </div>

                            <div>

                                <h1>
                                    Agenda
                                </h1>

                                <p>
                                    Horários disponíveis com{' '}
                                    <strong>
                                        {profissionalNome}
                                    </strong>
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className={styles.acoesAgenda}>

                        <button
                            type="button"
                            className={styles.botaoUrgencia}
                            onClick={() => setMostrarModalUrgencia(true) }
                        >
                            <FiAlertCircle />

                            <span>
                                Solicitar urgência
                            </span>
                        </button>

                        <button
                            type="button"
                            className={styles.botaoInfo}
                            onClick={() => setMostrarModalExplicativo(true) }
                            aria-label="Como funciona a agenda"
                        >
                            <FiInfo />
                        </button>

                    </div>

                </header>


                {/* =================================================
                    INFORMAÇÃO RÁPIDA
                ================================================== */}

                <div className={styles.infoAgenda}>

                    <div className={styles.infoAgendaItem}>

                        <FiClock />

                        <div>

                            <strong>
                                Escolha um horário
                            </strong>

                            <span>
                                Clique em um horário disponível para solicitar uma consulta.
                            </span>

                        </div>

                    </div>

                    <div className={styles.infoAgendaItem}>

                        <FiCalendar />

                        <div>

                            <strong>
                                Horários em tempo real
                            </strong>

                            <span>
                                A agenda é atualizada conforme a disponibilidade do profissional.
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    LEGENDA
                ================================================== */}

                <div className={styles.legenda}>

                    <span className={styles.legendaTitulo}>
                        Status
                    </span>

                    <span className={styles.legendaItem}>

                        <span className={`${styles.indicativo} ${styles.livre}`} />

                        Disponível

                    </span>


                    <span className={styles.legendaItem}>

                        <span className={`${styles.indicativo} ${styles.meu}`} />

                        Minha consulta

                    </span>


                    <span className={styles.legendaItem}>

                        <span className={`${styles.indicativo} ${styles.pen}`} />

                        Pendente

                    </span>


                    <span className={styles.legendaItem}>

                        <span className={`${styles.indicativo} ${styles.urgencia}`} />

                        Urgência

                    </span>


                    <span className={styles.legendaItem}>

                        <span className={`${styles.indicativo} ${styles.bloq}`} />

                        Indisponível

                    </span>

                </div>


                {/* =================================================
                    CALENDÁRIO
                ================================================== */}

                <section className={styles.calendarioWrapper}>

                    <Calendar

                        culture="pt-BR"

                        localizer={localizer}

                        events={eventos}

                        startAccessor="start"

                        endAccessor="end"

                        views={[ 'week', 'day' ]}

                        defaultView="week"

                        selectable={false}

                        onSelectEvent={ onSelectEvent }

                        eventPropGetter={ eventStyleGetter }

                        onNavigate={ setDataAtual }

                        min={ new Date( new Date().getFullYear(), 0, 1, 7, 0, 0 ) }

                        max={
                            new Date(
                                new Date().getFullYear(),
                                0,
                                1,
                                21,
                                0,
                                0
                            )
                        }

                        style={{ height: '100%' }}

                        messages={{

                            week: 'Semana',

                            day: 'Dia',

                            today: 'Hoje',

                            previous: 'Anterior',

                            next: 'Próximo',

                            noEventsInRange: 'Nenhum horário disponível nesta semana.'

                        }}

                    />

                </section>


                {/* =================================================
                    LOADING
                ================================================== */}

                {loading && (

                    <div className={styles.loadingAgenda}>

                        <div className={styles.spinner} />

                        <span>
                            Atualizando agenda...
                        </span>

                    </div>

                )}


                {/* =================================================
                    MODAL AGENDAMENTO
                ================================================== */}

                {mostrarModalAgendamento && (

                    <ModalAgendamento
                        profissionalId={ profissionalId }
                        slot={ slotSelecionado }
                        onClose={() => setMostrarModalAgendamento( false ) }
                        onAgendamentoConcluido={() => {

                            setMostrarModalAgendamento( false );

                            atualizarAgenda();

                        }}
                    />

                )}


                {/* =================================================
                    MODAL CANCELAMENTO
                ================================================== */}

                {mostrarModalCancelamento && (

                    <ModalCancelamento
                        isOpen={ mostrarModalCancelamento }
                        onRequestClose={() => setMostrarModalCancelamento( false ) }
                        evento={ eventoSelecionado }
                        onCancelamentoConcluido={() => {

                            setMostrarModalCancelamento( false );

                            atualizarAgenda();

                        }}
                    />

                )}


                {/* =================================================
                    MODAL URGÊNCIA
                ================================================== */}

                <ModalSolicitacaoUrgencia

                    isOpen={ mostrarModalUrgencia }

                    onRequestClose={() => setMostrarModalUrgencia( false ) }

                    profissionalId={profissionalId }

                    pacienteId={ usuario?.perfil?.id }

                />


                {/* =================================================
                    MODAL EXPLICATIVO
                ================================================== */}

                <ModalExplicativo

                    isOpen={ mostrarModalExplicativo }

                    onRequestClose={() => setMostrarModalExplicativo( false ) }

                />

            </main>

        </div>

    );

};

export default AgendaPaciente;