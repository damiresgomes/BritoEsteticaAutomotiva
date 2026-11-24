# Fluxo do Projeto - Brito Estética Automotiva

Este documento explica o fluxo do sistema, como backend e frontend se conectam, e onde entram autenticação, CRUDs, paginação, agentes/skills/guardrails, Docker/Nginx, POO, SOLID e TypeScript.

## 1. Visão geral da arquitetura

- **Frontend (`frontend/`)**: React + TypeScript + Vite. Renderiza páginas públicas e administrativas, guarda tokens no `localStorage`, chama a API por `fetch`/wrappers em `src/services`.
- **Backend (`backend/`)**: Express + TypeScript. Recebe requisições HTTP, valida dados com Zod, aplica regras de negócio em services, acessa MySQL por repositories e devolve JSON.
- **Banco (MySQL)**: tabelas de usuários, contas de acesso, clientes, categorias, serviços, agendamentos etc. Inicializado pelo script `backend/docker/init/brito_estetica.sql` apenas na primeira criação do volume.
- **Nginx**: ponto de entrada no Docker. Serve/proxy do frontend na rota `/` e encaminha `/api/` para o backend.
- **Docker Compose**: orquestra `mysql`, `backend`, `frontend` e `nginx` em redes Docker.

Fluxo macro:

1. Usuário acessa o navegador.
2. React renderiza a interface e dispara chamadas para `/api/...`.
3. Nginx recebe a requisição: `/` vai para frontend, `/api/` vai para backend.
4. Express passa por middlewares globais, rota, autenticação/autorização (quando necessário), controller, schema/validação, service e repository.
5. Repository executa SQL no MySQL com prepared statements.
6. Resposta volta como JSON; frontend atualiza estado/tela.

## 2. Fluxo de inicialização

### Backend

1. `backend/src/config/env.ts` carrega `.env` e valida variáveis com Zod. Se inválido, o processo encerra.
2. `backend/src/config/database.ts` cria o pool MySQL usando `env`.
3. `backend/src/app.ts` monta o app Express: `helmet`, `cors`, `morgan`, `express.json`, rotas, 404 e `errorHandler`.
4. `backend/src/server.ts` testa conexão com `SELECT 1`, sobe o servidor na porta `PORT` e trata `SIGTERM/SIGINT` fechando HTTP e pool.

### Frontend

1. `frontend/src/main.tsx` cria a raiz React, importa CSS global e renderiza `<App />` dentro de `<UsuarioProvider>`.
2. `UsuarioProvider` carrega sessão atual (admin ou cliente) pelos tokens do `localStorage`.
3. `frontend/src/App.tsx` define rotas públicas, rotas de cliente e rotas administrativas.
4. `ProtectedRoute` bloqueia acesso por ausência de token; a autorização real de papel é validada pelo backend.

## 3. Autenticação e sessão

### Componentes envolvidos

- **Frontend**: `pages/autenticacao/*`, `services/auth.ts`, `services/authStorage.ts`, `contexts/UsuarioContext.tsx`, `components/ProtectedRouter/index.tsx`.
- **Backend**: `routes/authRoutes.ts`, `controllers/authController.ts`, `controllers/clienteAuthController.ts`, `services/authService.ts`, `services/clienteAuthService.ts`, `middlewares/authMiddleware.ts`, `middlewares/clienteAuthMiddleware.ts`, `services/revogacaoService.ts`.

### Login administrativo

1. Usuário preenche e-mail/senha em `LoginAdministrativo`.
2. Frontend chama `authService.login(...)` em `services/auth.ts`.
3. `POST /auth/admin/login` chega ao backend.
4. `limiteLoginMiddleware` limita tentativas.
5. Controller valida entrada com schema Zod.
6. `authService.loginAuthService` busca conta em `contas_acesso` ou fallback em `usuario`, compara senha com `bcrypt.compare`, verifica conta ativa e papel `admin`.
7. Backend gera JWT com `id`, `email`, `papel`, `jti`, expiração e algoritmo HS256.
8. Frontend salva token em `brito-admin-token`, remove token de cliente e dispara evento `brito:sessao`.
9. `UsuarioProvider` recarrega perfil e rotas admin passam pelo `ProtectedRoute`.

### Login de cliente

1. Usuário preenche login em `LoginCliente`.
2. Frontend chama endpoint de cliente e salva `brito-client-token`.
3. Backend valida credenciais e emite JWT com `tipo: "cliente"`, `id` do cliente, `email`, `jti`.
4. `clienteAuthMiddleware` valida token, tipo, `jti`, existência e status ativo do cliente.
5. Perfil do cliente é obtido por `/auth/cliente/me`.

### Influência no front

- Token admin habilita navegação/layout admin; token cliente habilita área "Minha Conta"/agendamento autenticado.
- O front apenas verifica presença do token para proteger rota; se token for inválido/expirado, API retorna 401/403 e o front trata erro/logout.
- Logout chama endpoint, remove token local e dispara `brito:sessao`.

## 4. Cadastro e edição de usuário/cliente

### Cadastro de cliente

1. Formulário público envia nome, e-mail, CPF, telefone, senha/confirmacao.
2. Frontend valida formato básico; backend valida com Zod e regras de domínio.
3. `clienteService/clienteAuthService` verifica duplicidade, gera hash de senha com bcrypt e cria registros relacionados.
4. Backend retorna sucesso/erro; frontend exibe mensagem em português.

### Edição de usuário administrativo

1. Admin acessa perfil/edição.
2. Frontend envia dados para `/auth/perfil-usuario` ou rota administrativa conforme caso.
3. Backend exige autenticação; edição de perfil não altera e-mail.
4. `PUT /usuarios/:id` exige que o token pertença ao próprio usuário. Listar/cadastrar/desativar usuários exigem admin.
5. Service valida regras; repository atualiza com SQL parametrizado.

### Edição de cliente

1. Cliente autenticado acessa "Minha Conta".
2. Frontend chama `/auth/cliente/me`.
3. `clienteAuthMiddleware` garante token de cliente.
4. Service/repository atualizam somente dados permitidos.

## 5. CRUDs e paginação

O projeto possui CRUDs principais: **Categorias**, **Serviços**, **Clientes** e **Agendamentos** (além de usuários/admin). O padrão é:

1. **Route**: define endpoint HTTP e middlewares.
2. **Controller**: lê `req.params/body/query`, valida com Zod, chama service e responde status/json.
3. **Service**: aplica regra de negócio, conversões e erros de domínio (`AppError`).
4. **Repository**: monta SQL, usa `pool.execute` com placeholders, retorna dados.
5. **Frontend service**: encapsula `fetch`.
6. **Página/componente**: carrega dados, controla formulário, paginação, loading e erros.

### Exemplo de listagem paginada

1. Página admin define `pagina` e `limite`.
2. Frontend chama `listarPaginado({ pagina, limite })`.
3. Request: `GET /api/<recurso>?pagina=1&limite=10`.
4. Backend valida query com schema de paginação.
5. Repository executa consulta de dados + contagem/total.
6. Resposta: `{ dados: [...], paginacao: { pagina, limite, total, totalPaginas } }`.
7. Componente `Paginacao` dispara troca de página; página recarrega lista.

### Onde a paginação aparece

- Wrappers de frontend possuem métodos antigos e `listarPaginado`.
- Páginas administrativas de listagem consomem resposta paginada e renderizam controles.
- Backend centraliza validação de paginação em schema/middleware/utilitário conforme recurso.

## 6. Validação, erros e segurança

- **Zod**: valida body/query/params nos controllers/schemas.
- **AppError**: erro esperado com status HTTP; `errorHandler` converte para JSON consistente.
- **Erros MySQL/Zod**: mapeados pelo `errorHandler`.
- **bcrypt**: hash e comparação de senha.
- **JWT**: autenticação stateless com expiração e `jti`.
- **Revogação em memória**: logout/revogação não persiste após restart.
- **Helmet/CORS**: proteção básica de headers e controle de origem.
- **Prepared statements**: `pool.execute(sql, params)` reduz risco de SQL injection.
- **Sem segredos no código**: `.env` não deve ser lido/exposto/versionado.

## 7. Frontend: componentização e estado

- **Componentização**: componentes reutilizáveis em `src/components`; páginas compõem esses blocos.
- **CSS Modules**: estilos locais por componente/página (`styles.module.css`), evitando colisão global.
- **Contexto**: `UsuarioContext` centraliza usuário/cliente autenticado e recarga de sessão.
- **Hooks**: encapsulam lógica reutilizável.
- **Services**: isolam chamadas HTTP e normalizam payloads/respostas.
- **Utils**: funções puras para CPF, datas, placa, erros, etc.
- **Rotas**: `App.tsx` organiza rotas públicas, cliente e admin; `ProtectedRoute` faz guarda por token.

## 8. Docker Compose e Nginx

### Docker Compose

- **mysql**: banco com volume persistente `mysql_data`; script init monta schema inicial na primeira criação.
- **backend**: build da imagem backend, espera MySQL saudável, expõe saúde em `/health`.
- **frontend**: build da imagem frontend; no setup atual roda Vite dev na porta 3000.
- **nginx**: única porta publicada (`80:80`), recebe tráfego externo e roteia para frontend/backend.

### Redes

- `rede-interna`: comunicação interna entre serviços.
- `rede-externa`: acesso pelo Nginx/frontend conforme configuração.

### Nginx

- `location /` -> `proxy_pass http://frontend:3000`; inclui headers de upgrade para HMR/websocket do Vite.
- `location /api/` -> `proxy_pass http://backend:3333`; repassa host, IP real e protocolo.
- Resultado: navegador fala com uma origem só (`http://localhost`), evitando CORS em uso normal via proxy.

## 9. Agentes, skills e guardrails

### Agente

- `.opencode/agents/brito-padrao.md`: agente principal do projeto. Deve seguir padrão existente, mudanças simples, sem métodos avançados, e validar antes de concluir.

### Skills

- `padrao-brito`: convenções de código, arquitetura, nomes preservados, CSS Modules, português BR.
- `seguranca-brito`: regras para auth, CPF, senha, JWT, tokens, rotas protegidas e `.env`.
- `entrega-brito`: checklist final e comandos permitidos de verificação.

### Guardrails (`opencode.json`)

- `instructions`: inclui `AGENTS.md`.
- `skills.paths`: aponta para `.opencode/skills`.
- `permission.read/edit`: permite geral, mas **nega `.env` e `.env.*`**, permitindo `.env.example`.
- `permission.bash`: pede confirmação por padrão; permite comandos seguros comuns (`npm`, `npx tsc`, `git status/diff`, etc.); nega ações perigosas como `git commit/push`, `docker compose down -v` e `rm -rf`.

## 10. POO, SOLID e TypeScript no projeto

### POO

- **Classes/Entidades**: modelos como `Usuario`, `Cliente`, `Servico`, `Agendamento` representam conceitos do domínio.
- **Encapsulamento**: classes podem concentrar dados e comportamentos relacionados; erros customizados encapsulam status/mensagem.
- **Herança/composição**: `AppError` serve de base para erros específicos; entidades e tipos são compostos conforme necessidade.

### SOLID

- **S (Single Responsibility)**: rotas definem endpoints, controllers tratam HTTP, services tratam regra, repositories tratam SQL.
- **O (Open/Closed)**: novos recursos podem ser adicionados criando novas rotas/controllers/services/repositories sem reescrever o núcleo.
- **L (Liskov Substitution)**: subclasses de `AppError` podem ser tratadas como `AppError` pelo handler.
- **I (Interface Segregation)**: tipos/interfaces TypeScript modelam apenas o necessário para cada camada.
- **D (Dependency Inversion - parcial/pragmático)**: camadas dependem de contratos/funções; no projeto, a separação é principalmente por módulos e convenção.

### TypeScript

- **Tipagem estática**: reduz erros ao definir tipos para payloads, entidades, respostas, tokens e estados.
- **Zod + TypeScript**: Zod valida em runtime; tipos inferidos ajudam em compile-time.
- **`import type`**: exigido pelo `verbatimModuleSyntax` no frontend para imports apenas de tipo.
- **Configurações**: `tsconfig` define rigor de compilação; `tsc --noEmit`/`tsc -b` verificam tipos.

## 11. Fluxo ponta a ponta (exemplo: agendar serviço)

1. Cliente acessa página de agendamento.
2. Frontend carrega categorias/serviços/horários disponíveis via API.
3. Usuário seleciona serviço, data e horário; frontend valida campos.
4. Frontend envia `POST` para endpoint de agendamento com token quando necessário.
5. Nginx encaminha `/api/agendamentos...` ao backend.
6. Middleware de auth/cliente valida sessão, se aplicável.
7. Controller valida payload com Zod.
8. Service verifica regras: disponibilidade, conflito, dados válidos, existência de serviço/cliente.
9. Repository grava agendamento no MySQL.
10. Backend retorna 201/200 com dados.
11. Frontend mostra confirmação e atualiza lista/minha conta.

## 12. Observações importantes

- Não existem testes automatizados nem lint no backend; não inventar comandos.
- Backend Docker precisa de `dist/` previamente compilado.
- `.env` da raiz e `backend/.env` podem divergir; isso afeta qual banco é usado.
- Mudanças devem preservar nomes e aliases legados, conforme decisão do projeto.
- Este arquivo é documentação de fluxo; os comentários adicionados no código detalham linha a linha/comportamento por arquivo.
