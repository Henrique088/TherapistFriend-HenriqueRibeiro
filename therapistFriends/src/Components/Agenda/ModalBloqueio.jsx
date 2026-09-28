// src/Components/Agenda/ModalBloqueio.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import moment from 'moment';
import styles from './ModalBloqueio.module.css';
import { IoIosClose } from 'react-icons/io';
import { FcLock } from 'react-icons/fc';
import { TiStar } from "react-icons/ti";

Modal.setAppElement('#root');

const ModalBloqueio = ({
  visible,
  onClose,
  onRemover,
  onSalvarBloqueio,
  onAdicionarExcecao,
  loading,
  slot
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    dataInicio: moment(),
    dataFim: moment().add(1, 'hour'),
    recorrente: false,
    diasSemana: [],
    tipo: 'comum'
  });

  const isEdicao = slot?.tipo === 'bloqueio';

  useEffect(() => {
    if (slot) {
      setFormData({
        titulo: slot.title || '',
        dataInicio: moment(slot.start),
        dataFim: moment(slot.end),
        recorrente: slot.recorrente || false,
        diasSemana: slot.diasSemana || [],
        tipo: slot.resource?.tipo || 'comum'
      });
    }
  }, [slot, visible]);

  const handleTimeChange = (field, timeString) => {
    const [hours, minutes] = timeString.split(':');

    const newMoment = formData[field]
      .clone()
      .hour(hours)
      .minute(minutes)
      .second(0);

    setFormData(prev => ({
      ...prev,
      [field]: newMoment
    }));
  };

  const handleDiasRecorrenciaChange = (e) => {
    const { value, checked } = e.target;

    let dias = [...formData.diasSemana];

    if (checked) {
      dias.push(value);
    } else {
      dias = dias.filter(dia => dia !== value);
    }

    setFormData(prev => ({ ...prev, diasSemana: dias }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataInicioFormatada =
      moment(formData.dataInicio).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

    const dataFimFormatada =
      moment(formData.dataFim).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

    onSalvarBloqueio({
      id: slot?.id,
      titulo: formData.titulo || 'Bloqueio de Agenda',
      dataInicio: dataInicioFormatada,
      dataFim: dataFimFormatada,
      recorrente: formData.recorrente,
      diasSemana: formData.diasSemana,
      tipo: formData.tipo
    });
  };

  const diasSemana = [
    { label: 'Dom', value: '0' },
    { label: 'Seg', value: '1' },
    { label: 'Ter', value: '2' },
    { label: 'Qua', value: '3' },
    { label: 'Qui', value: '4' },
    { label: 'Sex', value: '5' },
    { label: 'Sáb', value: '6' }
  ];

  return (
    <Modal
      isOpen={visible}
      onRequestClose={onClose}
      className={styles.modalBloqueio}
      overlayClassName={styles.overlayBloqueio}
      contentLabel={isEdicao ? 'Gerenciar bloqueio' : 'Novo bloqueio'}
    >
      <div className={styles.modalHeader}>
        <div>
          <span className={styles.eyebrow}>
            AGENDA
          </span>

          <h2>
            {isEdicao ? 'Gerenciar bloqueio' : 'Novo bloqueio'}
          </h2>

          <p>
            {isEdicao
              ? 'Atualize ou gerencie este período da sua agenda.'
              : 'Defina um período em que você não estará disponível.'
            }
          </p>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar"
        >
          <IoIosClose />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className={styles.modalForm}
      >
        {/* Título */}

        <div className={styles.formGroup}>
          <label htmlFor="titulo">
            Motivo do bloqueio
          </label>

          <input
            id="titulo"
            type="text"
            placeholder="Ex.: Almoço, reunião, compromisso..."
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
          />
        </div>

        {/* Horários */}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Período</h3>
              <p>Defina o horário que ficará indisponível.</p>
            </div>
          </div>

          <div className={styles.timeInputsContainer}>
            <div className={styles.formGroup}>
              <label htmlFor="inicio">
                Início
              </label>

              <input
                id="inicio"
                type="time"
                value={formData.dataInicio.format('HH:mm')}
                onChange={(e) =>
                  handleTimeChange( 'dataInicio', e.target.value )
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fim">
                Fim
              </label>

              <input
                id="fim"
                type="time"
                value={formData.dataFim.format('HH:mm')}
                onChange={(e) => handleTimeChange( 'dataFim', e.target.value ) }
                required
              />
            </div>
          </div>
        </div>

        {/* Tipo */}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Tipo de bloqueio</h3>
              <p>Escolha como este horário será tratado.</p>
            </div>
          </div>

          <div className={styles.tipoOptions}>

            <label
              className={`${styles.tipoOption} ${formData.tipo === 'comum'
                  ? styles.tipoOptionActive
                  : ''
                }`}
            >
              <input
                type="radio"
                name="tipoBloqueio"
                value="comum"
                checked={formData.tipo === 'comum'}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
              />

              <span className={styles.tipoIcon}>
                <FcLock />
              </span>

              <span className={styles.tipoContent}>
                <strong>Bloqueio comum</strong>
                <small>
                  Horário indisponível para consultas.
                </small>
              </span>

              <span className={styles.radioIndicator} />
            </label>

            <label
              className={`${styles.tipoOption} ${formData.tipo === 'estrategico'
                  ? styles.tipoOptionStrategic
                  : ''
                }`}
            >
              <input
                type="radio"
                name="tipoBloqueio"
                value="estrategico"
                checked={formData.tipo === 'estrategico'}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
              />

              <span className={styles.tipoIcon}>
                <TiStar />
              </span>

              <span className={styles.tipoContent}>
                <strong>Horário estratégico</strong>
                <small>
                  Pode ser liberado para pacientes com urgência aprovada.
                </small>
              </span>

              <span className={styles.radioIndicator} />
            </label>
          </div>

          {formData.tipo === 'estrategico' && (
            <div className={styles.infoText}>
              <span className={styles.infoIcon}>i</span>

              <span>
                Este horário poderá ser ocupado por pacientes com uma solicitação de urgência aprovada.
              </span>
            </div>
          )}
        </div>

        {/* Recorrência */}

        {!isEdicao && (
          <div className={styles.section}>
            <div className={styles.recorrenciaHeader}>
              <div>
                <h3>Repetição semanal</h3>
                <p>
                  Use esta opção para bloquear o mesmo horário toda semana.
                </p>
              </div>

              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.recorrente}
                  onChange={(e) =>
                    setFormData({ ...formData, recorrente: e.target.checked })
                  }
                />

                <span className={styles.switchSlider} />
              </label>
            </div>

            {formData.recorrente && (
              <div className={styles.diasBox}>
                <span className={styles.diasLabel}>
                  Repetir em
                </span>

                <div className={styles.diasContainer}>
                  {diasSemana.map((dia) => (
                    <label
                      key={dia.value}
                      className={`${styles.diaItem} ${formData.diasSemana.includes(dia.value)
                          ? styles.diaSelecionado
                          : ''
                        }`}
                    >
                      <input
                        type="checkbox"
                        value={dia.value}
                        checked={formData.diasSemana.includes( dia.value )}
                        onChange={handleDiasRecorrenciaChange}
                      />

                      {dia.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ações */}

        <div className={styles.modalFooter}>
          {isEdicao && (
            <button
              type="button"
              className={styles.excecaoButton}
              onClick={() => onAdicionarExcecao(slot)}
              disabled={loading}
            >
              Liberar hoje
            </button>
          )}

          <div className={styles.footerRight}>
            <button
              type="button"
              className={styles.cancelarButton}
              onClick={onClose}
            >
              Cancelar
            </button>

            {isEdicao && (
              <button
                type="button"
                className={styles.removerButton}
                onClick={() => onRemover(slot.id)}
                disabled={loading}
              >
                Excluir bloqueio
              </button>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : isEdicao
                  ? 'Salvar alterações'
                  : 'Criar bloqueio'
              }
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModalBloqueio;