# AGENTS.md

Brito Estética Automotiva: React + Express + MySQL. Não existe projeto npm na raiz; `backend/` e `frontend/` são projetos npm separados e a raiz só orquestra Docker/Nginx. Execute comandos npm dentro do subdiretório correspondente.

## Comandos

Backend (`cd backend`):
- `npm install`
- `npm run dev` — tsx watch na porta 3333
- `npx tsc --noEmit` — única verificação de tipos disponível
- `npm run build` e depois `npm start` — compila para `dist/` e roda o JS compilado
- Não existem testes, script de lint nem CI; não invente esses comandos.

Frontend (`cd frontend`):
- `npm install`
- `npm run dev` — Vite, porta padrão 5173
- `npm run lint`
- `npm run build` — executa `tsc -b && vite build`; erros de tipo bloqueiam o build
- `npm run preview`
- Não existem testes nem CI.

Stack completa:
- `docker compose up -d --build`
- `docker compose ps`, `docker compose logs -f <service>`
- Site via Nginx: http://localhost; container do frontend: http://localhost:3000; MySQL: localhost:3306. O backend é interno (`backend:3333`) e não publica porta no host.

## Armadilhas de Docker e ambiente

- O `backend/Dockerfile` executa `npm start` e copia o `dist/` local; ele não compila. Rode `cd backend && npm run build` antes de `docker compose build backend` ou `up --build`. O `dist/` está no `.gitignore`, então um clone novo não tem artefato de build.
- O `frontend/Dockerfile` sobe o servidor **dev** do Vite na porta 3000, não um build de produção.
- O `.env` da raiz alimenta o Docker Compose. O `backend/.env` (ignorado pelo Git) é carregado por `backend/src/config/env.ts` no `npm run dev` local. Neste checkout eles têm credenciais de banco diferentes; o backend local usa `backend/.env`, o Docker usa os valores do Compose. Aponte os dois para a mesma instância/volume MySQL ou a aplicação não inicia.
- O `backend/docker/init/brito_estetica.sql` só roda quando o volume do MySQL é criado pela primeira vez. Volumes existentes exigem executar manualmente `backend/docker/migration/001_auth_clientes_agendamentos.sql` e `backend/docker/migrations/20261109_add_cliente_cpf.sql` (existem tanto `migration/` quanto `migrations/`). `docker compose down -v` recria o banco e apaga os dados.
- Base da API no frontend: `VITE_API_URL` tem padrão `http://localhost/api`, e `src/services/api.ts` troca a porta `3000` por `3333`. Isso funciona via Docker/Nginx. Rodar só o Vite em 5173 exige `VITE_API_URL=http://localhost:3333/api` ou um proxy para `/api`.

## Arquitetura do backend

- Camadas: `routes/` -> `controllers/` (validação Zod) -> `services/` -> `repositories/` (todo o SQL, prepared statements com `pool.execute`). `app.ts#buildApp` monta o Express sem escutar; `server.ts` verifica o banco e sobe o servidor.
- A autenticação usa a tabela unificada `contas_acesso`, com papéis `admin`/`cliente`. Rotas admin usam `authMiddleware` + `exigirPapel("admin")`; rotas de cliente usam `clienteAuthMiddleware` e exigem JWT com `tipo: "cliente"`. Ainda existe fallback de login na tabela `usuario`.
- Os arquivos de rota registram de propósito tanto `/api/...` quanto aliases legados sem `/api`, além de aliases como `/cadastro` e `/listar`. Os services do frontend chamam caminhos legados (`/categorias/listar`, `/clientes/listar`, `/agendamentos/admin`). Preserve os aliases, a menos que a migração seja feita dos dois lados.
- Erros passam por `middlewares/errorHandler.ts`; lance subclasses de `AppError` para 4xx esperados e deixe erros de Zod/MySQL serem mapeados ali.
- O pool MySQL usa `dateStrings: true`, `timezone: "Z"` e `decimalNumbers: true`: datas continuam como string e decimais voltam como número.
- A revogação de token é em memória (`services/revogacaoService.ts`), então reinícios limpam as revogações.
- O `backend/README.md` tem exemplos detalhados de endpoints, mas está desatualizado sobre papéis: o código atual tem papéis admin/cliente e `contas_acesso`, não "todos os usuários têm acesso total".

## Guardiões de acesso

- Backend: `authMiddleware` valida o JWT e recarrega a conta em `contas_acesso`; `exigirPapel("admin")` restringe rotas administrativas e `clienteAuthMiddleware` exige token com `tipo: "cliente"`.
- Frontend: `src/components/ProtectedRouter/index.tsx` é o guardião de rotas (o componente exportado é `ProtectedRoute`; o diretório tem `Router` com R). Ele só verifica a presença do token (`brito-admin-token`/`brito-client-token`), não revalida o papel; a autorização real fica no backend.
- Por padrão, `<ProtectedRoute />` protege rotas de admin; `<ProtectedRoute papel="cliente" />` protege rotas de cliente.

## Convenções do frontend

- Organização: páginas do site em `src/pages/site`, CRUD admin em `src/pages/admin`, UI compartilhada em `src/components`, wrappers de API em `src/services`, contexto de autenticação em `src/contexts`.
- Estilos são CSS Modules colocados junto de cada componente/página (`styles.module.css`).
- Há dois tokens de autenticação guardados separadamente em `brito-admin-token` e `brito-client-token`. O `authService.login` verifica o papel retornado; o `ProtectedRoute` verifica a presença do token.
- Login de cliente usa `/auth/login`; login de admin usa `/auth/admin/login`. Cadastro de cliente usa `/auth/cadastro-cliente` (o backend também expõe `/auth/cliente/cadastro`).
- O `tsconfig.app.json` habilita `verbatimModuleSyntax`; use `import type` para importações só de tipo ou o `tsc -b` falha.
- Código, textos de UI, mensagens de validação e respostas da API são em português do Brasil. Siga essa convenção.
