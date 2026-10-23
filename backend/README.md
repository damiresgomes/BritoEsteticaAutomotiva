# Brito Estética — Back-end

API REST em **Node.js + Fastify + TypeScript**, com banco **MySQL 8 em Docker**.
Organizada em camadas e com validação via **Zod**.

**Autoras:** Damires Gomes e Cristiani Budnik

---

## 1. Visão geral

Fluxo de uma requisição:

```
Cliente (front / Insomnia / Thunder Client)
   -> app.ts          (cria o Fastify, plugins e rotas)
   -> routes/         (URL + método HTTP -> controller)
   -> controllers/    (valida a entrada com Zod e devolve a resposta)
   -> services/       (regras de negócio)
   -> repositories/   (único lugar que fala com o MySQL)
   -> MySQL (Docker)
```

Cada camada tem **uma responsabilidade**:

| Pasta | Responsabilidade |
|---|---|
| `config/` | Conexão com o banco e validação das variáveis de ambiente |
| `routes/` | Liga endereço + método HTTP ao controller |
| `controllers/` | Valida a entrada (Zod) e monta a resposta HTTP. |
| `services/` | Regras de negócio (duplicidade, senha, token) |
| `repositories/` | Acesso ao MySQL (prepared statements) |
| `schemas/` | Schemas de validação do Zod |
| `middlewares/` | Autenticação (JWT) e tratamento de erros |
| `errors/` | Erros de domínio |
| `validators/` | Funções auxiliares (ex.: cálculo de CPF, validação de data) |
| `types/` | Tipos e interfaces do **contrato com o banco** (o que entra e o que sai) |
| `entities/` | **Modelo de domínio**: as classes `Pessoa` e `Usuario` |

**Regra das pastas `types/` e `entities/` (sem sobreposição):**

| Pasta | O que guarda | Quem usa |
|---|---|---|
| `types/` | Contratos com o MySQL (`Usuario`, `NovoUsuario`, `Servico`, `NovoServico`, `StatusAtivo`) | `repositories/` e `schemas/` |
| `entities/` | Modelo de domínio (`Pessoa`, `Usuario`) | `services/` |

As duas pastas **não** definem o mesmo modelo duas vezes: o que é interface fica
só em `types/`, o que é classe fica só em `entities/`. As regras de validação
(formatos, tamanhos, datas) vivem **só nos schemas do Zod** — as entities são
estrutura de dados, sem setters que validam.

**`app.ts` x `server.ts`:** `app.ts` monta o servidor (plugins + rotas) e exporta
a função `buildApp`; `server.ts` apenas liga na porta. Assim dá para testar a API
sem subir o servidor.

---

## 2. Tecnologias

| Tecnologia | Uso |
|---|---|
| TypeScript (`strict`) | Tipagem sem `any` |
| Fastify v5 | Servidor HTTP e rotas |
| Zod v4 | Validação de entrada e das variáveis de ambiente |
| bcrypt | Hash e comparação de senhas |
| jsonwebtoken | Geração/verificação do token JWT |
| mysql2 | Driver do MySQL (com pool) |
| dotenv | Leitura do `.env` |
| @fastify/cors | Cabeçalhos de CORS |
| @fastify/helmet | Cabeçalhos de segurança |
| tsx | Executa `.ts` em desenvolvimento |
| MySQL 8 (Docker) | Banco de dados |

---

## 3. Por que dessas escolhas

### 3.1 Fastify no lugar do Express

| Aspecto | Express | Fastify |
|---|---|---|
| Handler | `(req, res)` | `(request, reply)` |
| Erros em async | Precisa de `try/catch`/wrapper | Captura sozinho e envia ao `setErrorHandler` |
| Plugins | Terceiros variados | Oficiais (`@fastify/cors`, `@fastify/helmet`) |
| Performance | Base | Roteamento otimizado |

O maior ganho aqui foi o **tratamento de erro central**: com um único
`setErrorHandler` tratamos `ZodError` (400), `AppError` (401/403/409) e erros
inesperados (500), sem repetir `try/catch` em cada rota.

### 3.2 Zod para validação

Antes havia funções soltas (`emailValido`, `senhaForte`) chamadas em pontos
diferentes. Com Zod:

- A regra vira um **schema declarativo** (`schemas/`).
- O schema **infere o tipo** TypeScript (`z.infer`), eliminando `request.body: any`.
- As mensagens de erro ficam em pt-BR, junto da regra.
- O **mesmo Zod valida as variáveis de ambiente** (`config/env.ts`), fazendo o
  servidor parar com mensagem clara se faltar alguma.

O algoritmo de CPF (que é cálculo, não formato) continua em `validators/cpf.ts`,
mas é chamado dentro de um `.refine()` do schema.

### 3.3 Camada `services`

Tirar a regra de negócio do controller. O controller só valida a entrada e
devolve a resposta; o service decide (e-mail em uso? senha correta? usuário ativo?).
Isso deixa o código testável e cada peça pequena.

### 3.4 Camada de erros

`AppError` representa um erro **esperado** do domínio, já com o status HTTP.
O `errorHandler` distingue:

- `ZodError` -> `400` com a lista de campos inválidos.
- `AppError` -> status definido no próprio erro.
- Qualquer outro -> `500` genérico (o detalhe fica só no log, não vai pro cliente).

---

## 4. Estrutura do projeto

```
Brito-Estetica-Backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── servicoController.ts
│   │   └── usuarioController.ts
│   ├── entities/
│   │   ├── pessoa.ts
│   │   └── usuario.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── limiteLoginMiddleware.ts
│   ├── repositories/
│   │   ├── servicoRepository.ts
│   │   └── usuarioRepository.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── healthRoutes.ts
│   │   ├── servicoRoutes.ts
│   │   └── usuarioRoutes.ts
│   ├── schemas/
│   │   ├── authSchema.ts
│   │   ├── servicoSchema.ts
│   │   └── usuarioSchema.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── revogacaoService.ts
│   │   ├── servicoService.ts
│   │   └── usuarioService.ts
│   ├── types/
│   │   ├── servico.ts
│   │   └── usuario.ts
│   ├── validators/
│   │   ├── cpf.ts
│   │   └── data.ts
│   ├── app.ts
│   └── server.ts
├── docker/
│   └── init/ (scripts .sql executados na criação do banco)
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Como rodar

1. Instalar **Node.js** e o **Docker Desktop** (abrir e esperar "Engine running").
2. Instalar dependências:
   ```powershell
   npm install
   ```
3. Criar o `.env`: copiar `.env.example`, renomear para `.env` e preencher.
4. Subir o banco:
   ```powershell
   docker compose up -d
   docker compose ps
   ```
   Esperar o MySQL ficar pronto (`docker compose logs mysql` mostra `ready for connections`).
5. Rodar a API:
   ```powershell
   npm run dev
   ```
6. Verificação de tipos antes de commitar:
   ```powershell
   npx tsc --noEmit
   ```

| Script | O que faz |
|---|---|
| `npm run dev` | Executa o `.ts` direto, reiniciando ao salvar |
| `npm run build` | Compila para `.js` em `dist/` |
| `npm start` | Roda o código compilado |

---

## 6. Variáveis de ambiente

`.env` (não vai para o Git):

```
PORT=3333
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=<usuario>
DB_PASS=<senha>
DB_NAME=<banco>
DB_ROOT_PASSWORD=<senha_do_root>
JWT_SECRET=<texto_longo_e_aleatorio>
CORS_ORIGINS=http://localhost:5173
TRUST_PROXY=0
```

| Variável | Para que serve |
|---|---|
| `CORS_ORIGINS` | Lista de origens liberadas no CORS, separadas por vírgula. Padrão: `http://localhost:5173` |
| `TRUST_PROXY` | Quantos proxies estão na frente da API (`0` = nenhum). Só aumente se a API roda atrás de Nginx/Cloudflare, senão o limite de login passa a contar todo mundo como o mesmo IP |

Regras:
- Sem espaço depois do `=`.
- Nunca subir senhas para o Git (o `.env` está no `.gitignore`).
- Os nomes precisam ser iguais aos usados em `config/env.ts`.

`config/env.ts` valida tudo com Zod no start. Se faltar alguma variável, o
servidor imprime os erros e encerra. Assim fica mais fácil de identificar qual é o erro para fazer a manutenção.

---

## 7. Endpoints

### `POST /api/auth/login` (pública)

Requisição:
```json
{ "email": "admin@gmail.com", "senha": "Senha@123" }
```

| Status | Quando | Corpo |
|---|---|---|
| `200` | credenciais corretas e usuário ativo | `{ "token": "..." }` |
| `400` | campo faltando ou e-mail inválido | `{ "message": "Erro de validação", "erros": [ ... ] }` |
| `401` | usuário não existe ou senha errada | `{ "message": "Dados inválidos!" }` |
| `403` | usuário inativo | `{ "message": "Usuário inativo" }` |
| `429` | mais de 10 tentativas erradas em 15 min | `{ "message": "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." }` |
| `500` | erro inesperado | `{ "message": "Erro interno do servidor" }` |

O token JWT expira em 1h e usa o algoritmo `HS256`. Cada token recebe um `jti`
(identificador único), que permite revogar a sessão no logout.

### `POST /api/auth/logout` (protegida)

Invalida o token usado na requisição (revogação por `jti`).

| Status | Quando | Corpo |
|---|---|---|
| `200` | sessão encerrada | `{ "message": "Sessão encerrada com sucesso" }` |
| `401` | token ausente, inválido, expirado ou já revogado | `{ "message": "..." }` |

Depois do logout, o mesmo token retorna `401` ("Sessão encerrada. Faça login novamente.").

### `GET /api/auth/me` (protegida)

Dados do usuário logado (sem a senha).

| Status | Quando | Corpo |
|---|---|---|
| `200` | token válido | `{ "id": 1, "nome": "...", "email": "...", "ativo": "Sim" }` |
| `401` | token ausente/inválido/revogado | `{ "message": "..." }` |
| `403` | usuário desativado depois do login | `{ "message": "Usuário inativo" }` |

### `GET /health` (pública)

Verifica se a API está viva **e** se o banco responde.

| Status | Quando | Corpo |
|---|---|---|
| `200` | API e banco OK | `{ "status": "ok" }` |
| `503` | banco fora do ar | `{ "status": "indisponivel" }` |

### `POST /api/usuarios/cadastro` (pública)

Requisição:
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha@123",
  "cpf": "111.444.777-35",
  "salario": 3500,
  "datanascimento": "1990-05-20"
}
```

| Status | Quando | Corpo |
|---|---|---|
| `201` | cadastrado | `{ "message": "Usuário cadastrado com sucesso", "id": 10 }` |
| `400` | dados inválidos | `{ "message": "Erro de validação", "erros": [ ... ] }` |
| `409` | e-mail ou CPF já cadastrado | `{ "message": "E-mail já cadastrado" }` |
| `503` | banco fora do ar | `{ "message": "Banco de dados indisponível" }` |
| `500` | erro inesperado | `{ "message": "Erro interno do servidor" }` |

Regras de validação:
- `nome`: obrigatório, até 100 caracteres (o mesmo limite da coluna no banco).
- `email`: formato `algo@algo.algo`, até 100 caracteres; é convertido para minúsculas.
- `senha`: mínimo 8 e máximo 72 caracteres, com maiúscula, minúscula, número e símbolo.
- `cpf`: dígitos verificadores validados; gravado apenas com números (11 dígitos).
- `salario`: número `>= 0` (no JSON, ex.: `3500`, não `"3500"`).
- `datanascimento`: formato `AAAA-MM-DD`, data que **existe no calendário** (31/02 é
  recusado), não pode estar no futuro e o colaborador precisa ter no mínimo 18 anos.

### `GET /api/usuarios/listar` (protegida)

Lista os colaboradores ativos. Exige `Authorization: Bearer <token>`.

| Status | Quando | Corpo |
|---|---|---|
| `200` | token válido | `[ { "id": 1, "nome": "...", "email": "..." } ]` |
| `401` | token ausente/inválido/revogado | `{ "message": "..." }` |
| `403` | usuário desativado | `{ "message": "Usuário inativo" }` |

Qualquer rota inexistente responde `404` em JSON: `{ "message": "Rota não encontrada" }`.

---

## 8. Segurança

| Item | Como |
|---|---|
| Senha | Nunca em texto puro: `bcrypt.hash(senha, 10)` |
| Login | Mensagem genérica ("Dados inválidos!") e comparação com hash fictício quando o usuário não existe (mitiga *timing attack*) |
| Usuário inativo | Bloqueado (`403`) mesmo com senha correta, **e** revalidado no banco a cada requisição com token |
| JWT | `HS256` explícito, `expiresIn: "1h"`, `jti` por token, segredo em `JWT_SECRET` |
| Revogação | `POST /api/auth/logout` invalida o token (lista de `jti` em memória) |
| Limite de login | 10 **tentativas erradas** em 15 min (`skipSuccessfulRequests`), resposta em JSON |
| CORS | Lista explícita de origens em `CORS_ORIGINS` (nada de `origin: true`) |
| Cabeçalhos | `@fastify/helmet` |
| SQL | Sempre prepared statements (`pool.execute` com `?`) |
| Erros | JSON inválido -> `400`, duplicidade -> `409`, FK inválida -> `400`, banco fora -> `503`, resto -> `500` |

---

## 9. Banco de dados

- MySQL 8 em Docker, com volume `mysql_data` (dados persistem).
- `docker/init/*.sql` roda **uma vez**, na primeira criação do volume.
- A tabela `usuario` agora tem `UNIQUE` em `email` e `cpf`, garantindo
  integridade no banco além da checagem feita no service.
- **CPF sempre gravado com 11 dígitos** (sem pontos/traço). É isso que faz o
  índice `uq_usuario_cpf` valer: gravado com máscara, o mesmo CPF passaria
  duas vezes sem o banco reclamar. O dump já normaliza os CPFs plantados.
- `CHECK (cpf REGEXP '^[0-9]{11}$')` na tabela `usuario` garante o formato.

> Banco já criado em volume antigo? Normalize os CPFs uma vez:
> ```sql
> UPDATE usuario SET cpf = REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '');
> ```

| Ação | Comando |
|---|---|
| Subir | `docker compose up -d` |
| Ver estado | `docker compose ps` |
| Ver logs | `docker compose logs mysql --tail 20` |
| Recriar do zero (apaga dados) | `docker compose down -v` e depois `docker compose up -d` |

> O `.sql` só roda com o volume vazio. Mudar o `.env` depois não altera o que já
> foi gravado no volume.

---

## 10. Decisões (o quê / por quê)

| Decisão | Por quê |
|---|---|
| Fastify no lugar do Express | `setErrorHandler` central, plugins oficiais, tipagem e performance |
| Zod para validar | Uma só fonte de regra, mensagens em pt-BR e tipos inferidos |
| Zod também nas variáveis de ambiente | Falha cedo e com mensagem clara |
| Camada `services` | Controller só valida/responde; regra de negócio isolada e testável |
| `AppError` | Separar erro esperado (401/403/409) de erro inesperado (500) |
| `@fastify/helmet` + `@fastify/cors` | Cabeçalhos de segurança e CORS |
| JWT `HS256` explícito | Evita *algorithm confusion* |
| `jti` no token | Permite revogar a sessão no logout |
| Revalidar o usuário no banco | Usuário desativado perde o acesso na hora, sem esperar o token expirar |
| Limite de login contando só falhas | Login correto não gasta tentativa (com `skipSuccessfulRequests`) |
| CORS por lista (`CORS_ORIGINS`) | `origin: true` deixava qualquer site chamar a API |
| `dateStrings` + `timezone: "Z"` no pool | A data de nascimento vai e volta como `AAAA-MM-DD`, sem tropeço de fuso |
| `decimalNumbers: true` no pool | `preco` e `duracao_horas` voltam como número, como o TypeScript promete |
| Hash fictício no login | Tempo de resposta parecido exista ou não o e-mail |
| Checar `ativo` | Impede login de usuário desativado |
| `UNIQUE` em email/cpf | Integridade garantida pelo banco |
| `pool.execute` | Prepared statements (mais seguro) |
| `REPLACE` no `buscarPorCpf` | Casa CPFs antigos gravados com pontos/traço |
| `validators/cpf.ts` mantido | É cálculo, não formato; usado dentro de um `.refine` do Zod |
| `validators/data.ts` | Data de calendário real (bissexto, futuro, idade mínima) |
| Regras só no Zod | Entities são estrutura de dados: não existem duas fontes de verdade |
| `types/` x `entities/` | Contrato com o banco x modelo de domínio, sem duplicar o mesmo modelo |

---

## 11. Teste rápido (Insomnia)

`POST http://localhost:3333/api/auth/login`, Body **JSON**:

| Body | Esperado |
|---|---|
| `{ "email": "a@a.com", "senha": "123" }` | `401` (usuário não existe) |
| `{ "email": "a@a.com" }` | `400` (senha obrigatória) |
| `{ "email": "abc", "senha": "123" }` | `400` (e-mail inválido) |
| `{ "email": "admin@gmail.com", "senha": "<correta>" }` | `200` com `token` |