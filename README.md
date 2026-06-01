# Sistema de Gestão e Priorização de Calçadas Hostis para Mobilidade Urbana Inclusiva

# 1. IDENTIFICAÇÃO DO PROJETO
```
    Disciplina: Banco de Dados II
    ODS principal: ODS 11 — Cidades e Comunidades Sustentáveis
    ODS secundária: ODS 10 — Redução das Desigualdades
```
# 2. CONTEXTUALIZAÇÃO

```
    As calçadas são uma das infraestruturas mais básicas da mobilidade urbana. Antes de acessar transporte público, comércio, escolas, unidades de saúde, praças ou serviços públicos, grande parte da população precisa se deslocar a pé. Apesar disso, muitas cidades ainda priorizam o fluxo de veículos motorizados e tratam a experiência do pedestre como elemento secundário do planejamento urbano.
    Na prática, essa negligência aparece em calçadas com buracos, degraus, postes no meio da passagem, rampas inadequadas, ausência de piso tátil, desníveis, entulho, lixo, árvores obstruindo o caminho, carros estacionados irregularmente e baixa iluminação. Esses problemas reduzem a segurança, dificultam o deslocamento e tornam o espaço urbano menos inclusivo.
    Essa situação não afeta todos os cidadãos da mesma forma. Uma calçada em más condições pode ser apenas um incômodo para um pedestre sem limitações físicas, mas pode representar uma barreira grave para pessoas com deficiência, idosos, crianças, gestantes, pessoas com carrinho de bebê ou pessoas com baixa visão. Dessa forma, a má qualidade das calçadas produz uma forma concreta de exclusão urbana.
    O projeto propõe a criação de um banco de dados open source para registrar, classificar, acompanhar e priorizar problemas em trechos de calçadas, fornecendo suporte à tomada de decisão por parte da gestão pública. A proposta está alinhada à ODS 11, por tratar de cidades mais inclusivas, seguras, resilientes e sustentáveis, e à ODS 10, por considerar os impactos desiguais da infraestrutura urbana sobre grupos vulneráveis.


```




# 3. COMO EXECUTAR O PROJETO

## 🗄️ 1. Banco de Dados e Backend (PostgreSQL & Migrations)

Para subir o banco de dados PostgreSQL via Docker e rodar as migrações de banco:

```bash
# Iniciar o banco de dados local via Docker
docker compose up --build -d

# Executar as migrações (criar tabelas e chaves) via Alembic
alembic upgrade head
```

## 💻 2. Frontend Interativo (React + Vite)

Para rodar a interface de usuário interativa e premium de forma local (Vite):

```bash
# 1. Navegue até a pasta do frontend
cd frontend

# 2. Instale as dependências necessárias
npm install

# 3. Inicie o servidor de desenvolvimento local
npm run dev
```

Após iniciar, o terminal exibirá a URL de acesso local, normalmente **`http://localhost:5173`**. Abra o link no seu navegador para explorar o ecossistema completo:
*   **Visão Geral (Dashboard):** Painel dinâmico com gráficos e indicadores chaves de desempenho (KPIs).
*   **Mapa de Calçadas:** Mapa interativo de barreiras urbanas com detalhes assíncronos ao clicar nos pins.
*   **Ocorrências:** Formulário intuitivo de relato de obstáculos integrados com o escopo de ruas do banco de dados.
*   **Área do Fiscal & Obras:** Workflow municipal simulado completo de vistoria e acionamento de equipes de reparo.
*   **Sobre o Projeto:** Documentação e descrição da equipe de desenvolvedores.