// src/pages/Home/index.jsx

import { Link } from 'react-router-dom';
import styles from './Home.module.css';

import lobo from '../../img/lobo.png';
import maos from '../../img/maos.webp';
import leitura from '../../img/garota-de-vista-lateral-na-biblioteca.jpg';

import {
    FaArrowRight,
    FaUserSecret,
    FaComments,
    FaCalendarCheck,
    FaVideo,
    FaBrain,
    FaShieldAlt,
    FaHeart,
    FaLinkedin,
    FaInstagram
} from 'react-icons/fa';

function Home() {

    const steps = [
        {
            number: '01',
            icon: <FaUserSecret />,
            title: 'Desabafe',
            description:
                'Compartilhe o que está acontecendo com você em um espaço pensado para preservar sua identidade.'
        },
        {
            number: '02',
            icon: <FaComments />,
            title: 'Encontre apoio',
            description:
                'Profissionais cadastrados podem visualizar relatos e iniciar uma conversa quando identificarem que podem ajudar.'
        },
        {
            number: '03',
            icon: <FaHeart />,
            title: 'Converse',
            description:
                'Construa uma conversa privada com o profissional e conheça sua experiência e especialidades.'
        },
        {
            number: '04',
            icon: <FaCalendarCheck />,
            title: 'Agende',
            description:
                'Se fizer sentido para você, encontre um horário disponível e agende um atendimento online.'
        }
    ];

    const features = [
        {
            icon: <FaUserSecret />,
            title: 'Anonimato desde o início',
            description:
                'Você pode compartilhar seu relato sem precisar revelar sua identidade para iniciar a jornada.'
        },
        {
            icon: <FaBrain />,
            title: 'Inteligência artificial',
            description:
                'Recursos de IA auxiliam na análise de relatos e no acompanhamento de indicadores emocionais.'
        },
        {
            icon: <FaVideo />,
            title: 'Atendimento por vídeo',
            description:
                'Sessões online utilizando comunicação em tempo real através de WebRTC.'
        },
        {
            icon: <FaCalendarCheck />,
            title: 'Agenda inteligente',
            description:
                'Organização de horários, notificações e recursos para facilitar o gerenciamento dos atendimentos.'
        },
        {
            icon: <FaComments />,
            title: 'Conversas privadas',
            description:
                'Comunicação em tempo real entre pacientes e profissionais através da plataforma.'
        },
        {
            icon: <FaShieldAlt />,
            title: 'Privacidade e segurança',
            description:
                'A aplicação utiliza mecanismos de autenticação, proteção de dados e comunicação segura.'
        }
    ];

    return (
        <div className={styles.page}>

            {/* NAVBAR */}

            <header className={styles.navbar}>
                <div className={styles.navContainer}>

                    <Link to="/" className={styles.brand}>
                        <img src={lobo} alt="TherapistFriend" />
                        <span>
                            Therapist<span>Friend</span>
                        </span>
                    </Link>

                    <nav className={styles.navigation}>
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#recursos">Recursos</a>
                        <a href="#sobre">Sobre a plataforma</a>
                    </nav>

                    <div className={styles.navActions}>
                        <Link to="/login" className={styles.login}>
                            Entrar
                        </Link>

                        <Link to="/cadastro" className={styles.navButton}>
                            Criar conta
                            <FaArrowRight />
                        </Link>
                    </div>

                </div>
            </header>


            {/* HERO */}

            <main>

                <section className={styles.hero}>

                    <div className={styles.heroBackground}></div>

                    <div className={styles.heroContainer}>

                        <div className={styles.heroText}>

                            <div className={styles.badge}>
                                <span></span>
                                Um espaço para ser ouvido
                            </div>

                            <h1>
                                Você não precisa
                                <br />
                                começar falando
                                <span> quem é.</span>
                            </h1>

                            <p>
                                Comece falando sobre o que sente.
                                O TherapistFriend conecta pessoas a
                                profissionais da saúde mental através de
                                uma experiência segura, privada e acolhedora.
                            </p>

                            <div className={styles.heroButtons}>

                                <Link
                                    to="/cadastro"
                                    className={styles.primaryButton}
                                >
                                    Começar agora
                                    <FaArrowRight />
                                </Link>

                                <a
                                    href="#como-funciona"
                                    className={styles.secondaryButton}
                                >
                                    Entender como funciona
                                </a>

                            </div>

                            <div className={styles.heroTrust}>

                                <div>
                                    <FaUserSecret />
                                    <span>Anonimato</span>
                                </div>

                                <div>
                                    <FaShieldAlt />
                                    <span>Privacidade</span>
                                </div>

                                <div>
                                    <FaComments />
                                    <span>Conversa privada</span>
                                </div>

                            </div>

                        </div>


                        <div className={styles.heroVisual}>

                            <div className={styles.visualGlow}></div>

                            <div className={styles.imageCard}>

                                <img
                                    src={maos}
                                    alt="Pessoa buscando apoio"
                                />

                                <div className={styles.floatingCard}>

                                    <div className={styles.floatingIcon}>
                                        <FaHeart />
                                    </div>

                                    <div>
                                        <strong>Um espaço para você</strong>
                                        <span>Sem julgamentos.</span>
                                    </div>

                                </div>

                            </div>

                            <div className={styles.circleText}>
                                <span>THERAPIST</span>
                                <span>FRIEND</span>
                            </div>

                        </div>

                    </div>

                </section>


                {/* COMO FUNCIONA */}

                <section
                    id="como-funciona"
                    className={styles.stepsSection}
                >

                    <div className={styles.sectionHeader}>

                        <span className={styles.sectionLabel}>
                            COMO FUNCIONA
                        </span>

                        <h2>
                            Uma jornada que começa
                            <br />
                            com <span>uma conversa.</span>
                        </h2>

                        <p>
                            O TherapistFriend foi pensado para diminuir
                            as barreiras entre quem precisa ser ouvido
                            e quem está preparado para ouvir.
                        </p>

                    </div>


                    <div className={styles.stepsGrid}>

                        {steps.map((step) => (

                            <div
                                className={styles.step}
                                key={step.number}
                            >

                                <div className={styles.stepTop}>

                                    <span className={styles.stepNumber}>
                                        {step.number}
                                    </span>

                                    <div className={styles.stepIcon}>
                                        {step.icon}
                                    </div>

                                </div>

                                <h3>{step.title}</h3>

                                <p>{step.description}</p>

                            </div>

                        ))}

                    </div>

                </section>


                {/* SOBRE */}

                <section
                    id="sobre"
                    className={styles.aboutSection}
                >

                    <div className={styles.aboutImage}>

                        <img
                            src={leitura}
                            alt="Profissional analisando informações"
                        />

                        <div className={styles.aboutBadge}>
                            <FaHeart />
                            <span>
                                Tecnologia a serviço
                                <br />
                                do cuidado
                            </span>
                        </div>

                    </div>


                    <div className={styles.aboutText}>

                        <span className={styles.sectionLabel}>
                            SOBRE A PLATAFORMA
                        </span>

                        <h2>
                            Tecnologia para
                            <span> aproximar pessoas.</span>
                        </h2>

                        <p>
                            Buscar apoio psicológico pode ser difícil.
                            Medo de julgamento, dificuldade para encontrar
                            um profissional adequado ou simplesmente não
                            saber por onde começar são algumas das barreiras
                            que podem afastar uma pessoa do atendimento.
                        </p>

                        <p>
                            O TherapistFriend propõe uma experiência
                            diferente: primeiro vem a conversa. A partir
                            dela, o usuário pode conhecer profissionais,
                            estabelecer uma conexão e decidir se deseja
                            avançar para um atendimento.
                        </p>

                        <Link
                            to="/cadastro"
                            className={styles.textButton}
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            Conheça a plataforma
                            <FaArrowRight />
                        </Link>

                    </div>

                </section>


                {/* RECURSOS */}

                <section id="recursos" className={styles.featuresSection} >

                    <div className={styles.sectionHeader}>

                        <span className={styles.sectionLabel}>
                            RECURSOS
                        </span>

                        <h2>
                            Mais do que conversar.
                            <br />
                            <span>Uma plataforma completa.</span>
                        </h2>

                    </div>


                    <div className={styles.featuresGrid}>

                        {features.map((feature) => (

                            <article className={styles.featureCard} key={feature.title} >

                                <div className={styles.featureIcon}>
                                    {feature.icon}
                                </div>

                                <h3>{feature.title}</h3>

                                <p>{feature.description}</p>

                            </article>

                        ))}

                    </div>

                </section>


                {/* CTA */}

                <section className={styles.ctaSection}>

                    <div className={styles.ctaContent}>

                        <span className={styles.ctaSmall}>
                            SEU PRIMEIRO PASSO
                        </span>

                        <h2>
                            Talvez começar uma conversa
                            <br />
                            seja tudo o que você precisa hoje.
                        </h2>

                        <p>
                            Crie sua conta e descubra uma nova forma
                            de encontrar apoio.
                        </p>

                        <Link
                            to="/cadastro"
                            className={styles.ctaButton}
                        >
                            Criar minha conta
                            <FaArrowRight />
                        </Link>

                    </div>

                </section>

            </main>


            {/* FOOTER */}

            <footer className={styles.footer}>

                <div className={styles.footerMain}>

                    <div className={styles.footerBrand}>

                        <Link to="/" className={styles.brand}>
                            <img className={styles.footerLogo} src={lobo} alt="TherapistFriend" />

                            <span>
                                Therapist<span>Friend</span>
                            </span>
                        </Link>

                        <p>
                            Tecnologia aproximando pessoas
                            e profissionais da saúde mental.
                        </p>

                    </div>


                    <div className={styles.footerLinks}>

                        <div>
                            <strong>Plataforma</strong>
                            <a href="#como-funciona">
                                Como funciona
                            </a>
                            <a href="#recursos">
                                Recursos
                            </a>
                            <Link to="/login">
                                Entrar
                            </Link>
                        </div>

                        <div>
                            <strong>Conta</strong>
                            <Link to="/cadastro">
                                Criar conta
                            </Link>
                            <Link to="/login">
                                Login
                            </Link>
                        </div>

                    </div>

                </div>


                <div className={styles.footerBottom}>

                    <span>
                        © {new Date().getFullYear()} TherapistFriend
                    </span>

                    <span>
                        Desenvolvido por Henrique Ribeiro da Silva Almeida
                    </span>

                    <div className={styles.socials}>

                        <a href="#" aria-label="LinkedIn" >
                            <FaLinkedin />
                        </a>

                        <a href="#" aria-label="Instagram" >
                            <FaInstagram />
                        </a>

                    </div>

                </div>

            </footer>

        </div>
    );
}

export default Home;