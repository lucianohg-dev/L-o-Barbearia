import './QuemSomos.css';
import { Link } from 'react-router-dom';

function QuemSomos() {
  return (
    <div className="about-container">
      <header className="about-header">
        <Link to="/" className="btn-back">← Voltar</Link>
        <h2>Quem Somos</h2>
      </header>

      <main className="about-content">
        <section className="about-card">
          <h3>Léo-Barbearia</h3>
          <p>
            Desde o início, a <strong>Léo-Barbearia</strong> nasceu com o propósito de resgatar a essência do cuidado masculino, unindo a tradição das antigas barbearias com a modernidade e o luxo que o homem contemporâneo exige.
          </p>
          <p>
            Mais do que apenas um corte de cabelo ou um barbear, oferecemos uma experiência de relaxamento e autoestima. Nossa equipe é composta por profissionais dedicados a entender o estilo único de cada cliente.
          </p>
          
          <div className="about-features">
            <div className="feature">
              <span className="icon">✂</span>
              <span>Cortes Premium</span>
            </div>
            <div className="feature">
              <span className="icon">🥃</span>
              <span>Ambiente Exclusivo</span>
            </div>
            <div className="feature">
              <span className="icon">⭐</span>
              <span>Excelência</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <p>Léo-Barbearia - Tradição e Estilo</p>
      </footer>
    </div>
  );
}

export default QuemSomos;