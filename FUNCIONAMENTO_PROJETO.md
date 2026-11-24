# Funcionamento do Projeto - Brito Estética Automotiva

Este documento explica de forma prática como o projeto funciona: arquitetura, fluxos, autenticação, CRUDs, paginação, Docker/Nginx, agentes/skills/guardrails e conceitos de POO/SOLID/TypeScript aplicados.

## 1. Visão geral

O sistema é uma aplicação web para estética automotiva com:
- **Frontend** em React + TypeScript + Vite (`frontend/`).
- **Backend** em Node.js + Express + TypeScript (`backend/`).
- **Banco** MySQL 8.
- **Nginx** como proxy reverso no Docker.
- **Docker Compose** para orquestrar os serviços.

A raiz do repositório não é um projeto npm; ela concentra Docker, Nginx, configuração do OpenCode e documentação.

## 2. Estrutura de pastas

### Raiz
- `docker-compose.yml`: sobe MySQL, backend, frontend e Nginx.
- `nginx/nginx.conf`: roteia `/` para frontend e `/api/` para backend.
- `opencode.json`: guardrails e configuração do OpenCode.
- `.opencode/`: agente e skills do projeto.
- `AGENTS.md`: regras operacionais e arquitetura.

### Backend (`backend/src`)
- `config/`: env e pool MySQL.
- `routes/`: mapeamento de endpoints HTTP.
- `controllers/`: entrada/saída HTTP, validação e chamada de services.
- `services/`: regras de negócio.
- `repositories/`: SQL com `pool.execute`.
- `schemas/`: validação Zod.
- `middlewares/`: auth, autorização, erro, rate limit.
- `entities/` e `types/`: modelos/tipos.
- `validators/`: validações auxiliares (CPF/CNPJ/data/id).
- `errors/`: erros customizados.

### Frontend (`frontend/src`)
- `pages/site`: páginas públicas.
- `pages/admin`: páginas administrativas (CRUDs).
- `pages/autenticacao`: login/cadastro.
- `components`: componentes reutilizáveis.
- `layouts`: estrutura visual comum.
- `services`: chamadas à API.
- `contexts`: estado de sessão.
- `utils`: validações/formatações.

## 3. Fluxo de inicialização

### Backend
1. `config/env.ts` carrega `.env` e valida com Zod. Sem env válido, o processo encerra.
2. `config/database.ts` cria `pool` MySQL.
3. `app.ts` configura Express: `helmet`, `cors`, `morgan`, `json`, rotas, 404 e `errorHandler`.
4. `server.ts` testa `SELECT 1`, inicia `listen` e trata `SIGINT/SIGTERM`.

### Frontend
1. `main.tsx` importa CSS global e renderiza `App` dentro de `UsuarioProvider`.
2. `UsuarioProvider` lê tokens do `localStorage` e busca perfil atual.
3. `App.tsx` registra rotas com `react-router-dom`.
4. `ProtectedRoute` bloqueia rotas sem token; backend confirma permissão.

## 4. Fluxo back ↔ front

1. Usuário interage com página React.
2. Componente chama função em `frontend/src/services/*`.
3. `api.ts` monta URL base (`VITE_API_URL` ou padrão local).
4. Requisição chega ao Nginx (`/api/...`) e é encaminhada ao backend.
5. Rota Express direciona para controller.
6. Controller valida entrada (Zod/params), chama service.
7. Service aplica regra de negócio e chama repository.
8. Repository executa SQL no MySQL.
9. Resposta JSON volta ao frontend.
10. Frontend atualiza estado, exibe sucesso/erro.

## 5. Autenticação e autorização

### Tipos de sessão
- **Admin/usuário**: token `brito-admin-token`.
- **Cliente**: token `brito-client-token`.

### Login admin
- Front: `LoginAdministrativo` -> `authService.login`.
- Back: `POST /auth/admin/login` -> validação -> `authService.loginAuthService` -> bcrypt -> JWT.
- JWT admin inclui `id`, `email`, `papel`, `jti`, `exp`.
- Middleware `authMiddleware` valida Bearer token, assinatura, `jti` não revogado e conta ativa.
- `exigirPapel("admin")` restringe rotas administrativas.

### Login cliente
- Front: `LoginCliente` -> serviço de auth cliente.
- Back: rota de login cliente emite JWT com `tipo: "cliente"`, `id`, `email`, `jti`.
- `clienteAuthMiddleware` valida tipo cliente, revogação, existência e status ativo.

### Logout
- Backend pode revogar `jti` em memória (`revogacaoService`).
- Front remove token do `localStorage` e dispara evento `brito:sessao`.

### Influência no front
- `ProtectedRoute` redireciona para login se não houver token.
- `UsuarioContext` expõe `usuario`, `cliente`, `carregando`, `recarregar`.
- Menus e páginas admin/cliente mudam conforme sessão.

## 6. Cadastro e edição

### Cadastro de cliente
- Front valida campos e envia para API.
- Back valida schema, verifica duplicidade, gera hash bcrypt, cria cliente/conta.
- Retorna sucesso ou erro amigável.

### Edição de usuário
- `/auth/perfil-usuario`: usuário autenticado edita próprios dados permitidos.
- `PUT /usuarios/:id`: exige que token pertença ao próprio usuário.
- Listar/cadastrar/desativar usuários: exige admin.
- E-mail não é alterado por perfil.

### Edição de cliente
- `/auth/cliente/me` (GET/PUT) com `clienteAuthMiddleware`.
- Apenas dados permitidos do próprio cliente.

## 7. CRUDs

CRUDs principais: Categorias, Serviços, Clientes, Agendamentos (e Usuários no admin).

Padrão por recurso:
1. **Route**: URL + middlewares.
2. **Controller**: parse/validação + status HTTP.
3. **Service**: regra de negócio.
4. **Repository**: SQL parametrizado.
5. **Frontend service**: fetch.
6. **Página admin**: formulário, lista, edição, exclusão/desativação.

### Exemplo: Categoria
- Admin acessa página de categorias.
- Front chama `GET /categorias?pagina&limite`.
- Backend valida paginação, busca no repo, retorna `{ dados, paginacao }`.
- Criar/editar envia POST/PUT com body validado.
- Erros de validação/duplicidade voltam com mensagem em pt-BR.

## 8. Paginação

- Front envia `pagina` e `limite` na query string.
- Back valida com schema de paginação (valores padrão/limites).
- Repository faz consulta paginada (`LIMIT/OFFSET`) e contagem total.
- Resposta padrão: `dados` + `paginacao`.
- Componente `Paginacao` controla navegação.

## 9. Validação e tratamento de erros

- **Zod**: valida body/query/params.
- **AppError**: erros esperados com status.
- **errorHandler**: traduz Zod, AppError, JSON inválido, erros MySQL e fallback 500.
- **Mensagens**: em português, sem vazar detalhes internos.

## 10. Docker e Nginx

### Docker Compose
- `mysql`: volume persistente, init SQL na primeira criação.
- `backend`: usa `backend/Dockerfile`; depende de MySQL saudável; healthcheck em `/health`.
- `frontend`: Vite dev na porta 3000.
- `nginx`: publica porta 80 e faz proxy.

### Nginx
- `/` -> frontend:3000 (com upgrade para websocket/HMR).
- `/api/` -> backend:3333 (repassa headers de proxy).

### Cuidados
- `backend/Dockerfile` roda `npm start` e espera `dist/`: rodar build antes.
- `docker compose down -v` apaga volume MySQL (dados).

## 11. Agentes, skills e guardrails

### Agentes
- `brito-padrao.md`: agente principal; segue padrão do projeto, mudanças pequenas, sem complexidade desnecessária.

### Skills
- `padrao-brito`: convenções de camadas, nomes, CSS Modules, pt-BR.
- `seguranca-brito`: autenticação, bcrypt, JWT, CPF, tokens, `.env`.
- `entrega-brito`: checklist e comandos permitidos de verificação.

### Guardrails em `opencode.json`
- Lê `AGENTS.md` como instrução.
- Carrega skills de `.opencode/skills`.
- Nega leitura/edição de `.env*`, exceto `.env.example`.
- Bash: pede confirmação por padrão; permite npm/tsc/git status/diff; nega commit, push, down -v e rm -rf.

## 12. POO, SOLID e TypeScript

### POO
- **Entidades/classes** modelam domínio (`Usuario`, `Cliente`, etc.).
- **Encapsulamento**: erros e serviços agrupam comportamento.
- **Herança**: erros específicos estendem `AppError`.

### SOLID
- **S**: cada camada tem responsabilidade clara.
- **O**: adicionar recurso novo segue padrão existente.
- **L**: erros derivados funcionam onde `AppError` é esperado.
- **I**: tipos específicos por necessidade.
- **D**: separação por contratos/módulos de forma pragmática.

### TypeScript
- Tipagem em interfaces, DTOs, payloads e respostas.
- `import type` no frontend por `verbatimModuleSyntax`.
- Zod valida em runtime; TS ajuda em compile-time.
- `tsc --noEmit`/`tsc -b` pegam erros de tipo.

## 13. Fluxos ponta a ponta

### Autenticação admin
Login form -> `auth.ts` -> `/api/auth/admin/login` -> Nginx -> authRoutes -> controller -> authService -> repository/contas -> bcrypt/jwt -> token -> localStorage -> UsuarioContext -> ProtectedRoute/admin.

### Agendamento
Página agendamento -> carrega serviços/horários -> envia agendamento -> auth middleware se necessário -> controller/schema -> service valida conflito/disponibilidade -> repository insere -> resposta -> UI confirma.

### CRUD admin com paginação
Listar -> `?pagina&limite` -> schema paginação -> repo count+dados -> `{dados,paginacao}` -> tabela + componente Paginacao.

## 14. Limites e cuidados

- Não expor `.env`.
- Não renomear identificadores/rotas legadas.
- Não usar `down -v` sem confirmação.
- Backend Docker precisa de `dist/` compilado.
- Revogação de JWT é em memória.
