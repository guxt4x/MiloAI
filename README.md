MiloAI 🤖
⚠️ AVISO IMPORTANTE: Este projeto é um protótipo em fase de testes e não está 100% concluído. É muito importante ressaltar que falta a implementação da API para que o bot possa responder de forma autônoma e interativa.

Este repositório contém o MiloAI, uma aplicação web gerada e estruturada com o auxílio de Inteligência Artificial. O desenvolvimento inicial utilizou o framework Antigravity, integrando os agentes Claude Sonnet e ChatGPT para planejar e gerar a base do código da interface.

📌 Sobre o Projeto
O MiloAI foi concebido estritamente como um ambiente de testes (Prova de Conceito) para explorar a capacidade de IAs na construção de interfaces modernas. A estrutura do front-end está construída, mas o fluxo lógico da conversa ainda carece da integração do back-end para processar as mensagens do usuário e devolver as respostas do assistente virtual.

🛠️ Tecnologias Utilizadas
A stack principal do projeto inclui:

Framework Core: Angular v21

Estilização: Tailwind CSS

Banco de Dados/Autenticação: Supabase

Visualização de Dados: D3.js

Desenvolvimento assistido por IA: Antigravity, Claude Sonnet e ChatGPT

🚀 Status Atual e Limitações
✅ Interface (UI): A estrutura visual e os componentes do front-end estão mapeados.

✅ Gerenciamento de Pacotes: Dependências essenciais e scripts de build já configurados.

🛑 Comunicação do Bot: A interface de chat pode estar visível, mas a lógica para processar o input do usuário e gerar uma resposta inteligente através de uma API externa (LLM) ainda não foi implementada. No momento, o bot não responde.

📦 Como rodar localmente
Se você deseja explorar a estrutura da interface e os componentes gerados, siga os passos abaixo:

Clone o repositório e acesse a pasta do projeto.

Instale as dependências:

Bash
npm install
Execute o servidor de desenvolvimento local:

Bash
npm run dev
(Este comando está configurado para executar o ng serve por baixo dos panos)

Acesse http://localhost:4200 no seu navegador.
