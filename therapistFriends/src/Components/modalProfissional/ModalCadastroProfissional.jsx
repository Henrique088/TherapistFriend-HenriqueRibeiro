import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Navigate } from 'react-router-dom';
import {
  FiUser,
  FiFileText,
  FiBookOpen,
  FiLogOut,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import './ModalCadastroProfissional.css';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/apiConfig';

Modal.setAppElement('#root');

export default function ModalCadastroProfissional({ isOpen, onClose }) {
  const [salvando, setSalvando] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);

  const { usuario, setUsuario } = useUser();

  const [redirect, setRedirect] = useState(null);

  const [listaEspecialidades, setListaEspecialidades] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  const [form, setForm] = useState({
    cpf: '',
    crp: '',
    bio: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const carregarEspecialidades = async () => {
      try {
        const { data } = await api.get('/especialidade');
        setListaEspecialidades(data);
      } catch (error) {
        toast.error('Não foi possível carregar as especialidades.');
      }
    };

    carregarEspecialidades();

    if (usuario) {
      setForm({
        cpf: usuario.perfil?.cpf || '',
        crp: usuario.perfil?.crp || '',
        bio: usuario.perfil?.bio || '',
      });

      if (usuario.perfil?.especialidades) {
        setSelecionadas(
          usuario.perfil.especialidades.map((esp) => esp.id)
        );
      }
    }
  }, [isOpen, usuario]);

  const toggleEspecialidade = (id) => {
    setSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');

    if (
      cpf.length !== 11 ||
      /^(\d)\1{10}$/.test(cpf)
    ) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum +=
        parseInt(cpf.substring(i - 1, i)) *
        (11 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder >= 10) {
      remainder = 0;
    }

    if (
      remainder !==
      parseInt(cpf.substring(9, 10))
    ) {
      return false;
    }

    sum = 0;

    for (let i = 1; i <= 10; i++) {
      sum +=
        parseInt(cpf.substring(i - 1, i)) *
        (12 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder >= 10) {
      remainder = 0;
    }

    if (
      remainder !==
      parseInt(cpf.substring(10, 11))
    ) {
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeCpf = (e) => {
    const val = e.target.value;

    setForm({
      ...form,
      cpf: val,
    });

    setCpfValido(validateCPF(val));
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(
        /(\d{3})(\d{1,2})$/,
        '$1-$2'
      );
  };

  const SalvarDados = async (event) => {
    event.preventDefault();

    if (!cpfValido) {
      return toast.error('CPF inválido.');
    }

    if (selecionadas.length === 0) {
      return toast.error(
        'Selecione ao menos uma especialidade.'
      );
    }

    setSalvando(true);

    try {
      const dadosProfissional = {
        cpf: formatCPF(form.cpf),
        crp: form.crp.toUpperCase(),
        bio: form.bio.trim(),
        especialidadesIds: selecionadas,
      };

      await api.put(
        '/profissionais/completar-perfil',
        dadosProfissional
      );

      toast.success(
        'Dados enviados para análise!'
      );

      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.erro ||
          'Erro ao salvar dados'
      );
    } finally {
      setSalvando(false);
    }
  };

  async function logout() {
    try {
      await api.post('/auth/logout');
      setUsuario(null);
      setRedirect(true);
    } catch {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  /*
   * CADASTRO EM ANÁLISE
   */
  if (
    usuario?.perfil?.status === 'em_analise' &&
    usuario?.perfil?.validado === false
  ) {
    return (
      <div className="aguarde-validacao">
        <div className="aguarde-card">
          <div className="status-icon status-icon-analysis">
            <FiAlertCircle />
          </div>

          <span className="status-eyebrow">
            THERAPISTFRIEND
          </span>

          <h2>Cadastro em análise</h2>

          <p>
            Recebemos seus dados profissionais e eles
            estão sendo analisados pela nossa equipe.
          </p>

          <div className="analysis-info">
            <FiCheck />

            <span>
              Você poderá acessar a plataforma
              normalmente após a validação.
            </span>
          </div>

          <button
            onClick={logout}
            className="sair-btn"
          >
            <FiLogOut />
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-profissional"
      overlayClassName="overlay"
    >
      <div className="modal-header">
        <div>
          <span className="modal-eyebrow">
            PERFIL PROFISSIONAL
          </span>

          <h2>
            {usuario?.perfil?.admin_id === false
              ? 'Corrija seus dados'
              : 'Complete seu perfil'}
          </h2>

          <p>
            Preencha suas informações profissionais
            para enviar seu perfil para análise.
          </p>
        </div>

        <div className="modal-brand-mark">
          <span>TF</span>
        </div>
      </div>

      {usuario?.perfil?.status === 'revogado' &&
        usuario?.perfil?.motivo && (
          <div className="revogado-motivo">
            <div className="revogado-icon">
              <FiAlertCircle />
            </div>

            <div>
              <strong>
                Seu cadastro precisa de ajustes
              </strong>

              <p>
                {usuario.perfil.motivo}
              </p>
            </div>
          </div>
        )}

      <form
        onSubmit={SalvarDados}
        className="form-profissional"
      >
        <div className="form-field">
          <label htmlFor="cpf">
            CPF
          </label>

          <div className="field-wrapper">
            <FiUser />

            <input
              id="cpf"
              name="cpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleChangeCpf}
              maxLength={14}
              required
            />
          </div>

          {!cpfValido && form.cpf.length > 0 && (
            <span className="error-text">
              CPF inválido
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="crp">
            CRP
          </label>

          <div className="field-wrapper">
            <FiFileText />

            <input
              id="crp"
              name="crp"
              placeholder="Ex.: 12/12345"
              value={form.crp}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="bio">
            Sobre sua atuação
          </label>

          <div className="textarea-wrapper">
            <FiBookOpen />

            <textarea
              id="bio"
              name="bio"
              placeholder="Conte brevemente sobre sua experiência, abordagem e área de atuação..."
              value={form.bio}
              onChange={handleChange}
              required
            />
          </div>

          <span className="field-hint">
            Uma breve apresentação ajuda as pessoas a
            conhecerem melhor seu perfil.
          </span>
        </div>

        <div className="especialidades-section">
          <div className="especialidades-heading">
            <div>
              <label>
                Especialidades
              </label>

              <span>
                Selecione uma ou mais áreas de atuação.
              </span>
            </div>

            <strong>
              {selecionadas.length} selecionada
              {selecionadas.length !== 1
                ? 's'
                : ''}
            </strong>
          </div>

          <div className="chips-container">
            {listaEspecialidades.map((esp) => {
              const ativa = selecionadas.includes(
                esp.id
              );

              return (
                <button
                  type="button"
                  key={esp.id}
                  className={`chip ${
                    ativa ? 'active' : ''
                  }`}
                  onClick={() =>
                    toggleEspecialidade(esp.id)
                  }
                >
                  {ativa && <FiCheck />}
                  {esp.nome}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={logout}
            className="sair-btn"
          >
            <FiLogOut />
            Sair
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={
              salvando || !cpfValido
            }
          >
            {salvando
              ? 'Enviando...'
              : 'Enviar para análise'}
          </button>
        </div>
      </form>
    </Modal>
  );
}