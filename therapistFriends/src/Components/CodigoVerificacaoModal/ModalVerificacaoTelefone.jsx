// src/Components/CodigoVerificacaoModal/ModalVerificacaoTelefone.jsx

import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import styles from "./ModalVerificacaoTelefone.module.css";
import api from "../../api/apiConfig";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

export default function ModalVerificacaoTelefone({
  isOpen,
  onClose,
  telefoneInicial,
  onCancel, 
}) {
  const [telefone, setTelefone] = useState(telefoneInicial || "");
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quando abrir modal, limpa estado
  useEffect(() => {
    if (!isOpen) return;
    setTelefone(telefoneInicial || "");
    setCodigo(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);


    async function verificarOuReenviar() {
    try {
      await api.post("/verificar/sms/validar-expiracao", {
        telefone: telefoneInicial,
      });

      // Se o código atual ainda serve → ok
      // Se não servir → backend envia um novo automaticamente
    } catch (err) {
    
    }
  }

  verificarOuReenviar();
    

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, telefoneInicial]);

  // Lógica dos números
  function handleChange(value, index) {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...codigo];
    updated[index] = value;
    setCodigo(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  }

  function handleBackspace(e, index) {
    if (e.key === "Backspace" && codigo[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }

  // Validar código
  async function validarCodigo() {
    const codigoFinal = codigo.join("");

    if (codigoFinal.length < 6) {
      return toast.error("Digite todos os 6 dígitos.");
    }

    try {
      setLoading(true);

      await api.post("/verificar/sms/validar", {
        telefone,
        codigo: codigoFinal,
      });

      toast.success("Telefone validado com sucesso!");
      onClose(); // fecha modal → segue fluxo

    } catch (err) {
      toast.error(err.response?.data?.msg || "Código incorreto.");
    } finally {
      setLoading(false);
    }
  }

  // Reenviar código
  async function reenviarCodigo() {
    if (!telefone) return toast.error("Digite um telefone válido.");

    try {
      setCanResend(false);
      setTimer(60);
      setCodigo(["", "", "", "", "", ""]);

      await api.post("/verificar/sms/enviar", { telefone });

      toast.success("Novo código enviado!");
      inputsRef.current[0].focus();

    } catch (err) {
      toast.error("Erro ao reenviar código.");
      setCanResend(true);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {}}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <h2 className={styles.titulo}>Validar Telefone</h2>

      <p className={styles.subtitulo}>Digite ou altere o telefone:</p>

      {/* --- EDITAR TELEFONE --- */}
      <input
        type="text"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(xx) xxxxx-xxxx"
        className={styles.inputTelefone}
        autoComplete="off"
      />

      <p className={styles.subtitulo}>
        Enviamos um código para <strong>{telefone}</strong>
      </p>

      {/* --- CÓDIGO 6 DIGITOS --- */}
      <div className={styles.inputGroup}>
        {codigo.map((value, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            maxLength="1"
            value={value}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleBackspace(e, i)}
            className={styles.codeInput}
            autoComplete="one-time-code"
            inputMode="numeric"
          />
        ))}
      </div>

      <button
        className={styles.botaoConfirmar}
        onClick={validarCodigo}
        disabled={loading}
        

      >
        {loading ? "Validando..." : "Confirmar"}
      </button>

      <div className={styles.timerArea}>
        {timer > 0 ? (
          <span className={styles.timerText}>
            Reenviar código em {timer}s
          </span>
        ) : (
          <button
            className={styles.reenviarBtn}
            onClick={reenviarCodigo}
            disabled={!canResend}
          >
            Reenviar código
          </button>
        )}
      </div>

      {/* --- BOTÃO PARA VOLTAR AO LOGIN --- */}
      <button
        className={styles.cancelarBtn}
        onClick={onCancel}
      >
        Cancelar e voltar ao login
      </button>
    </Modal>
  );
}
