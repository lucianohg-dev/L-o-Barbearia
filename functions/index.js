// index.js (Exemplo de Firebase Cloud Function)

const functions = require('firebase-functions');
// Assumindo que você configurou o Twilio para enviar o WhatsApp
// Mantenha suas credenciais seguras, usando functions.config()
const accountSid = functions.config().twilio.sid; 
const authToken = functions.config().twilio.token;
const twilio = require('twilio')(accountSid, authToken);

// Seu número de telefone do WhatsApp (ou do seu Barbeiro)
const DESTINATION_WHATSAPP = 'whatsapp:+5581994439943'; 
// O número do Twilio (remetente)
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+1SEUDONUMERO'; 

/**
 * Função HTTP para receber dados do agendamento do seu app React
 * URL de exemplo: https://SEU_REGION-SEU_PROJECT_ID.cloudfunctions.net/triggerWhatsapp
 */
exports.triggerWhatsapp = functions.https.onRequest(async (req, res) => {
    
    // 1. Verificar se a requisição é um POST e se há dados
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido. Use POST.');
    }
    
    // Os dados do agendamento enviados pelo seu React
    const appointmentData = req.body; 
    
    if (!appointmentData || !appointmentData.nomeCliente || !appointmentData.servicos) {
        return res.status(400).send('Dados do agendamento incompletos.');
    }

    try {
        const { nomeCliente, servicos, horario, valorTotalMinimo } = appointmentData;

        // 2. FORMATAR A LISTA DE SERVIÇOS
        const listaServicosFormatada = servicos.map(s => 
            `  - ${s.nome} (R$ ${s.preco.toFixed(2)})`
        ).join('\n');
        
        // 3. CONSTRUIR A MENSAGEM FINAL PARA O WHATSAPP
        const mensagemWhatsapp = `
🚨 NOVO AGENDAMENTO RECEBIDO! 🚨
--------------------------------------
👤 Cliente: ${nomeCliente}
🗓️ Horário: ${new Date(horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}

✂️ Serviços Escolhidos:
${listaServicosFormatada}

💲 Valor Mínimo Estimado: R$ ${valorTotalMinimo.toFixed(2)}
--------------------------------------
Verifique o Firestore para mais detalhes e entre em contato para confirmar.
        `;

        // 4. ENVIAR A MENSAGEM VIA TWILIO (ou outro serviço)
        await twilio.messages.create({
            body: mensagemWhatsapp,
            from: TWILIO_WHATSAPP_NUMBER, 
            to: DESTINATION_WHATSAPP 
        });

        console.log(`Notificação de agendamento enviada para ${nomeCliente}`);
        
        // Retorna sucesso para o seu app React
        return res.status(200).send({ success: true, message: 'Notificação enviada.' });

    } catch (error) {
        console.error("Erro ao enviar a notificação do WhatsApp:", error);
        // Retorna um erro, mas o agendamento no Firestore ainda está salvo.
        return res.status(500).send({ success: false, message: 'Falha ao enviar notificação.' });
    }
});