// src/pages/Perfil/PerfilPaciente.jsx

import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './Perfil.module.css';
import image_default from '../../img/imagem_default.png';
import { toast } from 'react-toastify';
import api from '../../api/apiConfig';

import { FiUser, FiPhone, FiAtSign, FiEdit3, FiCheck } from 'react-icons/fi';

export default function PerfilPaciente() {
    const { usuario, fetchUsuario } = useUser();

    const [salvando, setSalvando] = useState(false);
    const [editando, setEditando] = useState(false);

    const [form, setForm] = useState({
        nome: usuario?.nome || '',
        telefone: usuario?.telefone || '',
        codinome: usuario?.perfil?.codinome || ''
    });

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const formatarTelefone = (telefone = '') => {
        return telefone
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    };

    useEffect(() => {
        setForm({
            nome: usuario?.nome || '',
            telefone: usuario?.telefone || '',
            codinome: usuario?.perfil?.codinome || ''
        });
    }, [usuario, editando]);

    const atualizarDados = async (e) => {
        e.preventDefault();

        const dadosAtualizados = {
            codinome:
                form.codinome.trim() ||
                usuario?.perfil?.codinome,

            telefone:
                form.telefone.trim() ||
                usuario?.telefone,

            nome:
                form.nome.trim() ||
                usuario?.nome
        };

        if (
            !dadosAtualizados.codinome?.trim() ||
            dadosAtualizados.codinome.trim().length < 3
        ) {
            toast.error('Codinome deve ter pelo menos 3 caracteres' );
            return;
        }

        setSalvando(true);

        try {
            const response = await api.put('/pacientes/atualizar', dadosAtualizados);

            localStorage.setItem( 'info',JSON.stringify(response.data.info) );

            toast.success( 'Dados atualizados com sucesso!');

            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );

            await fetchUsuario();

            setEditando(false);

        } catch (error) {
            toast.error( error.response?.data?.erro || 'Erro ao atualizar os dados do perfil.' );

            console.error( 'Erro ao atualizar perfil:', error );

        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className={styles.containerPerfil}>

            <MenuLateral />

            <main className={styles.conteudoPerfil}>

                {/* CABEÇALHO */}
                <header className={styles.topoPerfil}>

                    <div>
                        <span className={styles.eyebrow}>
                            Minha conta
                        </span>

                        <h1>Meu perfil</h1>

                        <p>
                            Gerencie suas informações pessoais
                            e sua identidade na plataforma.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.botaoEditarTopo}
                        onClick={() => setEditando(true)}
                    >
                        <FiEdit3 />
                        Editar perfil
                    </button>

                </header>

                {/* IDENTIDADE */}
                <section className={styles.identidadePerfil}>

                    <div className={styles.avatarPerfil}>

                        <img
                            src={ usuario?.foto || image_default }
                            alt="Foto de perfil"
                        />

                    </div>

                    <div className={styles.identidadeInfo}>

                        <h2>
                            {usuario?.nome || 'Usuário'}
                        </h2>

                        <span>
                            Paciente
                        </span>

                        <p>
                            Seu perfil é utilizado para
                            identificação dentro da plataforma.
                        </p>

                    </div>

                </section>

                {/* NAVEGAÇÃO */}
                <nav className={styles.navegacaoPerfil}>

                    <button
                        type="button"
                        className={!editando
                            ? styles.navegacaoAtiva
                            : ''
                        }
                        onClick={() => setEditando(false) }
                    >
                        Informações
                    </button>

                    <button
                        type="button"
                        className={editando
                            ? styles.navegacaoAtiva
                            : ''
                        }
                        onClick={() => setEditando(true) }
                    >
                        Editar perfil
                    </button>

                </nav>

                {!editando ? (

                    /* =========================
                       VISUALIZAÇÃO
                    ========================== */

                    <section className={styles.secaoPerfil}>

                        <div className={styles.tituloSecao}>
                            <div>
                                <h2>
                                    Informações pessoais
                                </h2>

                                <p>
                                    Dados cadastrados na sua conta.
                                </p>
                            </div>
                        </div>

                        <div className={styles.listaInformacoes}>

                            <div className={styles.informacaoItem}>

                                <div className={styles.iconeInformacao}>
                                    <FiUser />
                                </div>

                                <div>
                                    <span>Nome completo</span>

                                    <strong>
                                        {usuario?.nome ||
                                            'Não informado'}
                                    </strong>
                                </div>

                            </div>

                            <div className={styles.informacaoItem}>

                                <div className={styles.iconeInformacao}>
                                    <FiPhone />
                                </div>

                                <div>
                                    <span>
                                        Telefone
                                    </span>

                                    <strong>
                                        {usuario?.telefone
                                            ? formatarTelefone(
                                                usuario.telefone
                                            )
                                            : 'Não informado'}
                                    </strong>
                                </div>

                            </div>

                            <div className={styles.informacaoItem}>

                                <div className={styles.iconeInformacao}>
                                    <FiAtSign />
                                </div>

                                <div>
                                    <span>
                                        Codinome
                                    </span>

                                    <strong>
                                        {usuario?.perfil?.codinome || 'Não informado'}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        {/* PRIVACIDADE */}
                        <div className={styles.privacidadeBox}>

                            <div className={styles.privacidadeIcon}>
                                <FiCheck />
                            </div>

                            <div>
                                <strong>
                                    Sua identidade continua protegida
                                </strong>

                                <p>
                                    O codinome permite que você
                                    participe das interações da
                                    plataforma preservando sua
                                    identidade.
                                </p>
                            </div>

                        </div>

                    </section>

                ) : (

                    /* =========================
                       EDIÇÃO
                    ========================== */

                    <section className={styles.secaoPerfil}>

                        <div className={styles.tituloSecao}>
                            <div>
                                <h2>
                                    Editar informações
                                </h2>

                                <p>
                                    Atualize os dados da sua conta.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={atualizarDados}
                            className={styles.formPerfil}
                        >

                            <div className={styles.campoGrupo}>

                                <label htmlFor="nome">
                                    Nome completo
                                </label>

                                <div className={styles.inputWrapper}>

                                    <FiUser />

                                    <input
                                        id="nome"
                                        type="text"
                                        name="nome"
                                        value={form.nome}
                                        onChange={handleChange}
                                        placeholder="Digite seu nome"
                                    />

                                </div>

                            </div>

                            <div className={styles.campoGrupo}>

                                <label htmlFor="telefone">
                                    Telefone / WhatsApp
                                </label>

                                <div className={styles.inputWrapper}>

                                    <FiPhone />

                                    <input
                                        id="telefone"
                                        type="text"
                                        name="telefone"
                                        value={formatarTelefone(
                                            form.telefone
                                        )}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                    />

                                </div>

                            </div>

                            <div className={styles.campoGrupo}>

                                <label htmlFor="codinome">
                                    Codinome
                                </label>

                                <div className={styles.inputWrapper}>

                                    <FiAtSign />

                                    <input
                                        id="codinome"
                                        type="text"
                                        name="codinome"
                                        value={form.codinome}
                                        onChange={handleChange}
                                        placeholder="Escolha seu codinome"
                                    />

                                </div>

                                <small>
                                    Seu codinome será utilizado
                                    para preservar sua identidade
                                    dentro da plataforma.
                                </small>

                            </div>

                            <div className={styles.acoesFormulario}>

                                <button
                                    type="button"
                                    className={styles.botaoCancelar}
                                    onClick={() =>
                                        setEditando(false)
                                    }
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={styles.botaoSalvar}
                                    disabled={salvando}
                                >
                                    <FiCheck />

                                    {salvando
                                        ? 'Salvando...'
                                        : 'Salvar alterações'}
                                </button>

                            </div>

                        </form>

                    </section>

                )}

            </main>

        </div>
    );
}