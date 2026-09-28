import lobo from './img/lobo.png';
import cadeado from './cadeado.svg';
import styles from './App.module.css';
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';
import { IoPersonOutline } from "react-icons/io5";
import { useState } from 'react';
import { CiLock } from "react-icons/ci";


function Cad() {

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('Paciente');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  
  const url = tipoUsuario === "paciente" ? "/patient/register/" : "/professional/register/";
  console.log('http://localhost:8000'+url);
  async function handleSubmit(e){
    e.preventDefault(); // previne atualização da pagina ao enviar o formulario
    const response = await fetch('http://127.0.0.1:8000'+url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({nome, email, senha, tipoUsuario}),
    });
    const result = await response.json();
    console.log(result.register);
    if(result.register == 'register'){
      alert('Enviado com sucesso')
      
    }
  }
  const handleChange = (event) => {
    setTipoUsuario(event.target.value);
  }

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
        <form type="submit" onSubmit={handleSubmit}> 
        <h1 className={styles.title}>Crie sua conta</h1>
        
        <div className={styles.login_campo}>
          
          <span><IoPersonOutline /> {'\u00A0'}Nome</span>
          <input placeholder="Digite seu nome" onChange={(e)=> setNome(e.target.value)}></input>

          {/* <span>Sobrenome</span>
          <input placeholder="Digite seu sobrenome"></input> */}

          <span>@ E-mail</span>
          <input placeholder="Digite seu E-mail" onChange={(e)=> setEmail(e.target.value)}></input>

          <span ><CiLock />{'\u00A0'}Senha</span>
                              <input type = "password"
                                  placeholder="Digite sua senha" 
                                  value={senha} 
                                  onChange={(e) => { handleSenhaChange(e); setSenha(e.target.value); }}>
          
                              </input>
                              {mensagemErro && <p style={{color: 'red'}}>{mensagemErro}</p>}
          
                              <span ><CiLock />{'\u00A0'}Digite a senha novamente</span>
                              <input 
                                  type = "password"
                                  placeholder="Senha" 
                                  value={confirmarSenha} 
                                  onChange={handleConfirmarSenhaChange}>
          
                              </input>
                              
        <div className={styles.tipoUsuario}>
          <span>Tipo de usuário: </span>
          <label>
        <input 
            type="radio" 
            name="tipoUsuario" 
            value="Paciente" 
            checked={tipoUsuario === 'Paciente'} 
            onChange={handleChange} 
        />
        Paciente
    </label>
    
    <label>
        <input 
            type="radio" 
            name="tipoUsuario" 
            value="Profissional" 
            checked={tipoUsuario === 'Profissional'} 
            onChange={handleChange} 
        />
        Profissional
    </label>
    </div>
    
        </div>
        <div className={styles.botao}>
          <button className={styles.logar} >Criar conta</button>



          <button className={styles.logar_google}><FcGoogle />{'\u00A0'} Cadastre-se com o Google</button>


        </div>
        
        </form>
        



      </div>

      <div className={styles.right}>

        <img src={lobo} width="50%" heigth="50%" className="lobo" alt='imagem de um lobo'></img>

        <span>Já possui cadastro? {'\u00A0'}<Link to="/login" style={{ textDecoration: 'none', color: 'blue' }}>Logar</Link></span>

      </div>


    </div>


  );
}


export default Cad;