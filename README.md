# MiloAI 🤖💼

> ⚠️ **Aviso Importante:** Este projeto foi desenvolvido com o auxílio de Inteligência Artificial e **ainda não está 100% finalizado**. Atualmente, o sistema necessita de uma chave de API válida para que o assistente virtual funcione. Sem a configuração dessa chave, o bot de chat não conseguirá processar ou responder às mensagens.

## 📖 Sobre o Projeto

O **MiloAI** é uma aplicação web focada em assistência inteligente e gestão de dados (incluindo finanças). Ele integra um painel de controle (Dashboard) com um chat alimentado por Inteligência Artificial, permitindo que os usuários tenham uma experiência interativa em uma única plataforma.

## ⚙️ Como Funciona

A arquitetura do projeto é baseada em componentes e dividida nos seguintes serviços principais:

1. **Autenticação e Banco de Dados (`Supabase`)**: O gerenciamento de usuários, login e armazenamento de dados da aplicação são tratados pelo Supabase (através dos serviços `auth.service.ts` e `finance.service.ts`). O banco de dados opera na nuvem e sincroniza os dados do usuário com o painel.
2. **Inteligência Artificial (`Google Gemini`)**: O "cérebro" do chatbot. O serviço `gemini.service.ts` é responsável por capturar a mensagem do usuário no componente de chat (`chat.component.ts`), enviá-la para a API da inteligência artificial e devolver a resposta formatada para a tela. *É aqui que a ausência da chave da API impede a comunicação atual.*
3. **Interface de Usuário (`Componentes`)**: O front-end consome os serviços acima para exibir o Dashboard e a interface de Chat de forma reativa, gerenciando o estado da aplicação.

## 🚀 Funcionalidades (Atuais e Planejadas)

- **Autenticação Segura**: Login e registro de usuários conectados ao Supabase.
- **Dashboard e Finanças**: Interface para controle e visualização de métricas/finanças.
- **Chatbot Integrado**: Interface de chat preparada para comunicação com IA generativa (aguardando inserção da chave API).

## 🛠️ Tecnologias Utilizadas

- **Frontend:** TypeScript, Angular / Vite
- **Backend/BaaS:** Supabase (`@supabase/supabase-js`)
- **IA Generativa:** API do Google Gemini
- **Visualização de Dados:** D3.js

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado.
- Conta no [Supabase](https://supabase.com/) (com banco de dados configurado).
- Conta no [Google AI Studio](https://aistudio.google.com/) (para obter a chave da API do Gemini).

### Passos para Instalação

1. **Clone o repositório:**
   ```bash
   
   git clone [https://github.com/seu-usuario/miloai.git](https://github.com/seu-usuario/miloai.git)
   cd miloai

2. **Instale as dependências:**
   ```bash
   
   npm install

3. **Configuração de Variáveis de Ambiente:
Você precisará configurar as chaves de API para que os serviços funcionem corretamente. Dependendo da configuração atual do framework, insira as chaves no seu arquivo .env ou nos arquivos de ambiente correspondentes:**
   ```bash
   
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   VITE_GEMINI_API_KEY=sua_chave_api_do_google_gemini # OBRIGATÓRIO PARA O CHAT FUNCIONAR
  (Nota: Ajuste o prefixo das variáveis de ambiente de acordo com a ferramenta de build utilizada, ex: VITE_ ou diretamente no arquivo environment.ts).

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   npm start
