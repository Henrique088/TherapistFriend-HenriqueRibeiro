// src/pages/Perfil/PerfilProfissional.jsx

import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import MenuLateral from '../../Components/Menu/MenuLateral';
import styles from './Perfil.module.css';
import image_default from '../../img/imagem_default.png';
import { toast } from 'react-toastify';
import api from '../../api/apiConfig';

import { FiUser, FiPhone, FiCreditCard, FiAward, FiEdit3, FiCheck, FiBriefcase } from 'react-icons/fi';

export default function PerfilProfissional() {

    const { usuario, fetchUsuario } = useUser();

    const [salvando, setSalvando] = useState(false);
    const [editando, setEditando] = useState(false);

    const [listaEspecialidades, setListaEspecialidades] =
        useState([]);

    const [selecionadas, setSelecionadas] =
        useState([]);

    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        cpf: '',
        crp: '',
        bio: ''
    });

    /* =========================
       ESPECIALIDADES
    ========================== */

    useEffect(() => {

        const carregarEspecialidades = async () => {

            try {

                const { data } =
                    await api.get('/especialidade');

                setListaEspecialidades(data);

            } catch (error) {

                // console.error('Erro ao carregar especialidades:', error);

            }

        };

        carregarEspecialidades();

    }, []);

    /* =========================
       SINCRONIZA USUÁRIO
    ========================== */

    useEffect(() => {

        if (!usuario) return;

        setForm({
            nome: usuario.nome || '',
            telefone: usuario.telefone || '',
            cpf: usuario.perfil?.cpf || '',
            crp: usuario.perfil?.crp || '',
            bio: usuario.perfil?.bio || ''
        });

        setSelecionadas(
            usuario.perfil?.especialidades?.map(
                especialidade => especialidade.id
            ) || []
        );

    }, [usuario, editando]);

    /* =========================
       ALTERAÇÃO DOS CAMPOS
    ========================== */

    const handleChange = (e) => {

        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

    };

    /* =========================
       ESPECIALIDADES
    ========================== */

    const toggleEspecialidade = (id) => {

        setSelecionadas(prev => {

            if (prev.includes(id)) {

                return prev.filter(
                    item => item !== id
                );

            }

            return [...prev, id];

        });

    };

    /* =========================
       TELEFONE
    ========================== */

    const formatarTelefone = (telefone = '') => {

        return telefone
            .replace(/\D/g, '')
            .replace(
                /(\d{2})(\d)/,
                '($1) $2'
            )
            .replace(
                /(\d{5})(\d)/,
                '$1-$2'
            )
            .slice(0, 15);

    };

    /* =========================
       ATUALIZAÇÃO
    ========================== */

    const atualizarDados = async (e) => {

        e.preventDefault();

        if (selecionadas.length === 0) {

            toast.error('Selecione ao menos uma especialidade');

            return;
        }

        const dadosAtualizados = {

            nome: form.nome.trim(),

            cpf: form.cpf,

            crp: form.crp,

            telefone: form.telefone.replace(/\D/g, ''),

            bio: form.bio.trim(),

            especialidadesIds: selecionadas

        };

        setSalvando(true);

        try {

            await api.put('/profissionais/completar-perfil', dadosAtualizados);

            toast.success( 'Perfil atualizado!' );

            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );

            await fetchUsuario();

            setEditando(false);

        } catch (error) {

            toast.error( error.response?.data?.erro || 'Erro ao salvar' );

            // console.error( 'Erro ao atualizar perfil:', error );

        } finally {

            setSalvando(false);

        }

    };

    return (

        <div className={styles.containerPerfil}>

            <MenuLateral />

            <main className={styles.conteudoPerfil}>

                {/* =========================
                    CABEÇALHO
                ========================== */}

                <header className={styles.topoPerfil}>

                    <div>

                        <span className={styles.eyebrow}>
                            Área profissional
                        </span>

                        <h1>
                            Meu perfil
                        </h1>

                        <p>
                            Gerencie suas informações
                            profissionais e sua apresentação
                            na plataforma.
                        </p>

                    </div>

                    <button
                        type="button"
                        className={styles.botaoEditarTopo}
                        onClick={() =>
                            setEditando(true)
                        }
                    >
                        <FiEdit3 />
                        Editar perfil
                    </button>

                </header>

                {/* =========================
                    IDENTIDADE
                ========================== */}

                <section className={styles.identidadePerfil}>

                    <div className={styles.avatarPerfil}>

                        <img
                            src={usuario?.foto || image_default}
                            alt="Foto de perfil"
                        />

                    </div>

                    <div className={styles.identidadeInfo}>

                        <h2>
                            {usuario?.nome || 'Profissional'}
                        </h2>

                        <span className={styles.profissionalBadge}>
                            Profissional de saúde mental
                        </span>

                        <p>
                            {usuario?.perfil?.crp
                                ? `CRP ${usuario.perfil.crp.replace(
                                    /^CRP\s*-?\s*/i,
                                    ''
                                )}`
                                : 'CRP não informado'}
                        </p>

                    </div>

                </section>

                {/* =========================
                    NAVEGAÇÃO
                ========================== */}

                <nav className={styles.navegacaoPerfil}>

                    <button
                        type="button"
                        className={
                            !editando
                                ? styles.navegacaoAtiva
                                : ''
                        }
                        onClick={() =>
                            setEditando(false)
                        }
                    >
                        Perfil profissional
                    </button>

                    <button
                        type="button"
                        className={
                            editando
                                ? styles.navegacaoAtiva
                                : ''
                        }
                        onClick={() =>
                            setEditando(true)
                        }
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
                                    Informações profissionais
                                </h2>

                                <p>
                                    Informações apresentadas
                                    no seu perfil.
                                </p>

                            </div>

                        </div>

                        <div className={styles.listaInformacoes}>

                            <div className={styles.informacaoItem}>

                                <div className={styles.iconeInformacao}>
                                    <FiUser />
                                </div>

                                <div>

                                    <span>
                                        Nome completo
                                    </span>

                                    <strong>
                                        {usuario?.nome || 'Não informado'}
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
                                    <FiCreditCard />
                                </div>

                                <div>

                                    <span>
                                        CPF
                                    </span>

                                    <strong>
                                        {usuario?.perfil?.cpf ||
                                            'Não informado'}
                                    </strong>

                                </div>

                            </div>

                            <div className={styles.informacaoItem}>

                                <div className={styles.iconeInformacao}>
                                    <FiAward />
                                </div>

                                <div>

                                    <span>
                                        Registro profissional
                                    </span>

                                    <strong>
                                        {usuario?.perfil?.crp
                                            ?.replace(
                                                /^CRP\s*-?\s*/i,
                                                ''
                                            ) ||
                                            'Não informado'}
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* BIOGRAFIA */}

                        <div className={styles.blocoBio}>

                            <div className={styles.blocoTitulo}>

                                <FiBriefcase />

                                <div>

                                    <h3>
                                        Sobre você
                                    </h3>

                                    <p>
                                        Apresentação profissional
                                    </p>

                                </div>

                            </div>

                            <p className={styles.textoBio}>

                                {usuario?.perfil?.bio || 'Nenhuma biografia cadastrada.'}

                            </p>

                        </div>

                        {/* ESPECIALIDADES */}

                        <div className={styles.blocoEspecialidades}>

                            <div className={styles.blocoTitulo}>

                                <FiAward />

                                <div>

                                    <h3>
                                        Especialidades
                                    </h3>

                                    <p>
                                        Áreas de atuação
                                    </p>

                                </div>

                            </div>

                            <div className={styles.tagsEspecialidades}>

                                {usuario?.perfil?.especialidades ?.length > 0 ? (

                                    usuario.perfil.especialidades.map(
                                        especialidade => (

                                            <span
                                                key={ especialidade.id }
                                                className={ styles.tagEspecialidade}
                                            >
                                                { especialidade.nome }
                                            </span>

                                        )
                                    )

                                ) : (

                                    <span
                                        className={ styles.semInformacao }
                                    >
                                        Nenhuma especialidade cadastrada.
                                    </span>

                                )}

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
                                    Editar perfil
                                </h2>

                                <p>
                                    Mantenha suas informações profissionais atualizadas.
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
                                    Telefone
                                </label>

                                <div className={styles.inputWrapper}>

                                    <FiPhone />

                                    <input
                                        id="telefone"
                                        type="text"
                                        name="telefone"
                                        value={formatarTelefone(form.telefone)}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                    />

                                </div>

                            </div>

                            <div className={styles.gridCampos}>

                                <div className={styles.campoGrupo}>

                                    <label htmlFor="cpf">
                                        CPF
                                    </label>

                                    <div
                                        className={ styles.inputWrapper }
                                    >

                                        <FiCreditCard />

                                        <input
                                            id="cpf"
                                            type="text"
                                            value={form.cpf}
                                            readOnly
                                            className={ styles.inputBloqueado }
                                        />

                                    </div>

                                    <small>
                                        Este dado não pode ser
                                        alterado.
                                    </small>

                                </div>

                                <div className={styles.campoGrupo}>

                                    <label htmlFor="crp">
                                        CRP
                                    </label>

                                    <div
                                        className={ styles.inputWrapper }
                                    >

                                        <FiAward />

                                        <input
                                            id="crp"
                                            type="text"
                                            value={form.crp}
                                            readOnly
                                            className={ styles.inputBloqueado }
                                        />

                                    </div>

                                    <small>
                                        Este dado não pode ser
                                        alterado.
                                    </small>

                                </div>

                            </div>

                            {/* ESPECIALIDADES */}

                            <div className={styles.campoGrupo}>

                                <label>
                                    Especialidades
                                </label>

                                <p className={styles.descricaoCampo}>
                                    Selecione as áreas em que
                                    você atua.
                                </p>

                                <div
                                    className={ styles.seletorEspecialidades }
                                >

                                    {listaEspecialidades.map(
                                        especialidade => {

                                            const ativa =
                                                selecionadas.includes( especialidade.id );

                                            return (

                                                <button
                                                    key={ especialidade.id }
                                                    type="button"
                                                    className={
                                                        ativa
                                                            ? styles.especialidadeAtiva
                                                            : styles.especialidade
                                                    }
                                                    onClick={() =>
                                                        toggleEspecialidade(
                                                            especialidade.id
                                                        )
                                                    }
                                                >
                                                    {ativa && (
                                                        <FiCheck />
                                                    )}

                                                    {
                                                        especialidade.nome
                                                    }

                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>

                            {/* BIO */}

                            <div className={styles.campoGrupo}>

                                <label htmlFor="bio">
                                    Biografia profissional
                                </label>

                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Conte um pouco sobre sua experiência, abordagem e áreas de atuação..."
                                    required
                                />

                                <small>
                                    Essa descrição poderá ser apresentada aos pacientes.
                                </small>

                            </div>

                            {/* AÇÕES */}

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
                                    className={ styles.botaoSalvar }
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