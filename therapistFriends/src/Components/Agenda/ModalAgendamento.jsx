// src/Components/Agenda/ModalAgendamento.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useUser } from '../../contexts/UserContext';
import { AgendaService } from '../../api/agendaService';
import moment from 'moment';
import styles from './ModalAgendamento.module.css';
import { CiClock2 } from 'react-icons/ci';
import { GiCheckMark } from 'react-icons/gi';
import { IoIosClose } from 'react-icons/io';

Modal.setAppElement('#root');

const ModalAgendamento = ({
  profissionalId,
  slot,
  onClose,
  onAgendamentoConcluido
}) => {
  const [motivo, setMotivo] = useState('');
  const { usuario } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataInicioFormatada =
        moment(slot.start).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      const dataFimFormatada =
        moment(slot.end).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      const agendamentoData = {
        profissionalId: profissionalId,
        pacienteId: usuario?.perfil?.id,
        dataInicio: dataInicioFormatada,
        dataFim: dataFimFormatada,
        observacoes: motivo,
      };

      await AgendaService.agendamento(agendamentoData);

      toast.success('Agendamento solicitado com sucesso!');

      onAgendamentoConcluido();
    } catch (error) {
      console.error('Erro ao solicitar agendamento:', error);

      // toast.error( error.response?.data?.erro || 'Não foi possível solicitar o agendamento.' );
    }
  };

  const formatarHorario = (data) => {
    return moment(data).format('HH:mm');
  };

  const formatarData = (data) => {
    return moment(data).format('DD/MM/YYYY');
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className={styles.modalAgendamento}
      overlayClassName={styles.overlayAgendamento}
      contentLabel="Agendar horário"
    >
      <div className={styles.modalHeader}>
        <div>
          <span className={styles.eyebrow}>
            NOVO AGENDAMENTO
          </span>

          <h2>Agendar consulta</h2>

          <p>
            Confirme os dados abaixo para solicitar este horário.
          </p>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <IoIosClose />
        </button>
      </div>

      <div className={styles.horarioSelecionado}>
        <div className={styles.horarioIcone}>
          <span><CiClock2 /></span>
        </div>

        <div className={styles.horarioInfo}>
          <span className={styles.horarioLabel}>
            Horário selecionado
          </span>

          <strong>
            {formatarData(slot.start)}
          </strong>

          <span>
            {formatarHorario(slot.start)} — {formatarHorario(slot.end)}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={styles.formulario}
      >
        <div className={styles.formGroup}>
          <label htmlFor="codinome">
            Seu codinome
          </label>

          <div className={styles.campoCodinome}>
            <span className={styles.campoIcone}>
              @
            </span>

            <input
              id="codinome"
              type="text"
              value={usuario?.perfil?.codinome || ''}
              disabled
              className={styles.codinome}
            />
          </div>

          <small>
            Seu codinome será utilizado durante o atendimento.
          </small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="motivo">
            Observação
            <span className={styles.opcional}>
              opcional
            </span>
          </label>

          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Escreva algo que considere importante compartilhar antes da consulta..."
            rows={5}
          />

          <small>
            Você pode deixar este campo em branco.
          </small>
        </div>

        <div className={styles.divisor} />

        <div className={styles.privacidade}>
          <div className={styles.privacidadeIcone}>
            <GiCheckMark />
          </div>

          <div>
            <strong>Atendimento privado</strong>

            <p>
              Sua solicitação será enviada ao profissional responsável pela agenda.
            </p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onClose}
            className={styles.btnCancel}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={styles.btnConfirm}
          >
            Confirmar agendamento
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalAgendamento;