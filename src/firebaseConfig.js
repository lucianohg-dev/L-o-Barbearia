// src/firebaseConfig.js (Versão Limpa)

import { initializeApp } from "firebase/app";
// Removida: import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; 


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZ17TRZDe9PSLF_nl_89aQ1UYLdRxtmDg",
    authDomain: "leo-barbearia.firebaseapp.com",
    databaseURL: "https://leo-barbearia-default-rtdb.firebaseio.com",
    projectId: "leo-barbearia",
    storageBucket: "leo-barbearia.firebasestorage.app",
    messagingSenderId: "1074487018332",
    appId: "1:1074487018332:web:3742f777fbf8911366f799", 
    // Removida: measurementId: "G-G7Y9YK6ENF" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Removida: const analytics = getAnalytics(app); 

// Inicialize e Exporte o Firestore
export const db = getFirestore(app); 

// Inicialize e Exporte o Firebase Auth
export const auth = getAuth(app);