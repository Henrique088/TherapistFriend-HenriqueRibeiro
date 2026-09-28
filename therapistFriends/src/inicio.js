import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './nav.module.css';
import lobo from './img/lobo.png';
import flor from './img/flor_02.png';
import leitura from './img/garota-de-vista-lateral-na-biblioteca.jpg';
import contato from './img/contato.jpg';
import agenda from './img/agenda.jpg';
import maos from './img/maos.webp';
import { FaLinkedin } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FaSquareInstagram } from "react-icons/fa6";
import { LoremIpsum, Avatar } from 'react-lorem-ipsum';
import img_card from './img/3918491.jpg';


function Ini() {
    const [showOptions, setShowOptions] = useState(false);



    const handleButtonClick = () => {
        setShowOptions(!showOptions);
    }

    const headClick = (e) => {
        if (window.location.pathname === "/") {
            window.location.reload();
        }
    }

    return (

        <header className={styles.cabecalho}>
            <div className={styles.topo}>
                <div className={styles.head}>
                    <div className={styles.logoNome}>

                        <Link to="/ " className={styles.img_topo} onClick={headClick}><img src={lobo} width="55px" alt='imagem de um lobo'></img> Therapist Friend</Link>

                    </div>

                    <div className={styles.loginCad}>
                        <Link to="/login" className={styles.log}><a>Login</a></Link>

                        
                        <Link to="/cadastro" className={styles.log}><a>Cadastro</a></Link>
                            
                        
                    </div>
                </div>
                {/* <hr></hr> */}
            </div>


            <div className={styles.conteudo}>
                <div className={styles.bemVindo}>
                    <img src={flor} className={styles.img}></img>
                    <span className={styles.texto}>
                        Bem-vindo(a) à Therapist Friend, um espaço dedicado a oferecer suporte emocional e psicológico para aqueles que mais necessitam. Nossa missão é reduzir as taxas de evasão e a falta de procura por atendimento psicológico, proporcionando um ambiente seguro e anônimo onde os usuários podem desabafar e encontrar o apoio necessário.


                    </span>
                </div>
            </div>
            <hr></hr>
            <span className={styles.comoFunciona}>Como funciona?</span>


            <div className={styles.f}>
                <div class={styles.card}>
                    <p className={styles.paragrafo}> Desabafe Anonimamente</p>

                    <div class={styles.card__content} style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${maos})` }}>

                        <p class={styles.card__title}>Desabafe</p>
                        <p class={styles.card__description}>
                            Usuários podem compartilhar suas preocupações, angústias e desafios de forma completamente anônima na nossa plataforma. Este espaço de desabafo é confidencial e protegido, garantindo que você possa expressar seus sentimentos sem medo de julgamento.
                        </p>
                    </div>
                </div>

                <div class={styles.card} >
                    <p className={styles.paragrafo}> Leitura Pelos Profissionais</p>

                    <div class={styles.card__content} style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${leitura})` }}>
                        <p class={styles.card__title}>Profissionais</p>
                        <p class={styles.card__description}>
                            Terapeutas e psicólogos cadastrados na plataforma terão acesso às mensagens anônimas dos usuários. Eles podem ler e avaliar cada caso de acordo com sua especialização e experiência.
                        </p>
                    </div>
                </div>

                <div class={styles.card}>
                    <p className={styles.paragrafo}> Contato Iniciado pelos Profissionais</p>

                    <div class={styles.card__content} style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${contato})` }}>

                        <p class={styles.card__title}>Contato</p>
                        <p class={styles.card__description}>
                            Se um profissional se sentir apto a ajudar, ele pode iniciar um contato com o usuário através de mensagens dentro da plataforma. Durante essa interação, o usuário terá acesso ao perfil do profissional, incluindo suas qualificações, experiência e avaliações de outros pacientes, proporcionando credibilidade e confiança na conversa.
                        </p>
                    </div>
                </div>

                <div class={styles.card}>
                    <p className={styles.paragrafo}> Agendamento de Atendimento</p>

                    <div class={styles.card__content} style={{ backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${agenda})` }}>
                        <p class={styles.card__title}>Agendamento</p>
                        <p class={styles.card__description}>
                            Caso o usuário e o profissional concordem, é possível marcar uma consulta, que pode ser realizada online ou presencialmente, conforme a preferência e disponibilidade de ambos.
                        </p>
                    </div>
                </div>
            </div>

            <footer>
                <a className={styles.criador}>Henrique Ribeiro da Silva Almeida</a>
                <div className={styles.contato}>
                    <p>Contatos:</p>
                    <a href='#'><SiGmail />{'\u00A0'} E-mail</a>
                    <a href='#'><FaLinkedin /> {'\u00A0'} Linkedin</a>
                    <a href='#'><FaSquareInstagram /> {'\u00A0'} Instagram</a>
                </div>
            </footer>

        </header>



    );
}

export default Ini;