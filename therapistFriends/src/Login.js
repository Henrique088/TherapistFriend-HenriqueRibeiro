import lobo from './img/lobo.png';
import cadeado from './cadeado.svg';
import styles from './App.module.css';
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';
import { CiLock } from "react-icons/ci";
import { useLocation } from 'react-router-dom';

function App() {

  const location = useLocation();
  useEffect(() => {
    if (location.state?.showToast) {
      toast.warning(location.state.toastMessage);
      // Limpa o estado para não mostrar novamente
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  return (

    <div className={styles.app}>
      <form className={styles.left}>
        <h1 className={styles.title}>Login</h1>
        <div className={styles.login_campo}>

          <span>@ E-mail</span>
          <input placeholder="Digite seu E-mail"></input>

          <span ><CiLock />{'\u00A0'}Senha</span>
          <input type="password"
            placeholder="Digite sua senha">
          </input>

        </div>

        <div className={styles.botao}>
          <button className={styles.logar}>Logar</button>



          <button className={styles.logar_google}><FcGoogle />{'\u00A0'} Logar com o Google</button>


        </div>



      </form>

      <div className={styles.right}>

        <img src={lobo} width="50%" heigth="50%" className={styles.lobo} alt='Logo de um lobo'></img>

        <span>Ainda não possui cadastro? <Link to="/cadastro">Cadastre-se</Link></span>

      </div>

    </div>

  );
}

export default App;
