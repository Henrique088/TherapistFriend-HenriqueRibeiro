// src/Components/FormularioRelatos/FormularioRelatos.jsx

import React, { useState, useEffect } from 'react';
import styles from './FormularioRelatos.module.css';
import { toast } from 'react-toastify';
import EmojiPicker from '../../Utils/emojiPicker';
import { IoIosClose } from 'react-icons/io';
import api from '../../api/apiConfig';

const RelatoForm = ({ onCancel, onSubmit, relatoEditando }) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [relato, setRelato] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState('top-center');

  const categorias = [
    'Solidão',
    'Ansiedade',
    'Depressão',
    'Timidez',
    'Autoestima',
    'Saúde Mental',
    'Estresse',
    'Relacionamentos',
    'Transtornos Alimentares',
    'Transtornos de Aprendizagem',
    'Transtornos de Personalidade',
    'Transtornos de Humor',
    'Transtornos de Ansiedade',
    'Transtornos Obsessivo-Compulsivos',
    'Transtornos de Déficit de Atenção e Hiperatividade (TDAH)',
    'Outros'
  ];

  useEffect(() => {
    if (relatoEditando) {
      setTitulo(relatoEditando.titulo || '');
      setRelato(relatoEditando.texto || '');
      setCategoria(relatoEditando.categoria || '');
      setAnonimo(relatoEditando.anonimo || false);
    }
  }, [relatoEditando]);

  // Detecta tipo de tela e orientação
  useEffect(() => {
    const updateEmojiPosition = () => {
      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerWidth > window.innerHeight;

      if (isMobile && isLandscape) {
        setEmojiPosition('right-center');
      } else if (isMobile && !isLandscape) {
        setEmojiPosition('center');
      } else {
        setEmojiPosition('right-center');
      }
    };

    updateEmojiPosition();

    window.addEventListener('resize', updateEmojiPosition);
    window.addEventListener('orientationchange', updateEmojiPosition);

    return () => {
      window.removeEventListener('resize', updateEmojiPosition);
      window.removeEventListener('orientationchange', updateEmojiPosition);
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    setRelato((prevMessage) => prevMessage + emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enviando) return;

    setEnviando(true);

    try {
      const dadosRelato = {
        titulo,
        categoria,
        texto: relato,
        anonimo
      };

      let response;

      if (relatoEditando) {
        response = await api.put(
          `/relato/${relatoEditando.id}`,
          dadosRelato
        );
      } else {
        response = await api.post(
          '/relato/',
          dadosRelato
        );
      }

      const data = response.data;

      setRelato('');
      setTitulo('');
      setCategoria('');
      setAnonimo(false);

      if (onSubmit) {
        onSubmit(
          data,
          relatoEditando ? 'editado' : 'criado'
        );
      }

      onCancel();

      toast.success(
        relatoEditando
          ? 'Relato editado com sucesso!'
          : 'Relato enviado com sucesso!'
      );

    } catch (error) {

    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>

      <div className={styles.formContainer}>

        {/* Cabeçalho */}
        <div className={styles.formHeader}>

          <div>
            <span className={styles.eyebrow}>
              {relatoEditando ? 'EDITAR' : 'NOVO RELATO'}
            </span>

            <h1>
              {relatoEditando
                ? 'Editar relato'
                : 'Escrever novo relato'}
            </h1>

            <p>
              Compartilhe o que está acontecendo com você.
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            disabled={enviando}
            aria-label="Fechar formulário"
          >
            <IoIosClose />
            
          </button>

        </div>

        {/* Formulário */}
        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >

          {/* Título */}
          <div className={styles.formGroup}>

            <label htmlFor="titulo">
              Título
            </label>

            <input
              id="titulo"
              type="text"
              placeholder="Ex.: Pressão no trabalho"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              disabled={enviando}
            />

          </div>


          {/* Categoria */}
          <div className={styles.formGroup}>

            <label htmlFor="categoria">
              Categoria
            </label>

            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              disabled={enviando}
            >
              <option value="">
                Selecione uma categoria
              </option>

              {categorias.map((cat, index) => (
                <option
                  key={index}
                  value={cat}
                >
                  {cat}
                </option>
              ))}
            </select>

          </div>


          {/* Relato */}
          <div className={styles.formGroup}>

            <div className={styles.labelRow}>
              <label htmlFor="relato">
                Relato
              </label>

              <span>
                Conte no seu ritmo
              </span>
            </div>

            <textarea
              id="relato"
              placeholder="Descreva o que você está sentindo ou vivendo..."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
              rows={7}
              required
              disabled={enviando}
            />

            <div className={styles.helperText}>
              Você pode escrever livremente. Não é necessário
              organizar seus pensamentos de uma forma específica.
            </div>

          </div>


          {/* Emoji */}
          <div className={styles.emojiWrapper}>
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              position={emojiPosition}
            />
          </div>


          {/* Anonimato */}
          <div className={styles.anonymousBox}>

            <label className={styles.anonymousLabel}>

              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) =>
                  setAnonimo(e.target.checked)
                }
                disabled={enviando}
              />

              <span className={styles.customCheckbox}></span>

              <span className={styles.anonymousText}>
                <strong>
                  Compartilhar de forma anônima
                </strong>

                <small>
                  {/* Seu nome não será associado publicamente
                  a este relato. */}
                  Seu relato ficará visível apenas para os profissionais
                </small>
              </span>

            </label>

          </div>


          {/* Ações */}
          <div className={styles.formActions}>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={enviando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={enviando}
            >
              {enviando
                ? 'Enviando...'
                : relatoEditando
                  ? 'Atualizar relato'
                  : 'Enviar relato'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default RelatoForm;