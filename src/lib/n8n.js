/**
 * @param {string} event 
 * @param {object} payload 
 */
export const triggerN8nWebhook = async (event, payload) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('n8n Webhook URL not configured (VITE_N8N_WEBHOOK_URL)');
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event,
                timestamp: new Date().toISOString(),
                data: payload
            }),
        });

        if (!response.ok) {
            console.error('Failed to trigger n8n webhook:', response.statusText);
        } else {
            console.log('n8n webhook triggered successfully');
        }
    } catch (error) {
        console.error('Error triggering n8n webhook:', error);
    }
};

/**
 * @param {string} message 
 * @returns {Promise<string>} 
 */
export const sendMessageToChatbot = async (message) => {
    const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('n8n Chat Webhook URL not configured (VITE_N8N_CHAT_WEBHOOK_URL)');
        return "Erro: Chatbot não configurado.";
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, timestamp: new Date().toISOString() }),
        });

        if (!response.ok) throw new Error('Falha na comunicação com o bot');

        const textResponse = await response.text();

        try {
            const data = JSON.parse(textResponse);
            return data.text || data.message || data.output || (typeof data === 'string' ? data : JSON.stringify(data));
        } catch (e) {
            return textResponse;
        }
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        return "Desculpe, estou com problemas de conexão no momento.";
    }
};
