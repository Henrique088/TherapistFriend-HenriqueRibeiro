// src/pages/Cadastro/index.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { toast } from 'react-toastify';

import styles from './Cadastro.module.css';
import lobo from '../../img/lobo.png';
import api from '../../api/apiConfig';
import CodigoVerificacaoModal from '../../Components/CodigoVerificacaoModal/ModalCodigoVerificacao';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('paciente');

  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    tipo: 'email',
    valor: '',
  });

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  async function handleCadastro(e) {
    e.preventDefault();

    if (!nome || !email || !telefone || !senha) {
      return toast.warning('Preencha todos os campos obrigatórios.');
    }

    setLoading(true);

    try {
      await api.post('/usuarios/registrar', {
        nome,
        email,
        telefone: telefone.replace(/\D/g, ''),
        senha,
        tipo_usuario: tipoUsuario,
      });

      setModalConfig({ isOpen: true, tipo: 'email', valor: email });

      toast.success('Cadastro realizado! Vamos validar seu e-mail.');
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }

  const handleVerificacaoSucesso = () => {
    if (modalConfig.tipo === 'email') {
      setModalConfig({ isOpen: true, tipo: 'sms', valor: telefone.replace(/\D/g, '') });

      toast.info('E-mail validado! Agora falta o SMS.');
    } else {
      toast.success('Tudo pronto! Bem-vindo.');

      setModalConfig((prev) => ({ ...prev, isOpen: false }));

      window.location.href = '/login';
    }
  };

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
              <span className={styles.eyebrow}>CRIE SEU ESPAÇO</span>

              <h1>Comece sua jornada no TherapistFriend.</h1>

              <p>
                Crie sua conta para encontrar um espaço onde você possa
                compartilhar, conversar e buscar apoio.
              </p>
            </div>

            <form onSubmit={handleCadastro}>
              <div className={styles.inputGroup}>
                <label htmlFor="nome">Nome</label>

                <div className={styles.inputWrapper}>
                  <FiUser className={styles.inputIcon} />

                  <input
                    type="text"
                    id="nome"
                    placeholder="Digite seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>

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
                <label htmlFor="telefone">Telefone</label>

                <div className={styles.inputWrapper}>
                  <HiOutlineDevicePhoneMobile
                    className={styles.inputIcon}
                  />

                  <input
                    type="tel"
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={formatarTelefone(telefone)}
                    onChange={(e) => setTelefone(e.target.value)}
                    autoComplete="tel"
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
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className={styles.passwordButton}
                    onClick={() => setMostrarSenha((prev) => !prev)}
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

              <div className={styles.typeSection}>
                <div className={styles.typeHeading}>
                  <span>COMO VOCÊ VAI UTILIZAR A PLATAFORMA?</span>
                  <small>Escolha uma opção</small>
                </div>

                <div className={styles.typeOptions}>
                  <label
                    className={`${styles.typeCard} ${
                      tipoUsuario === 'paciente'
                        ? styles.selected
                        : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoUsuario"
                      value="paciente"
                      checked={tipoUsuario === 'paciente'}
                      onChange={() => setTipoUsuario('paciente')}
                    />

                    <div className={styles.radioIndicator}></div>

                    <div>
                      <strong>Buscar apoio</strong>

                      <p>
                        Encontre um espaço para compartilhar o que
                        sente e conhecer profissionais.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`${styles.typeCard} ${
                      tipoUsuario === 'profissional'
                        ? styles.selected
                        : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoUsuario"
                      value="profissional"
                      checked={tipoUsuario === 'profissional'}
                      onChange={() => setTipoUsuario('profissional')}
                    />

                    <div className={styles.radioIndicator}></div>

                    <div>
                      <strong>Oferecer apoio</strong>

                      <p>
                        Conecte-se a pessoas que estão buscando apoio psicológico.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Criando sua conta...' : 'Criar minha conta'}
              </button>

              <p className={styles.loginText}>
                Já possui uma conta?{' '}
                <Link to="/login">Entrar</Link>
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
              Comece falando
              <br />
              sobre o que sente.
            </h2>

            <p>
              Um espaço pensado para tornar o primeiro passo mais simples.
            </p>
          </div>

          <div className={styles.visualFooter}>
            <span>Anonimato</span>
            <span>Privacidade</span>
            <span>Conexão</span>
          </div>
        </aside>
      </main>

      <CodigoVerificacaoModal
        isOpen={modalConfig.isOpen}
        tipo={modalConfig.tipo}
        email={email}
        telefone={telefone.replace(/\D/g, '')}
        onClose={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        onSuccess={handleVerificacaoSucesso}
      />
    </div>
  );
}

export default Cadastro;