// src/pages/Login/index.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, } from 'react-icons/fi';

import styles from './Login.module.css';
import lobo from '../../img/lobo.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/apiConfig';
import { useUser } from '../../contexts/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const { fetchUsuario } = useUser();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !senha) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const resposta = await api.post(
        '/auth/login',
        { email, senha },
        { withCredentials: true }
      );

      const { user } = resposta.data;

      localStorage.setItem(
        'userAuthInfo',
        JSON.stringify(user)
      );

      await fetchUsuario();

      if (user.tipo_usuario === 'paciente') {
        navigate('/dashboard-paciente');
      } else if (user.tipo_usuario === 'profissional') {
        navigate('/dashboard-profissional');
      } else if (user.tipo_usuario === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
     
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backHome}>
          <FiArrowLeft />
          <span>Voltar para Home</span>
        </Link>

        <Link to="/" className={styles.brand}>
          <span>Therapist</span>
          <strong>Friend</strong>
        </Link>
      </header>

      <main className={styles.content}>
        <section className={styles.formSection}>
          <div className={styles.formWrapper}>
            <div className={styles.heading}>
              <span className={styles.eyebrow}>
                BEM-VINDO DE VOLTA
              </span>

              <h1>
                Continue sua jornada de cuidado.
              </h1>

              <p>
                Entre na sua conta para continuar suas conversas,
                acompanhar sua jornada e acessar seus recursos.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">E-mail</label>

                <div className={styles.inputWrapper}>
                  <FiMail className={styles.inputIcon} />

                  <input
                    type="email"
                    id="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="senha">Senha</label>

                <div className={styles.inputWrapper}>
                  <FiLock className={styles.inputIcon} />

                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className={styles.passwordButton}
                    onClick={() => setMostrarSenha((prev) => !prev) }
                    aria-label={
                      mostrarSenha
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/recuperar-senha">
                  Esqueceu sua senha?
                </Link>
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className={styles.divider}>
                <span>ou</span>
              </div>

              <button
                type="button"
                className={styles.loginButtonGoogle}
                disabled
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt=""
                  className={styles.googleIcon}
                />

                <span>Entrar com o Google</span>

                <small>Em breve</small>
              </button>

              <p className={styles.cadastroText}>
                Ainda não tem uma conta?{' '}
                <Link to="/cadastro">
                  Criar minha conta
                </Link>
              </p>
            </form>
          </div>
        </section>

        <aside className={styles.visualSection}>
          <div className={styles.visualBackground}></div>

          <div className={styles.visualContent}>
            <div className={styles.logoMark}>
              <img src={lobo} alt="" />
            </div>

            <span className={styles.visualLabel}>
              THERAPISTFRIEND
            </span>

            <h2>
              Um espaço seguro
              <br />
              para começar.
            </h2>

            <p>
              Suas conversas, sua jornada e seu espaço para buscar
              apoio.
            </p>
          </div>

          <div className={styles.visualFooter}>
            <span>Anonimato</span>
            <span>Privacidade</span>
            <span>Conexão</span>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Login;