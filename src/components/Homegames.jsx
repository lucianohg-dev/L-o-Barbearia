import './Homegames.css'; 
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      {/* Spacer invisível para ajudar a empurrar o conteúdo para o centro real */}
    
<div className="brand-header">
                    {/*<h3>Léo-Barbearia</h3>*/}
                </div>
      <main className="home-content">
        <h1>Bem-vindo à nossa plataforma</h1>
        <div className="nav-buttons">
          <Link to="/login"><button className="btn-primary">Entrar</button></Link>
          <Link to="/register"><button className="btn-secondary">Criar Conta</button></Link>
          <Link to="/About"><button className="btn-secondary">Quem somos</button>  </Link>
        </div>
      </main>

      <footer className="home-footer">
        <p>© 2025 Léo-Barbearia - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

export default Home;