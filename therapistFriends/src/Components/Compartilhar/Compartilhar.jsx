// src/Components/Compartilhar/Compartilhar.jsx

import React, { useState } from 'react';
import { CiShare2 } from 'react-icons/ci';
import { FiCheck, FiCopy } from 'react-icons/fi';
import styles from './Compartilhar.module.css';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'react-toastify';

const Compartilhar = () => {
  const { usuario } = useUser();
  const [copiado, setCopiado] = useState(false);

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const baseUrl = isLocalhost
    ? 'http://localhost:3000'
    : window.location.origin;

  
  const url = `${baseUrl}/agenda-paciente/${usuario?.perfil?.id}/${encodeURIComponent(
    usuario.nome
  )}`;

  const textoCompartilhar = `Confira a agenda de ${usuario.nome} em: ${url}`;

  const copiarParaAreaTransferencia = async (texto) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (err) {
        console.warn('Clipboard API falhou:', err);
      }
    }

    return new Promise((resolve) => {
      try {
        const textarea = document.createElement('textarea');

        textarea.value = texto;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(0, texto.length);

        const executado = document.execCommand('copy');

        document.body.removeChild(textarea);

        resolve(executado);
      } catch (err) {
        console.warn('execCommand falhou:', err);
        resolve(false);
      }
    });
  };

  const webShareDisponivel = () => {
    return (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ text: textoCompartilhar })
    );
  };

  const handleClick = async () => {
    if (webShareDisponivel()) {
      try {
        await navigator.share({
          title: 'Compartilhar Agenda',
          text: textoCompartilhar,
          url,
        });

        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.warn( 'Erro ao compartilhar via Web Share:', error );
      }
    }

    try {
      const sucesso = await copiarParaAreaTransferencia(url);

      if (sucesso) {
        setCopiado(true);

        setTimeout(() => {
          setCopiado(false);
        }, 2000);

        return;
      }

      toast.alert( `Não foi possível copiar automaticamente. Por favor, copie manualmente:\n\n${url}` );
    } catch (error) {
      console.error('Erro ao copiar:', error);

      toast.alert(`Erro ao copiar. Por favor, copie manualmente:\n\n${url}` );
    }
  };

  if (!usuario) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.texto}>
        <span className={styles.eyebrow}>
          AGENDA
        </span>

        <h2 className={styles.titulo}>
          Compartilhar agenda
        </h2>

        <p className={styles.descricao}>
          Envie seu link para que pacientes possam consultar seus horários.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={`${styles.botao} ${
          copiado ? styles.copiado : ''
        }`}
        title="Compartilhar agenda"
        aria-label="Compartilhar agenda"
      >
        {copiado ? (
          <>
            <FiCheck className={styles.icone} />
            <span>Copiado</span>
          </>
        ) : (
          <>
            <CiShare2 className={styles.icone} />
            <span>Compartilhar</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Compartilhar;