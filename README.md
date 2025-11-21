# Estoque App com Chatbot IA

Sistema de gerenciamento de estoque com assistente virtual integrado via n8n.

## 🚀 Como rodar

### 1. Frontend (React)

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Crie um arquivo `.env` na raiz com as seguintes variáveis:
    ```env
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_ANON_KEY=sua_key_supabase
    VITE_N8N_WEBHOOK_URL=url_webhook_n8n
    VITE_N8N_CHAT_WEBHOOK_URL=url_webhook_chat_n8n
    ```

3.  Rode o projeto:
    ```bash
    npm run dev
    ```

### 2. Backend (n8n)

Para o chatbot funcionar, o n8n precisa estar rodando. Em outro terminal, execute:

```bash
npx n8n start --tunnel
```

> **Nota:** Ao usar o tunnel, a URL do n8n muda a cada reinicialização. Lembre-se de atualizar as variáveis `VITE_N8N_...` no seu `.env` com a nova URL gerada.
