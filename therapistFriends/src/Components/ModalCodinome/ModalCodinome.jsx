// src/Components/ModalCodinome/ModalCodinome.jsx

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Modal from 'react-modal';
import { FiUser, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import styles from './ModalCodinome.module.css';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/apiConfig';

Modal.setAppElement('#root');

export default function ModalCodinome({ isOpen, onClose }) {
  const [codinome, setCodinome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [redirect, setRedirect] = useState(null);

  const { setUsuario } = useUser();

  const salvarCodinome = async () => {
    const codinomeLimpo = codinome.trim();

    if (codinomeLimpo.length < 3) {
      toast.warn('O codinome deve ter pelo menos 3 caracteres.');
      return;
    }

    setSalvando(true);

    try {
      const response = await api.put('/pacientes/atualizar', {
        codinome: codinomeLimpo,
      });

      localStorage.setItem('info', JSON.stringify(response.data.info));

      toast.success('Codinome salvo com sucesso!');

      onClose();
    } catch (error) {
      // toast.error(
      //   error?.response?.data?.message ||
      //     'Não foi possível salvar o codinome.'
      // );
    } finally {
      setSalvando(false);
    }
  };

  async function logout(e) {
    e.preventDefault();

    try {
      await api.post('/auth/logout');

      toast.success('Volte sempre! Saindo...', {
        autoClose: 2000,
      });

      setTimeout(() => {
        setRedirect(true);
      }, 2000);
    } catch (error) {
      setRedirect(true);
    }
  }

  if (redirect) {
    setUsuario(null);
    return <Navigate to="/login" replace />;
  }

  const codinomeValido = codinome.trim().length >= 3;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalHeader}>
        <div className={styles.headerIcon}>
          <FiUser size={22} />
        </div>

        <div>
          <span className={styles.eyebrow}>SEU ESPAÇO</span>
          <h2>Escolha seu codinome</h2>
        </div>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.intro}>
          <h3>Como você gostaria de ser chamado?</h3>

          <p>
            Para preservar sua privacidade, você pode usar um codinome em vez do seu nome real dentro da plataforma.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="codinome">Codinome</label>

          <div className={styles.inputWrapper}>
            <FiUser className={styles.inputIcon} />

            <input
              type="text"
              id="codinome"
              value={codinome}
              onChange={(e) => setCodinome(e.target.value)}
              disabled={salvando}
              placeholder="Ex.: Aurora, Lucas, Sol..."
              maxLength={30}
              autoComplete="off"
            />

            {codinomeValido && (
              <FiCheckCircle className={styles.validIcon} />
            )}
          </div>

          <div className={styles.inputFooter}>
            <span>
              Use pelo menos 3 caracteres.
            </span>

            <span>
              {codinome.length}/30
            </span>
          </div>
        </div>

        <div className={styles.privacyNote}>
          <div className={styles.privacyIcon}>
            <FiCheckCircle size={18} />
          </div>

          <div>
            <strong>Seu nome não precisa aparecer aqui.</strong>

            <p>
              O codinome será utilizado para identificar você durante sua experiência na plataforma.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          onClick={logout}
          disabled={salvando}
          className={styles.logoutButton}
        >
          <FiLogOut size={17} />
          Sair
        </button>

        <button
          type="button"
          onClick={salvarCodinome}
          disabled={salvando || !codinomeValido}
          className={styles.saveButton}
        >
          <FiCheckCircle size={17} />

          {salvando ? 'Salvando...' : 'Continuar'}
        </button>
      </div>
    </Modal>
  );
}