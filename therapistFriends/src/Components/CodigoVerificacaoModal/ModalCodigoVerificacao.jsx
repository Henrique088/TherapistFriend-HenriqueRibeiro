// src/Components/CodigoVerificacaoModal/ModalCodigoVerificacao.jsx

import { useEffect, useRef, useState } from "react";
import styles from "./ModalCodigoVerificacao.module.css";
import api from "../../api/apiConfig";
import { toast } from "react-toastify";

export default function CodigoVerificacaoModal({ 
  telefone, 
  email,
  tipo = "email", // "email" ou "sms"
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [tempo, setTempo] = useState(600);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const envioInicialFeito = useRef(false);

  const baseUrlEnviar = `/usuarios/${email}/enviar-codigo/${tipo}`;
  const baseUrlValidar = `/usuarios/${email}/validar-codigo/${tipo}`;

  // ================================
  // ENVIO AUTOMÁTICO AO ABRIR MODAL
  // ================================
  useEffect(() => {
    if (!isOpen) return;

    if (envioInicialFeito.current) return;
    envioInicialFeito.current = true;

    async function enviarCodigoInicial() {
      try {
        await api.post(baseUrlEnviar);
        toast.info(`Enviamos um código para seu ${tipo === "email" ? "e-mail" : "telefone"}!`);
        inputsRef.current[0]?.focus();
      } catch (error) {
    
      }
    }
    enviarCodigoInicial();
  }, [isOpen, baseUrlEnviar, tipo]);

  // ================================
  // RESET TIMER
  // ================================
  useEffect(() => {
    if (!isOpen) return;

    setTempo(600);

    const interval = setInterval(() => {
      setTempo((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = () => {
    const min = String(Math.floor(tempo / 60)).padStart(2, "0");
    const sec = String(tempo % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  function handleDigit(index, value) {
    if (!/^[0-9]?$/.test(value)) return;
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleBackspace(index, value) {
    if (value === "" && index > 0) inputsRef.current[index - 1]?.focus();
  }

  // ================================
  // VALIDAR CÓDIGO
  // ================================
  async function validarCodigo() {
    const finalCode = codigo.join("");
    if (finalCode.length < 6) return toast.error("Digite o código completo.");

    setLoading(true);
    try {
      await api.post(baseUrlValidar, {
        codigo: finalCode,
      });

      toast.success(`${tipo === "email" ? "E-mail" : "Telefone"} verificado com sucesso!`);
      setCodigo(["", "", "", "", "", ""]);
      envioInicialFeito.current = false;
      onSuccess();

    } catch (error) {
      setCodigo(["", "", "", "", "", ""]);
      toast.error(error.response?.data?.msg || "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  // ================================
  // REENVIAR CÓDIGO
  // ================================
  async function reenviarCodigo() {
    setReenviando(true);
    try {
      await api.post(baseUrlEnviar);
      toast.success("Código reenviado!");
      setCodigo(["", "", "", "", "", ""]);
      setTempo(600);
      inputsRef.current[0]?.focus();
    } catch (error) {
      toast.error("Erro ao reenviar.");
    } finally {
      setReenviando(false);
    }
  }

  // Reset ao fechar modal
  if (!isOpen) {
    envioInicialFeito.current = false;
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          Verificar {tipo === "email" ? "E-mail" : "Telefone"}
        </h2>

        <p className={styles.text}>Enviamos um código para:</p>
        <strong className={styles.email}>{tipo === "email" ? email : telefone}</strong>

        <p className={styles.timer}>
          Expira em <span>{formatTime()}</span>
        </p>

        <div className={styles.codeContainer}>
          {codigo.map((value, i) => (
            <input
              key={i}
              maxLength={1}
              value={value}
              ref={(el) => (inputsRef.current[i] = el)}
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace") handleBackspace(i, value);
              }}
              className={styles.codeBox}
            />
          ))}
        </div>

        <button className={styles.btnConfirmar} onClick={validarCodigo} disabled={loading}>
          {loading ? "Validando..." : "Confirmar"}
        </button>

        <button
          className={styles.btnReenviar}
          onClick={reenviarCodigo}
          disabled={reenviando || tempo > 550}
        >
          {reenviando ? "Reenviando..." : "Reenviar código"}
        </button>

        <button className={styles.btnCancelar} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
