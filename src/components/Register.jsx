import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Importa Auth e Firestore
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 

import './Form.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. CRIAR USUÁRIO no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. ATUALIZAR NOME DE EXIBIÇÃO no Auth (Opcional, mas útil)
            await updateProfile(user, {
                displayName: name
            });
            
            // 3. SALVAR DADOS ADICIONAIS no Cloud Firestore (Coleção 'users')
            await setDoc(doc(db, "users", user.uid), {
                nomeCompleto: name,
                email: email,
                celular: phone, // Salvando o número de telefone
                createdAt: new Date(),
                // Você pode adicionar mais campos, como role: 'cliente'
            });

            console.log("Usuário e Perfil salvos com sucesso!");
            
         
            navigate('/login'); 

        } catch (err) {
            console.error("Erro no Cadastro:", err.code);
            // Mapeamento de erros comuns do Firebase Auth
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está em uso.');
            } else if (err.code === 'auth/invalid-email') {
                setError('O formato do e-mail é inválido.');
            } else {
                setError('Falha ao criar conta. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }; // 🚨 FIM DA FUNÇÃO handleSubmit

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Criar Conta</h2>
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nome Completo</label>
                        <input 
                            type="text" 
                            placeholder="Como quer ser chamado?" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>E-mail</label>
                        <input 
                            type="email" 
                            placeholder="seu@email.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Celular / WhatsApp</label>
                        <input 
                            type="tel" 
                            placeholder="(XX) XXXXX-XXXX" 
                            required 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <input 
                            type="password" 
                            placeholder="Crie uma senha forte" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-auth" disabled={isSubmitting}>
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Já possui conta? <Link to="/login">Fazer Login</Link></p>
                    <p style={{ marginTop: '10px' }}><Link to="/">Voltar para Home</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;