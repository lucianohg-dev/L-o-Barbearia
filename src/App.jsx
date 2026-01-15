import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Home from './components/Homegames';
import Register from './components/Register';
import Login from './components/Login';
import Agendamento from './components/Agendamento'; 
import AgendamentosAdmin from './components/AgendamentosAdmin';
import About from "./components/QuemSomos"
import "./App.css" 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // ⏳ Importante para evitar redirecionamento indevido

  useEffect(() => {
    // Escuta em tempo real se o usuário está logado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Busca o papel do usuário no Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Erro ao verificar permissões:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false); // Libera a renderização após checar o banco
    });

    return () => unsubscribe(); // Limpa o observador ao desmontar
  }, []);

  // Enquanto o Firebase não responde, mostramos uma tela de carregamento
  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="app-layout"> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/agendamento" element={<Agendamento/>}/>
            <Route path="/about" element={<About/>}/>
       {/* Rota Protegida do Admin */}
    <Route 
        path="/painel" 
        element={isAdmin ? <AgendamentosAdmin /> : <Navigate to="/login" />} 
    />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;