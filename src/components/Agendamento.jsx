import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebaseConfig'; 
import { collection, addDoc, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore'; 
import { servicosBarbearia } from '../data/servicos'; 
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth'; 
import './Agendamento.css'; 

const BUSINESS_HOURS = {
    startMorning: 8,
    endMorning: 12,
    startAfternoon: 14,
    endAfternoon: 20,
    slotDurationMinutes: 30,
};

const formatTime = (dateObj) => {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const generateSlots = (dateString) => {
    if (!dateString) return [];
    const slots = [];
    const date = new Date(dateString + 'T00:00:00'); 
    if (isNaN(date.getTime()) || date.getDay() === 0) return slots;

    const { startMorning, endMorning, startAfternoon, endAfternoon, slotDurationMinutes } = BUSINESS_HOURS;
    
    const addSlots = (startHour, endHour) => {
        let currentMinutes = startHour * 60;
        const endMinutes = endHour * 60;
        while (currentMinutes < endMinutes) {
            const h = Math.floor(currentMinutes / 60);
            const m = currentMinutes % 60;
            const slotTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            slots.push(`${dateString}T${slotTime}`);
            currentMinutes += slotDurationMinutes;
        }
    };

    addSlots(startMorning, endMorning);
    addSlots(startAfternoon, endAfternoon);

    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    
    if (dateString === todayISO) {
        const currentTime = formatTime(now);
        return slots.filter(slot => slot.split('T')[1] > currentTime);
    }
    return slots;
};

const ServiceCheckboxItem = ({ service, isSelected, onSelect }) => (
    <div 
        onClick={() => onSelect(service)}
        className={`service-card ${isSelected ? 'selected' : ''}`}
    >
        <div className="service-info">
            <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}></div>
            <label>{service.nome}</label>
        </div>
        <span className="service-price">R$ {service.precoMin.toFixed(2)}</span>
    </div>
);

function AppointmentForm() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [celular, setPhone] = useState('');
    const [selectedServices, setSelectedServices] = useState([]); 
    const [selectedDate, setSelectedDate] = useState(''); 
    const [selectedTime, setSelectedTime] = useState(''); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentStep, setCurrentStep] = useState(1); 
    const [finalAppointmentData, setFinalAppointmentData] = useState(null); 
    const [occupiedSlots, setOccupiedSlots] = useState([]); 
    const [slotsMessage, setSlotsMessage] = useState('Selecione uma data.');
    const [userAppointments, setUserAppointments] = useState([]);

    const resetForm = () => {
        setSelectedServices([]);
        setSelectedDate('');
        setSelectedTime('');
        setFinalAppointmentData(null);
    };

    const fetchUserAppointments = useCallback(async (phone) => {
        if (!phone) return;
        try {
            const q = query(
                collection(db, "agendamentos"),
                where("telefoneCliente", "==", phone),
                orderBy("horario", "asc")
            );
            const snapshot = await getDocs(q);
            const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const today = new Date().toISOString().split('T')[0];
            const activeOnes = appointments.filter(a => a.horario >= today);
            setUserAppointments(activeOnes);
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const userPhone = userData.celular || '';
                        setPhone(userPhone); 
                        setName(userData.nomeCompleto || userData.nome || '');
                        fetchUserAppointments(userPhone);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário:", error);
                }
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate, fetchUserAppointments]);

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setErrorMessage('');
        try {
            const q = query(
                collection(db, "agendamentos"),
                where("horario", "==", finalAppointmentData.horario),
                where("status", "in", ["pendente", "confirmado"])
            );
            const checkSnapshot = await getDocs(q);
            if (!checkSnapshot.empty) {
                setErrorMessage('Ops! Alguém acabou de reservar este horário.');
                setCurrentStep(1);
                setIsSubmitting(false);
                return;
            }
            await addDoc(collection(db, "agendamentos"), finalAppointmentData);
            fetchUserAppointments(celular);
            resetForm();
            setCurrentStep(3);
        } catch (e) {
            setErrorMessage('Erro ao salvar agendamento.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchOccupiedSlots = useCallback(async (dateString) => {
        if (!dateString) return;
        setSlotsMessage('Buscando horários...');
        try {
            const q = query(
                collection(db, "agendamentos"),
                where("horario", ">=", `${dateString}T00:00`),
                where("horario", "<=", `${dateString}T23:59`),
                where("status", "in", ["pendente", "confirmado"])
            );
            const snapshot = await getDocs(q);
            const occupied = snapshot.docs.map(doc => doc.data().horario);
            setOccupiedSlots(occupied);
            const allSlots = generateSlots(dateString);
            const free = allSlots.filter(s => !occupied.includes(s));
            setSlotsMessage(free.length > 0 ? `Disponíveis: ${free.length} horários` : 'Não há horários.');
        } catch (error) { 
            setSlotsMessage('Erro ao carregar horários.'); 
        }
    }, []);

    useEffect(() => { if (selectedDate) fetchOccupiedSlots(selectedDate); }, [selectedDate, fetchOccupiedSlots]);

    const handlePreSubmission = (e) => {
        e.preventDefault();
        if (!name || selectedServices.length === 0 || !selectedTime) {
            setErrorMessage("Preencha todos os campos.");
            return;
        }
        setIsSubmitting(true);
        const total = selectedServices.reduce((acc, s) => acc + s.precoMin, 0);
        setFinalAppointmentData({
            nomeCliente: name.trim(),
            telefoneCliente: celular,
            servicos: selectedServices.map(s => ({ nome: s.nome, preco: s.precoMin, categoria: s.categoria })), 
            valorTotalMinimo: total,
            horario: selectedTime, 
            status: 'pendente',
            dataCriacao: new Date().toISOString()
        });
        setCurrentStep(2);
        setIsSubmitting(false);
    };

    const toggleService = (service) => {
        setSelectedServices(prev => {
            const isAlreadySelected = prev.find(s => s.nome === service.nome);
            if (isAlreadySelected) return prev.filter(s => s.nome !== service.nome);
            return [...prev, service];
        });
    };

    return (
        <div className="agendamento-page">
                <div className="user-profile-header">
                    <div className="user-info-wrapper">
                        <div className="user-details">
                            <span className="user-name">{name || 'Cliente'}</span>
                            <button onClick={() => { signOut(auth); navigate('/'); }} className="logout-simple-btn">Sair</button>
                        </div>
                        <div className="unisex-avatar">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="currentColor"/>
                                <path d="M18 18.5C18 15.4624 15.3137 13 12 13C8.68629 13 6 15.4624 6 18.5V19H18V18.5Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>
            <div className="agendamento-container">
                <div className="brand-header">
                    <h1>Léo-Barbearia</h1>
                </div>

                {errorMessage && <div className="error-banner">{errorMessage}</div>}

                {currentStep === 1 && (
                    <>
                        <header className="form-header">
                            <h2>Novo Agendamento</h2>
                            <p>Escolha seus serviços e o melhor horário</p>
                        </header>
                        <form onSubmit={handlePreSubmission} className="main-content">
                            <div className="main-grid">
                                <div className="column">
                                    <div className="input-group">
                                        <label>Nome</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                    <div className="input-group">
                                        <label>WhatsApp</label>
                                        <input type="text" value={celular} readOnly className="readonly-input" />
                                    </div>
                                    <div className="service-section">
                                        <label>Serviços</label>
                                        <div className="service-list-container">
                                            {servicosBarbearia.map((cat, i) => (
                                                <div key={i} className="category-group">
                                                    <h4>{cat.categoria}</h4>
                                                    {cat.servicos.map((s, j) => (
                                                        <ServiceCheckboxItem 
                                                            key={j} service={{...s, categoria: cat.categoria}} 
                                                            isSelected={selectedServices.some(item => item.nome === s.nome)}
                                                            onSelect={toggleService}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="input-group">
                                        <label>Data</label>
                                        <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => {setSelectedDate(e.target.value); setSelectedTime('');}} required />
                                    </div>
                                    <div className="slots-section">
                                        <label>Horários</label>
                                        <p className="slots-info-text">{slotsMessage}</p>
                                        <div className="slots-grid">
                                            {selectedDate && generateSlots(selectedDate).filter(slot => !occupiedSlots.includes(slot)).map((slot, i) => (
                                                <div key={i} onClick={() => setSelectedTime(slot)} className={`slot-pill ${selectedTime === slot ? 'active' : ''}`}>
                                                    {slot.split('T')[1]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="user-appointments-box">
                                        <h3 className="section-title">🗓️ Meus Agendamentos</h3>
                                        <div className="appointments-scroll">
                                            {userAppointments.map((app, i) => (
                                                <div key={i} className="mini-appointment-card">
                                                    <div className="mini-card-header">
                                                        <span className="app-date">
                                                            {new Date(app.horario).toLocaleDateString()} - {app.horario.split('T')[1]}
                                                        </span>
                                                        <span className={`status-badge ${app.status}`}>{app.status}</span>
                                                    </div>
                                                    
                                                    {/* MOSTRANDO APENAS OS SERVIÇOS QUE ESTE USUÁRIO CONTRATOU NESTA RESERVA */}
                                                    <div className="app-details-mini">
                                                        <p className="app-services-text">
                                                            <strong>Serviços:</strong> {app.servicos?.map(s => s.nome).join(', ')}
                                                        </p>
                                                        <p className="app-price-text">
                                                            <strong>Total:</strong> R$ {app.valorTotalMinimo?.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky-footer">
                                <div className="total-box">
                                    <span>Total:</span>
                                    <span className="price-tag">R$ {selectedServices.reduce((acc, s) => acc + s.precoMin, 0).toFixed(2)}</span>
                                </div>
                                <button type="submit" className="confirm-btn">REVISAR AGENDAMENTO</button>
                            </div>
                        </form>
                    </>
                )}

                {currentStep === 2 && (
                    <div className="confirmation-step">
                        <div className="confirmation-header">
                        <h4 style={{ color: 'var(--gold)', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                            Quase lá! Verifique os detalhes abaixo
                        </h4>
                        </div>
                        <div className="summary-card">
                            <div className="summary-item"><strong>Cliente</strong> {finalAppointmentData?.nomeCliente}</div>
                            <div className="summary-item"><strong>Serviços</strong> {finalAppointmentData?.servicos.map(s => s.nome).join(', ')}</div>
                            <div className="summary-item"><strong>Data e Hora</strong> {finalAppointmentData && new Date(finalAppointmentData.horario).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</div>
                            <div className="summary-total">Total: R$ {finalAppointmentData?.valorTotalMinimo.toFixed(2)}</div>
                        </div>
                        <div className="action-group">
                            <button className="confirm-btn" onClick={handleFinalSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Confirmando...' : 'Confirmar Agora'}
                            </button>
                            <div className="secondary-actions">
                                <button className="back-btn-link" onClick={() => setCurrentStep(1)}>✎ Ajustar informações</button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="success-step" style={{textAlign: 'center', padding: '40px 0'}}>
                        <h2 style={{color: 'var(--gold)'}}>✓ Agendado!</h2>
                        <p>Seu horário foi reservado com sucesso.</p>
                        <button className="confirm-btn" style={{marginTop: '20px'}} onClick={() => setCurrentStep(1)}>Novo Agendamento</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentForm;