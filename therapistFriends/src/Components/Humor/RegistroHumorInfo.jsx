// src/Components/Humor/RegistroHumorInfo.jsx

import React, { useEffect } from 'react';

import { Info, Smile, Sparkles, BarChart3, X } from 'lucide-react';

import styles from './RegistroHumorInfo.module.css';

const RegistroHumorInfo = ({
    aberto,
    onFechar,
}) => {
    useEffect(() => {
        if (!aberto) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onFechar();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [aberto, onFechar]);

    if (!aberto) {
        return null;
    }

    return (
        <div
            className={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onFechar();
                }
            }}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="registro-humor-titulo"
            >
                {/* =================================================
            CABEÇALHO
        ================================================= */}

                <div className={styles.modalHeader} >

                    <div className={styles.headerIcon} >
                        <Info size={21} />
                    </div>

                    <div className={styles.headerText} >

                        <span className={styles.eyebrow} >
                            REGISTRO DE HUMOR
                        </span>

                        <h2 id="registro-humor-titulo" >
                            Sobre o seu registro de humor
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.closeButton
                        }
                        onClick={onFechar}
                        aria-label="Fechar informações"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* =================================================
            CONTEÚDO
        ================================================= */}

                <div className={styles.content} >

                    <p className={styles.description} >
                        O registro de humor permite que
                        você indique como está se sentindo
                        e qual é a intensidade dessa
                        sensação no momento.
                    </p>

                    {/* ---------------------------------------------
              PERSONALIZAÇÃO
          --------------------------------------------- */}

                    <div className={styles.feature} >

                        <div className={styles.featureIcon} >
                            <Smile size={18} />
                        </div>

                        <div>
                            <strong>
                                Personalização dos seus cards
                            </strong>

                            <p>
                                O humor registrado é utilizado
                                para personalizar os conteúdos
                                apresentados na seção
                                <strong>
                                    {' '}“Para você”
                                </strong>
                                {' '}do seu dashboard.
                            </p>
                        </div>
                    </div>

                    {/* ---------------------------------------------
              HISTÓRICO
          --------------------------------------------- */}

                    <div className={styles.feature} >

                        <div className={styles.featureIcon} >
                            <BarChart3 size={18} />
                        </div>

                        <div>
                            <strong>
                                Histórico e acompanhamento
                            </strong>

                            <p>
                                Os registros podem formar um
                                histórico que permita observar
                                mudanças no humor ao longo do
                                tempo.
                            </p>
                        </div>
                    </div>

                    {/* ---------------------------------------------
              FUTURO
          --------------------------------------------- */}

                    <div
                        className={
                            styles.future
                        }
                    >
                        <div className={styles.futureIcon} >
                            <Sparkles size={16} />
                        </div>

                        <div className={styles.futureContent} >

                            <span className={styles.futureEyebrow} >

                                EVOLUÇÃO DA FUNCIONALIDADE
                            </span>

                            <p>
                                Futuramente, esses registros
                                poderão ser utilizados para
                                identificar padrões de humor e
                                oferecer uma forma de
                                acompanhamento para o próprio
                                usuário.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
            RODAPÉ
        ================================================= */}

                <div className={styles.footer} >

                    <button
                        type="button"
                        className={
                            styles.closeFooterButton
                        }
                        onClick={onFechar}
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistroHumorInfo;