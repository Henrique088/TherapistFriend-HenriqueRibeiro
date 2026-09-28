// src/pages/Agenda/AgendaProfissional.jsx

import React, { useState, useEffect, useCallback } from 'react';

import MenuLateral from '../../Components/Menu/MenuLateral';

import { useUser } from '../../contexts/UserContext';

import {Calendar } from 'react-big-calendar';

import localizer from '../../Utils/calendarLocalizer';

import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import { toast } from 'react-toastify';

import ModalStatusAgendamento from '../../Components/Agenda/ModalStatusAgendamento';

import ModalBloqueio from '../../Components/Agenda/ModalBloqueio';

import ModalGerenciarUrgencias from '../../Components/Agenda/ModalGerenciarUrgencias';

import ModalDisponibilidade from '../../Components/Agenda/ModalDisponibilidade';

import Compartilhar from '../../Components/Compartilhar/Compartilhar';

import Popover from '../../Components/Agenda/Popover';

import { AgendaService } from '../../api/agendaService';

import { FiCalendar, FiSettings, FiAlertCircle, FiSearch, FiX, FiInfo } from 'react-icons/fi';

import styles from './AgendaProfissional.module.css';


const DragAndDropCalendar = withDragAndDrop(Calendar);


function AgendaProfissional() {

    const { usuario } = useUser();


    // =====================================================
    // AGENDA
    // =====================================================

    const [eventos, setEventos] = useState([]);

    const [loading, setLoading] = useState(false);


    // =====================================================
    // MODAIS
    // =====================================================

    const [ mostrarModalDisponibilidade, setMostrarModalDisponibilidade ] = useState(false);

    const [ mostrarModalBloqueio, setMostrarModalBloqueio ] = useState(false);

    const [ mostrarModalStatus, setMostrarModalStatus ] = useState(false);

    const [ mostrarModalUrgencia, setMostrarModalUrgencia ] = useState(false);


    // =====================================================
    // SELEÇÃO
    // =====================================================

    const [ slotSelecionado, setSlotSelecionado ] = useState(null);

    const [ eventoSelecionado, setEventoSelecionado ] = useState(null);


    // =====================================================
    // URGÊNCIAS
    // =====================================================

    const [ solicitacoesPendentes, setSolicitacoesPendentes ] = useState([]);


    // =====================================================
    // FILTROS
    // =====================================================

    const [ filtroAtivo, setFiltroAtivo ] = useState('todos');

    const [ buscaCodinome, setBuscaCodinome ] = useState('');


    // =====================================================
    // POPOVER
    // =====================================================

    const [ popoverInfo, setPopoverInfo ] = useState(null);


    // =====================================================
    // CARREGAR AGENDA
    // =====================================================

    const carregarAgenda = useCallback(
        async (inicio, fim) => {

            const profissionalId = usuario?.perfil?.id;

            if (!profissionalId) {
                return;
            }

            try {

                setLoading(true);

                const dadosAgenda =
                    await AgendaService.getAgendaCompleta(
                        profissionalId,
                        moment(inicio).toISOString(),
                        moment(fim).toISOString()
                    );


                if ( !dadosAgenda || !Array.isArray(dadosAgenda) ) {

                    setEventos([]);

                    return;
                }


                const eventosFormatados =
                    dadosAgenda.filter( evento =>evento.tipo !== '').map(evento => {

                            const dStart = new Date(evento.start);

                            const dEnd = new Date(evento.end);

                            /*
                             * Mantém a conversão UTC
                             * para o horário apresentado
                             * pelo calendário.
                             */

                            const start =
                                new Date(
                                    dStart.getUTCFullYear(),
                                    dStart.getUTCMonth(),
                                    dStart.getUTCDate(),
                                    dStart.getUTCHours(),
                                    dStart.getUTCMinutes()
                                );


                            const end =
                                new Date(
                                    dEnd.getUTCFullYear(),
                                    dEnd.getUTCMonth(),
                                    dEnd.getUTCDate(),
                                    dEnd.getUTCHours(),
                                    dEnd.getUTCMinutes()
                                );


                            let title = '';


                            if ( evento.tipo === 'agendamento' ) {

                                title = evento.resource?.codinome || 'Paciente';

                            }

                            else if ( evento.tipo === 'bloqueio' ) {

                                title = evento.title || 'Bloqueio';

                            }


                            return {

                                ...evento,

                                start,

                                end,

                                title,

                                allDay: false

                            };

                        });

                setEventos( eventosFormatados );
            }

            catch (error) {

                console.error( 'Erro ao carregar agenda:', error );

                toast.error( 'Não foi possível carregar os dados da agenda.' );

            }

            finally {

                setLoading(false);

            }

        },
        [usuario]
    );


    // =====================================================
    // RECARREGAR SEMANA ATUAL
    // =====================================================

    const recarregarSemanaAtual =
        useCallback(() => {

            const inicio = moment().startOf('week');

            const fim = moment().endOf('week');

            carregarAgenda( inicio, fim );

        }, [carregarAgenda]);


    // =====================================================
    // CARREGAR URGÊNCIAS
    // =====================================================

    const carregarUrgenciasPendentes =
        useCallback(
            async () => {

                if (!usuario?.id) {
                    return;
                }

                try {

                    const pendencias = await AgendaService.urgenciaService( usuario?.perfil?.id );

                    setSolicitacoesPendentes( pendencias );

                    if ( pendencias?.pendentes && pendencias.pendentes.length > 0 ) {

                        toast.warn( `Você tem ${pendencias.pendentes.length} solicitações de urgência pendentes!` );
                    }

                }

                catch (error) {

                    console.error( 'Erro ao carregar urgências:', error );

                    if ( error.response?.status !== 404 ) {
                        // Sem toast para não poluir a agenda.
                    }

                    setSolicitacoesPendentes( [] );

                }

            },
            [usuario]
        );


    // =====================================================
    // CARREGAMENTO INICIAL
    // =====================================================

    useEffect(() => {

        const inicio =moment().startOf('week');

        const fim = moment().endOf('week');

        carregarAgenda( inicio, fim );

        carregarUrgenciasPendentes();

    }, [
        carregarAgenda,
        carregarUrgenciasPendentes
    ]);


    // =====================================================
    // FILTROS
    // =====================================================

    const eventosFiltrados =
        eventos.filter(evento => {

            const matchesTipo =
                filtroAtivo === 'todos' ||
                ( 
                    filtroAtivo === 'agendamentos' && evento.tipo === 'agendamento'
                ) ||
                (
                    filtroAtivo === 'bloqueios' && evento.tipo === 'bloqueio'
                );


            const termoBusca = buscaCodinome.toLowerCase().trim();


            const codinome = evento.resource?.codinome?.toLowerCase() || '';


            const matchesBusca = codinome.includes( termoBusca );


            return (
                matchesTipo &&
                matchesBusca
            );

        });


    // =====================================================
    // DECISÃO DE URGÊNCIA
    // =====================================================

    const handleUrgenciaDecidida =
        () => {

            carregarUrgenciasPendentes();

            recarregarSemanaAtual();

            setMostrarModalUrgencia( false );

        };


    // =====================================================
    // NAVEGAÇÃO
    // =====================================================

    const onNavigate =
        (novaData) => {

            const inicio =moment(novaData).startOf('month').subtract(7, 'days');
        
            const fim = moment(novaData).endOf('month').add(7, 'days');


            carregarAgenda( inicio, fim );

        };


    // =====================================================
    // ESTILO DOS EVENTOS
    // =====================================================

    const eventStyleGetter = (event) => {

    const style = {

        backgroundColor: event.color || '#4f7f78',

        borderRadius: '7px',

        color: '#ffffff',

        border: 'none',

        display: 'block',

        opacity: 0.96,

        fontSize: '0.72rem',

        fontWeight: 650,

        padding: '3px 6px',

        boxShadow: '0 2px 6px rgba(36, 51, 49, 0.10)'

    };


    /*
     * =====================================================
     * EXPEDIENTE
     * =====================================================
     *
     * Horário disponível de acordo com a configuração
     * do profissional.
     */

    if ( event.tipo === 'background' ) {

        style.backgroundColor = '#dcecf2';

        style.color = '#3f718c';

        style.border = '1px dashed #72a8bf';

        style.opacity = 0.85;

        style.zIndex = 0;

        style.pointerEvents = 'none';

    }


    /*
     * =====================================================
     * EXCEÇÃO
     * =====================================================
     *
     * Horário que originalmente estava bloqueado,
     * mas foi liberado especificamente para aquele dia.
     */

    if ( event.tipo === 'excecao' ) {

        style.backgroundColor = '#e4e8e7';

        style.color = '#687572';

        style.border = '1px solid #aeb9b6';

        style.textDecoration = 'line-through';

        style.opacity = 0.9;

    }


    /*
     * =====================================================
     * BLOQUEIO
     * =====================================================
     */

    if ( event.tipo === 'bloqueio' ) {

        style.backgroundColor = '#8064a2';

        style.color = '#ffffff';

        style.border = '1px solid #684b89';

        style.opacity = 0.96;

    }


    /*
     * =====================================================
     * CONSULTA PENDENTE
     * =====================================================
     */

    if (event.tipo === 'agendamento' && event.status === 'pendente') {

        style.backgroundColor = '#e39a3b';

        style.color = '#ffffff';

        style.border = '1px solid #c77d20';

        style.opacity = 0.98;

    }


    /*
     * =====================================================
     * CONSULTA CONFIRMADA
     * =====================================================
     */

    if ( event.tipo === 'agendamento' && event.status === 'confirmado' ) {

        style.backgroundColor = '#2f8f83';

        style.color = '#ffffff';

        style.border = '1px solid #24756b';

        style.opacity = 0.98;

    }


    /*
     * =====================================================
     * URGÊNCIA
     * =====================================================
     */

    if ( event.tipo === 'urgencia' ) {

        style.backgroundColor = '#d65c5c';

        style.color = '#ffffff';

        style.border = '1px solid #b74747';

        style.opacity = 0.98;

    }


    return {
        style
    };
};


    // =====================================================
    // SELEÇÃO DE SLOT
    // =====================================================

    const handleSelectSlot =
        ({ start, end }) => {

            const agora = moment();


            if ( moment(start).isBefore(agora) ) {

                toast.error( 'Não é possível gerenciar horários passados.' );

                return;

            }


            const bloqueioExistente =
                eventos.find(evento =>

                    evento.tipo === 'bloqueio' &&

                    moment(start).isBetween(
                        evento.start,
                        evento.end,
                        null,
                        '[)'
                    )

                );


            if (
                bloqueioExistente &&
                bloqueioExistente.resource
                    ?.isRecorrente
            ) {

                setEventoSelecionado( bloqueioExistente );


                setPopoverInfo({
                    x: window.innerWidth / 2,

                    y: window.innerHeight / 2
                });


                return;

            }


            setSlotSelecionado({ start, end });


            setMostrarModalBloqueio( true );

        };


    // =====================================================
    // SELEÇÃO DE EVENTO
    // =====================================================

    const onSelectEvent =
        (evento, e) => {

            const posicao = {

                x: e?.clientX || window.innerWidth / 2,

                y: e?.clientY || window.innerHeight / 2

            };


            if ( evento.tipo === 'bloqueio' || evento.tipo === 'excecao' ) {

                setEventoSelecionado( evento );

                setPopoverInfo( posicao );

                return;

            }


            if ( evento.tipo === 'agendamento' ) {

                setEventoSelecionado( evento );

                setMostrarModalStatus( true );

            }

        };


    // =====================================================
    // CRIAR EXCEÇÃO
    // =====================================================

    const handleAdicionarExcecao =
        async (evento) => {

            const confirmar = window.confirm( 'Deseja liberar este horário especificamente para este dia?' );


            if (!confirmar) {
                return;
            }


            try {

                setLoading(true);


                await AgendaService.createExcecao( evento.resource.bloqueioId, evento.start );

                toast.success( 'Horário liberado com sucesso!' );

                setMostrarModalBloqueio( false);

                recarregarSemanaAtual();

            }

            catch (error) {

                console.error( error);

                toast.error( 'Erro ao liberar horário.' );

            }

            finally {

                setLoading(false);

            }

        };


    // =====================================================
    // SALVAR BLOQUEIO
    // =====================================================

    const handleSalvarBloqueio =
        async (dados) => {

            try {

                setLoading(true);


                if (dados.id) {

                    await AgendaService.atualizarBloqueio( dados.resource.bloqueioId, dados );

                    toast.success( 'Bloqueio atualizado!' );

                }

                else {

                    await AgendaService.createBloqueio({ ...dados, profissionalId: usuario?.perfil?.id });

                    toast.success( 'Bloqueio criado com sucesso!' );

                }


                setMostrarModalBloqueio( false );

                recarregarSemanaAtual();

            }

            catch (error) {

                console.error( error );

                toast.error( 'Erro ao salvar bloqueio.');

            }

            finally {

                setLoading(false);

            }

        };


    // =====================================================
    // RENDER
    // =====================================================

    const quantidadeUrgencias = solicitacoesPendentes?.pendentes?.length || 0;


    return (

        <div className={styles.containerAgenda}>

            <MenuLateral />


            {/* =================================================
                MODAIS
            ================================================= */}

            <ModalDisponibilidade

                visible={ mostrarModalDisponibilidade }

                usuarioId={ usuario?.perfil?.id }

                onClose={() => {

                    setMostrarModalDisponibilidade( false );

                    recarregarSemanaAtual();

                }}

            />


            <ModalBloqueio

                visible={ mostrarModalBloqueio }

                loading={ loading }

                slot={ slotSelecionado }

                onClose={() => {

                    setMostrarModalBloqueio( false );

                    setSlotSelecionado( null );

                }}

                onSalvarBloqueio={ handleSalvarBloqueio }

                onAdicionarExcecao={ handleAdicionarExcecao }

                onRemover={
                    async (id) => {

                        if ( !window.confirm( 'Deseja excluir este bloqueio permanentemente?') ) {
                            return;
                        }


                        try {

                            await AgendaService.deleteBloqueio(id);

                            toast.success( 'Bloqueio removido.');

                            setMostrarModalBloqueio( false);

                            recarregarSemanaAtual();

                        }

                        catch (error) {

                            toast.error( 'Erro ao remover bloqueio.' );

                        }

                    }
                }

            />


            <ModalGerenciarUrgencias

                visible={ mostrarModalUrgencia }

                onClose={() => setMostrarModalUrgencia( false ) }

                solicitacoes={ solicitacoesPendentes ?.pendentes || [] }

                onDecisao={ handleUrgenciaDecidida }

            />


            {popoverInfo && (

                <Popover

                    evento={ eventoSelecionado }

                    posicao={ popoverInfo }

                    onClose={() => {

                        setPopoverInfo( null );

                        recarregarSemanaAtual();

                    }}

                    onConfirm={() => {

                        setPopoverInfo( null );

                        recarregarSemanaAtual();

                    }}

                />

            )}


            {mostrarModalStatus && (

                <ModalStatusAgendamento

                    evento={ eventoSelecionado }

                    onClose={() => setMostrarModalStatus( false )}

                    onStatusChange={ recarregarSemanaAtual }

                />

            )}


            {/* =================================================
                CONTEÚDO
            ================================================= */}

            <main className={styles.conteudoAgenda}>


                {/* =================================================
                    CABEÇALHO
                ================================================= */}

                <header className={styles.cabecalho}>

                    <div className={styles.tituloArea}>

                        <span className={styles.eyebrow}>
                            Gestão de agenda
                        </span>


                        <div className={styles.tituloLinha}>

                            <div className={styles.iconeTitulo}>
                                <FiCalendar />
                            </div>


                            <div>

                                <h1>
                                    Minha agenda
                                </h1>

                                <p>
                                    Organize seus horários, consultas e disponibilidades.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className={styles.acoesCabecalho}>

                        <button
                            type="button"
                            className={styles.botaoDisponibilidade}
                            onClick={() => setMostrarModalDisponibilidade( true ) }
                        >

                            <FiSettings />

                            <span>
                                Configurar horários
                            </span>

                        </button>


                        <button
                            type="button"
                            className={styles.botaoUrgencia}
                            onClick={() => setMostrarModalUrgencia( true ) }
                            disabled={ quantidadeUrgencias === 0 }
                            title={
                                quantidadeUrgencias > 0
                                    ? `${quantidadeUrgencias} solicitação(ões) pendente(s)`
                                    : 'Nenhuma solicitação pendente'
                            }
                        >

                            <FiAlertCircle />

                            <span>
                                Urgências
                            </span>


                            {quantidadeUrgencias > 0 && (

                                <span className={ styles.badgeUrgencia }
                                >
                                    {quantidadeUrgencias}
                                </span>

                            )}

                        </button>

                    </div>

                </header>


                {/* =================================================
                    CONTROLES
                ================================================= */}

                <section className={styles.controles}>

                    <div className={styles.filtros}>

                        <span className={styles.filtrosLabel}>
                            Visualizar
                        </span>


                        <div className={styles.filtrosBotoes}>

                            <button
                                type="button"
                                className={
                                    filtroAtivo === 'todos'
                                        ? `${styles.filtro} ${styles.filtroAtivo}`
                                        : styles.filtro
                                }
                                onClick={() => setFiltroAtivo('todos') }
                            >
                                Tudo
                            </button>


                            <button
                                type="button"
                                className={
                                    filtroAtivo === 'agendamentos'
                                        ? `${styles.filtro} ${styles.filtroAtivo}`
                                        : styles.filtro
                                }
                                onClick={() => setFiltroAtivo( 'agendamentos' ) }
                            >
                                Consultas
                            </button>


                            <button
                                type="button"
                                className={
                                    filtroAtivo === 'bloqueios'
                                        ? `${styles.filtro} ${styles.filtroAtivo}`
                                        : styles.filtro
                                }
                                onClick={() => setFiltroAtivo( 'bloqueios' ) }
                            >
                                Bloqueios
                            </button>

                        </div>

                    </div>


                    <div className={styles.busca}>

                        <FiSearch />

                        <input
                            type="text"
                            value={ buscaCodinome }
                            onChange={(e) => setBuscaCodinome( e.target.value ) }
                            placeholder="Buscar paciente por codinome..."
                        />


                        {buscaCodinome && (

                            <button
                                type="button"
                                className={ styles.limparBusca }
                                onClick={() => setBuscaCodinome('') }
                                aria-label="Limpar busca"
                            >
                                <FiX />
                            </button>

                        )}

                    </div>

                </section>


                {/* =================================================
                    LEGENDA
                ================================================= */}

                <section className={styles.legenda}>

                    <span className={styles.legendaTitulo}>
                        Status
                    </span>


                    <span className={styles.legendaItem}>

                        <i className={`${styles.indicador} ${styles.expediente}`} />

                        Expediente

                    </span>


                    <span className={styles.legendaItem}>

                        <i className={`${styles.indicador} ${styles.confirmado}`} />

                        Confirmado

                    </span>


                    <span className={styles.legendaItem}>

                        <i className={`${styles.indicador} ${styles.pendente}`} />

                        Pendente

                    </span>


                    <span className={styles.legendaItem}>

                        <i className={`${styles.indicador} ${styles.bloqueio}`} />

                        Bloqueio

                    </span>


                    <span className={styles.legendaItem}>

                        <i className={`${styles.indicador} ${styles.excecao}`} />

                        Exceção

                    </span>

                </section>


                {/* =================================================
                    CALENDÁRIO
                ================================================= */}

                <section className={styles.calendarioArea}>

                    <div className={styles.calendarioTopo}>

                        <div>

                            <h2>
                                Agenda
                            </h2>

                            <p>
                                Clique em um horário para gerenciar sua disponibilidade.
                            </p>

                        </div>


                        <div className={styles.compartilhar}>

                            <Compartilhar />

                        </div>

                    </div>


                    <div className={styles.calendario}>

                        <DragAndDropCalendar

                            culture="pt-BR"

                            localizer={ localizer }

                            events={ eventosFiltrados }

                            onNavigate={ onNavigate }

                            startAccessor="start"

                            endAccessor="end"

                            eventPropGetter={ eventStyleGetter }

                            onSelectSlot={ handleSelectSlot }

                            onSelectEvent={ onSelectEvent }

                            selectable

                            resizable

                            defaultView="week"

                            views={[ 'week', 'day' ]}

                            style={{ height: '100%' }}

                            min={ new Date( 2026, 0, 1, 7, 0, 0 ) }

                            max={ new Date( 2026, 0, 1, 22, 0, 0 ) }

                            messages={{

                                week: 'Semana',

                                day: 'Dia',

                                month: 'Mês',

                                previous: 'Anterior',

                                next: 'Próximo',

                                today: 'Hoje',

                                noEventsInRange: 'Nenhum evento neste período.'

                            }}

                        />

                    </div>

                </section>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className={styles.loading}>

                        <span className={styles.spinner} />

                        Atualizando agenda...

                    </div>

                )}

            </main>

        </div>

    );

}


export default AgendaProfissional;