import React, { useState } from 'react';
import lobo from './img/lobo.png';
import styles from './App.module.css';
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { FiPhone } from "react-icons/fi";
import { IoPersonOutline } from 'react-icons/io5';
import { CiLock } from "react-icons/ci";
import { MdAlternateEmail } from "react-icons/md";
import cpf_img from './img/cpf_02.webp';



function CadProfissioanais() {

    // const [telefone, setTelefone] = useState('');
    // const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    
    const handleSenhaChange = (e) => {
        setSenha(e.target.value);
        
        if (e.target.value !== confirmarSenha && confirmarSenha !== '') {
            setMensagemErro('As senhas não coincidem');
        } else {
            setMensagemErro('');
        }
    };

    const handleConfirmarSenhaChange = (e) => {
        setConfirmarSenha(e.target.value);

        if (e.target.value !== senha) {
            setMensagemErro('As senhas não coincidem');
        } else {
            setMensagemErro('');
        }
    };

     


    return (
        <div className={styles.app}>

            <div className={styles.left}>
                <h1 className={styles.title}>Crie sua conta</h1>
                <div className={styles.login_campo}>

                    <span><IoPersonOutline /> {'\u00A0'}Nome Completo</span>
                    <input placeholder="Digite seu nome completo"></input>

                    <span><MdAlternateEmail />{'\u00A0'}E-mail</span>
                    <input placeholder="Digite seu E-mail" type='email'></input>


                    {/* <span><img src={cpf_img} width="4%" heigth="2%" alt='cpf logo'></img>{'\u00A0'}CPF</span>
                    <InputMask
                        mask="999.999.999-99"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        maskChar={null}
                        placeholder="xxx.xxx.xxx-xx"
                        id="cpf"
                        name="cpf"
                    />
                    <span><FiPhone />{'\u00A0'}Telefone</span>
                    <InputMask
                        mask="(99) 99999-9999"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        maskChar={null}  // Isso remove os caracteres de preenchimento como "_" (se houver)
                        placeholder="(XX) XXXXX-XXXX"
                        id="telefone"
                        name="telefone"
                    /> */}

                    <span ><CiLock />{'\u00A0'}Senha</span>
                    <input type = "password"
                        placeholder="Digite sua senha" 
                        value={senha} 
                        onChange={handleSenhaChange}>

                    </input>
                    {mensagemErro && <p style={{color: 'red'}}>{mensagemErro}</p>}

                    <span ><CiLock />{'\u00A0'}Digite a senha novamente</span>
                    <input 
                        type = "password"
                        placeholder="Senha" 
                        value={confirmarSenha} 
                        onChange={handleConfirmarSenhaChange}>

                    </input>

                </div>

                <div className={styles.botao}>
                    <button className={styles.logar}>Criar conta</button>



                    <button className={styles.logar_google}><FcGoogle />{'\u00A0'} Cadastre-se com o Google</button>


                </div>



            </div>

            <div className={styles.right}>

                <img src={lobo} width="80%" heigth="60%" className="lobo" alt='imagem de um lobo'></img>

                <span>Já possui cadastro? <Link to="/login">Logar</Link></span>

            </div>


        </div>


    );
}


export default CadProfissioanais;