import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom'; 
import './AgendamentosAdmin.css';

function AgendamentosAdmin() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Busca todos os agendamentos ordenados por horário
        const q = query(collection(db, "agendamentos"), orderBy("horario", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAgendamentos(dados);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const Logout = async () => {
         navigate('/');
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    };

    const handleFinalizar = async (id) => {
        try {
            const docRef = doc(db, "agendamentos", id);
            await updateDoc(docRef, { status: "finalizado" });
        } catch (error) {
            console.error("Erro ao finalizar:", error);
        }
    };

    const handleExcluir = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
            try {
                await deleteDoc(doc(db, "agendamentos", id));
            } catch (error) {
                console.error("Erro ao excluir:", error);
            }
        }
    };

    if (loading) return <div className="admin-container">Carregando agendamentos...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h2>PAINEL DE AGENDAMENTOS</h2>
                <button onClick={Logout} className="btn-logout">Sair</button>
            </header>

            <div className="admin-list">
                {agendamentos.length === 0 ? (
                    <p className="no-data">Nenhum agendamento encontrado.</p>
                ) : (
                    agendamentos.map((item) => {
                        const contato = item.telefoneCliente || item.celular || "Não informado";
                        
                        return (
                            <div key={item.id} className={`admin-card ${item.status}`}>
                                <div className="info">
                                    <p><strong>CLIENTE:</strong> {item.nomeCliente || item.nomeCompleto}</p>
                                    <p><strong>TELEFONE:</strong> {contato}</p>
                                    
                                    {/* LISTAGEM DE TODOS OS SERVIÇOS */}
                                    <div className="servicos-escolhidos">
                                        <strong>SERVIÇOS:</strong>
                                        <ul>
                                            {item.servicos && item.servicos.length > 0 ? (
                                                item.servicos.map((serv, index) => (
                                                    <li key={index}>• {serv.nome} (R$ {serv.preco.toFixed(2)})</li>
                                                ))
                                            ) : (
                                                <li>Nenhum serviço listado</li>
                                            )}
                                        </ul>
                                    </div>

                                    <p><strong>VALOR TOTAL:</strong> <span className="valor-total">R$ {item.valorTotalMinimo?.toFixed(2)}</span></p>
                                    <p><strong>HORÁRIO:</strong> {item.horario ? new Date(item.horario).toLocaleString('pt-BR') : "Data inválida"}</p>
                                    <p><strong>STATUS:</strong> <span className={`badge ${item.status}`}>{item.status.toUpperCase()}</span></p>

                                    {contato !== "Não informado" && (
                                        <a 
                                            href={`https://wa.me/55${contato.replace(/\D/g, '')}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="btn-whatsapp"
                                        >
                                            💬 Chamar no WhatsApp
                                        </a>
                                    )}
                                </div>
                                
                                <div className="acoes">
                                    {item.status !== 'finalizado' && (
                                        <button onClick={() => handleFinalizar(item.id)} className="btn-done">
                                            Finalizar
                                        </button>
                                    )}
                                    <button onClick={() => handleExcluir(item.id)} className="btn-delete">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default AgendamentosAdmin;