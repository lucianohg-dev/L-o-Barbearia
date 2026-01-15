import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Importamos db para consultar o Firestore
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Importamos funções de busca

import './Form.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // 1. Tentar logar o usuário no Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Login realizado com sucesso!");

            // 2. VERIFICAÇÃO DE PERFIL (ADMIN OU CLIENTE)
            // Vamos buscar o documento do usuário pelo UID dele no Firestore
            const userDocRef = doc(db, "users", user.uid); 
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().role === 'admin') {
                // Se for admin, vai para o Painel
                navigate('/painel'); 
            } else {
                // Se for cliente comum, vai para Agendamento
                navigate('/agendamento'); 
            }

        } catch (err) {
            console.error("Erro no Login:", err.code);
            
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('E-mail ou senha incorretos. Tente novamente.');
            } else if (err.code === 'auth/user-not-found') {
                setError('Nenhuma conta encontrada com este e-mail.');
            } else {
                setError('Falha ao fazer login. Verifique seus dados.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Entrar</h2>
                
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>E-mail</label>
                        <input 
                            type="email" 
                            placeholder="exemplo@email.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <input 
                            type="password" 
                            placeholder="Sua senha" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-auth" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
                    <p style={{ marginTop: '10px' }}><Link to="/">Voltar para Home</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;