// src/pages/Perfil/PerfilPublicoProfissional.jsx

import React, { useEffect, useState } from 'react';
import MenuLateral from '../../Components/Menu/MenuLateral';
import api from '../../api/apiConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegCheckSquare, FaStar } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa6';
import { useUser } from '../../contexts/UserContext';

import styles from './PerfilPublicoProfissional.module.css';

export default function PerfilPublicoProfissional() {
    const { id } = useParams();
    const { usuario } = useUser();
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get( `/profissionais/perfil-publico/${id}` );

                setPerfil(res.data);
            } catch (error) {
                // console.error('Erro ao buscar perfil público:', error);
            }
        }

        fetchData();
    }, [id]);

    const navega = () => {
        if (usuario?.tipo_usuario === 'paciente') {
            navigate( `/agenda-paciente/${id}/${encodeURIComponent(perfil.nome)}` );
        } else {
            navigate('/agenda/');
        }
    };

    if (!perfil) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner} />
                <span>Carregando perfil...</span>
            </div>
        );
    }

    const renderStars = (nota) => {
        return [...Array(5)].map((_, i) =>
            i < nota ? (
                <FaStar key={i} className={styles.starFilled} />
            ) : (
                <FaRegStar key={i} className={styles.starEmpty} />
            )
        );
    };

    return (
        <div className={styles.perfilPublicoContainer}>
            <MenuLateral />

            <main className={styles.perfilPublicoConteudo}>

                {/* =========================
                    CABEÇALHO DO PERFIL
                ========================== */}

                <section className={styles.perfilHeaderCard}>

                    <div className={styles.avatarGrande}>
                        {perfil.nome?.substring(0, 2).toUpperCase()}
                    </div>

                    <div className={styles.perfilInfo}>

                        <div className={styles.nomeValidacao}>
                            <h1>{perfil.nome}</h1>

                            {perfil.crp && (
                                <span className={styles.seloValidado}>
                                    <FaRegCheckSquare className={styles.check} />
                                    Verificado
                                </span>
                            )}
                        </div>

                        <div className={styles.especialidadesBadges}>
                            {perfil.especialidade?.map((esp) => (
                                <span key={esp.id} className={styles.badgeEsp} >
                                    {esp.nome}
                                </span>
                            ))}
                        </div>

                        <p className={styles.crpInfo}>
                            CRP:{' '}
                            {perfil.crp?.replace(
                                /^CRP\s*-?\s*/i,
                                ''
                            )}
                        </p>

                        <div className={styles.notaMediaContainer}>
                            <div className={styles.starsRow}>
                                {renderStars(perfil.mediaNotas)}
                            </div>

                            <span className={styles.totalAv}>
                                ({perfil.totalAvaliacoes} avaliações)
                            </span>
                        </div>

                        <div className={styles.botoes}>

                            <button
                                className={`${styles.btnMensagem} ${styles.disabled}`}
                                disabled
                            >
                                Iniciar conversa
                            </button>

                            <button
                                className={styles.btnAgendar}
                                onClick={navega}
                            >
                                {usuario?.tipo_usuario === 'paciente'
                                    ? 'Agendar Consulta'
                                    : 'Abrir agenda'}
                            </button>

                        </div>

                        <span className={styles.hintMsg}>
                            Disponível após iniciar um relato
                        </span>

                    </div>
                </section>

                {/* =========================
                    SOBRE
                ========================== */}

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardEyebrow}>
                            Perfil profissional
                        </span>

                        <h2>Sobre o profissional</h2>
                    </div>

                    <p className={styles.bio}>
                        {perfil.biografia ||
                            'Este profissional ainda não escreveu uma bio.'}
                    </p>
                </section>

                {/* =========================
                    AVALIAÇÕES
                ========================== */}

                <section className={styles.card}>

                    <div className={styles.cardHeader}>
                        <span className={styles.cardEyebrow}>
                            Experiências
                        </span>

                        <h2>Avaliações recentes</h2>
                    </div>

                    {perfil.comentarios.length === 0 ? (
                        <div className={styles.semAvaliacoes}>
                            <div className={styles.emptyRatingIcon}>
                                <FaRegStar />
                            </div>

                            <p>Nenhuma avaliação ainda.</p>
                        </div>
                    ) : (
                        <div className={styles.avaliacoesLista}>
                            {perfil.comentarios.map((av, index) => (
                                <div key={index} className={styles.avaliacaoItem} >
                                    <div className={styles.avaliacaoTopo}>

                                        <span className={styles.nomePaciente} >
                                            {av.nomePaciente}
                                        </span>

                                        <div className={styles.starsMini}>
                                            {renderStars(av.nota)}
                                        </div>

                                    </div>

                                    <p className={styles.comentario}>
                                        {av.texto}
                                    </p>

                                    <span className={styles.dataAv}>
                                        {new Date( av.data ).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}