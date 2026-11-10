# Brito Estética — Back-end

API REST em **Node.js + Express 5 + TypeScript**, com banco **MySQL 8 em Docker**.
Organizada em camadas e com validação via **Zod**.

**Autoras:** Damires Gomes e Cristiani Budnik

---

## 1. Visão geral

Fluxo de uma requisição:

```
Cliente (front / Insomnia / Thunder Client)
   -> app.ts          (configura o Express, middlewares e rotas)
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
| `controllers/` | Valida a entrada (Zod) e monta a resposta HTTP |
| `services/` | Regras de negócio (duplicidade, senha, token, transições) |
| `repositories/` | Acesso ao MySQL (prepared statements) |
| `schemas/` | Schemas de validação do Zod |
| `middlewares/` | Autenticação (JWT) e tratamento de erros |
| `errors/` | Erros de domínio |
| `validators/` | Funções auxiliares (CPF, CNPJ e datas) |
| `entities/` | Modelo de domínio (classes) |

**`app.ts` x `server.ts`:** `app.ts` monta o servidor (plugins + rotas) e exporta
a função `buildApp`; `server.ts` apenas liga na porta. Assim dá para testar a API
sem subir o servidor.

---

## 2. Níveis de acesso

O sistema tem **somente dois níveis**:

### Usuário

- Tabela `usuario`, token com tipo `"usuario"`.
- Tem acesso total: CRUDs de usuários, clientes, serviços, categorias e
  agendamentos, além do dashboard do usuário.
- **Não se auto cadastra.** Só um usuário já autenticado pode cadastrar outro
  usuário. Não existe rota pública de cadastro de usuário.
- Não existe separação entre "admin" e "usuário comum": todo usuário ativo tem
  acesso total.

### Cliente

- Tabela `clientes`, token com tipo `"cliente"`.
- Pode:
  - se auto cadastrar (`POST /api/auth/cliente/cadastro`, rota pública);
  - fazer login, logout, ver e editar o próprio perfil;
  - criar agendamento (o dono vem sempre do token, nunca do body);
  - cancelar o próprio agendamento somente se ainda não iniciou;
  - editar o próprio agendamento somente se ainda não iniciou;
  - acompanhar o status no dashboard do cliente.
- Só enxerga os próprios dados. Agendamento de outro cliente retorna `404`.

**Regra "não iniciou":** status `Pendente` ou `Confirmado`. Se estiver
`Em atendimento`, `Concluído` ou `Cancelado`, a alteração retorna `409`.

**Separação de tokens:** o token de cliente nunca acessa rota de usuário, e o
token de usuário nunca acessa rota exclusiva de cliente. Os middlewares validam
o campo `tipo` do token.

---

## 3. Tecnologias

| Tecnologia | Uso |
|---|---|
| TypeScript (`strict`) | Tipagem sem `any` |
| Express v5 | Servidor HTTP e rotas |
| Zod v4 | Validação de entrada e das variáveis de ambiente |
| bcrypt | Hash e comparação de senhas |
| jsonwebtoken | Geração/verificação do token JWT |
| mysql2 | Driver do MySQL (com pool) |
| dotenv | Leitura do `.env` |
| cors | Cabeçalhos de CORS |
| helmet | Cabeçalhos de segurança |
| express-rate-limit | Limite de tentativas de login |
| tsx | Executa `.ts` em desenvolvimento |
| MySQL 8 (Docker) | Banco de dados |

---

## 4. Estrutura do projeto

```
Brito-Estetica-Backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── agendamentoController.ts
│   │   ├── authController.ts
│   │   ├── categoriaController.ts
│   │   ├── clienteAuthController.ts
│   │   ├── clienteController.ts
│   │   ├── dashboardController.ts
│   │   ├── servicoController.ts
│   │   └── usuarioController.ts
│   ├── entities/
│   │   ├── agendamento.ts
│   │   ├── carro.ts
│   │   ├── categoria.ts
│   │   ├── cliente.ts
│   │   ├── pessoa.ts
│   │   ├── servico.ts
│   │   └── usuario.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── clienteAuthMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── limiteLoginMiddleware.ts
│   ├── repositories/
│   │   ├── agendamentoRepository.ts
│   │   ├── categoriaRepository.ts
│   │   ├── clienteRepository.ts
│   │   ├── dashboardRepository.ts
│   │   ├── servicoRepository.ts
│   │   └── usuarioRepository.ts
│   ├── routes/
│   │   ├── agendamentoRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── categoriaRoutes.ts
│   │   ├── clienteRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   ├── healthRoutes.ts
│   │   ├── servicoRoutes.ts
│   │   └── usuarioRoutes.ts
│   ├── schemas/
│   │   ├── agendamentoSchema.ts
│   │   ├── authSchema.ts
│   │   ├── categoriaSchema.ts
│   │   ├── clienteSchema.ts
│   │   ├── servicoSchema.ts
│   │   └── usuarioSchema.ts
│   ├── services/
│   │   ├── agendamentoService.ts
│   │   ├── authService.ts
│   │   ├── categoriaService.ts
│   │   ├── clienteAuthService.ts
│   │   ├── clienteService.ts
│   │   ├── dashboardService.ts
│   │   ├── revogacaoService.ts
│   │   ├── servicoService.ts
│   │   └── usuarioService.ts
│   ├── validators/
│   │   ├── cnpj.ts
│   │   ├── cpf.ts
│   │   └── data.ts
│   ├── app.ts
│   └── server.ts
├── docker/
│   ├── init/brito_estetica.sql
│   └── migrations/001_auth_clientes_agendamentos.sql
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
JWT_SECRET=<texto_longo_e_aleatorio_com_32_ou_mais_caracteres>
CORS_ORIGINS=http://localhost:5173
TRUST_PROXY=0
```

| Variável | Para que serve |
|---|---|
| `CORS_ORIGINS` | Lista de origens liberadas no CORS, separadas por vírgula. Padrão: `http://localhost:5173` |
| `TRUST_PROXY` | Quantos proxies estão na frente da API (`0` = nenhum). Só aumente se a API roda atrás de Nginx/Cloudflare |
| `JWT_SECRET` | Segredo do JWT. O servidor exige no mínimo 32 caracteres |

Regras:
- Sem espaço depois do `=`.
- Nunca subir senhas para o Git (o `.env` está no `.gitignore`).
- Os nomes precisam ser iguais aos usados em `config/env.ts`.

`config/env.ts` valida tudo com Zod no start. Se faltar alguma variável, o
servidor imprime os erros e encerra.

---

## 7. Endpoints

### Health

| Método e caminho | Acesso | Uso |
|---|---|---|
| `GET /health` | Público | Verifica a API e o banco (`200 ok` ou `503 indisponivel`). |

### Autenticação de usuário

| Método e caminho | Acesso | Uso |
|---|---|---|
| `POST /api/auth/usuario/login` | Público + rate limit | Login de usuário. |
| `POST /api/auth/login` | Público + rate limit | Caminho legado do mesmo login. |
| `POST /api/auth/logout` | Usuário | Revoga a sessão atual. |
| `GET /api/auth/me` | Usuário | Dados do usuário autenticado. |

Login:
```json
{ "email": "usuario@email.com", "senha": "Senha@123" }
```

O token JWT expira em 1h, usa `HS256` e recebe um `jti` único para permitir o
logout.

### Autenticação de cliente

| Método e caminho | Acesso | Uso |
|---|---|---|
| `POST /api/auth/cliente/cadastro` | Público | Cria a conta do cliente. |
| `POST /api/auth/cliente/login` | Público + rate limit | Login de cliente. |
| `POST /api/auth/cliente/logout` | Cliente | Revoga a sessão atual. |
| `GET /api/auth/cliente/me` | Cliente | Perfil do cliente. |
| `PUT /api/auth/cliente/me` | Cliente | Atualiza nome, senha e telefone. |

Cadastro de cliente:
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha@123",
  "telefone": "(19) 99999-9999"
}
```

Atualização do próprio cadastro (cliente):
```json
{
  "nome": "Maria Souza",
  "senha": "NovaSenha@456",
  "telefone": "(19) 98888-8888"
}
```

### Usuários

Todas as rotas exigem token de usuário.

| Método e caminho | Uso |
|---|---|
| `POST /api/usuarios/cadastro` | Cadastra outro usuário. |
| `GET /api/usuarios/listar` | Lista usuários ativos. |
| `GET /api/usuarios/:id` | Busca usuário por id. |
| `PUT /api/usuarios/atualizar/:id` | Atualiza o próprio usuário. |
| `DELETE /api/usuarios/desativar/:id` | Desativa (soft delete). Não permite a auto-desativação. |

Cadastro de usuário:
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

Regras:
- `nome`: obrigatório, até 100 caracteres.
- `email`: formato válido, até 100 caracteres; convertido para minúsculas.
- `senha`: mínimo 8 e máximo 72, com maiúscula, minúscula, número e símbolo.
- `cpf`: dígitos verificadores validados; gravado apenas com números.
- `salario`: número `>= 0`.
- `datanascimento`: formato `AAAA-MM-DD`, data real, não futura e idade mínima de 18 anos.

Atualização de usuário (o e-mail não pode ser alterado; a senha é opcional):
```json
{
  "nome": "Maria Silva",
  "cpf": "111.444.777-35",
  "salario": 4200,
  "datanascimento": "1990-05-20"
}
```

Se `senha` for enviada, um novo hash é gerado. Se não for, a senha atual é mantida.

### Clientes (feito pelo usuário)

Todas as rotas exigem token de usuário.

| Método e caminho | Uso |
|---|---|
| `GET /api/clientes` | Lista clientes. |
| `GET /api/clientes/:id` | Busca cliente por id. |
| `POST /api/clientes` | Cadastra cliente. |
| `PUT /api/clientes/:id` | Atualiza nome, e-mail e telefone. |
| `DELETE /api/clientes/:id` | Desativa o cliente. |

Cadastro/atualização:
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha@123",
  "telefone": "(19) 99999-9999"
}
```
Na atualização, `senha` não é enviada:
```json
{
  "nome": "Maria Souza",
  "email": "maria.souza@email.com",
  "telefone": "(19) 98888-8888"
}
```

### Categorias

Leitura pública; escrita exige token de usuário.

| Método e caminho | Acesso | Uso |
|---|---|---|
| `GET /api/categorias` | Público | Lista categorias. |
| `GET /api/categorias/:id` | Público | Busca categoria por id. |
| `POST /api/categorias` | Usuário | Cadastra categoria. |
| `PUT /api/categorias/:id` | Usuário | Atualiza categoria. |
| `DELETE /api/categorias/:id` | Usuário | Exclui categoria sem serviços vinculados. |

Corpo:
```json
{ "nome_categoria": "principal" }
```

Não é possível excluir categoria com serviços vinculados (`409`).

### Serviços

| Método e caminho | Acesso | Uso |
|---|---|---|
| `POST /api/servicos/cadastro` | Usuário | Cadastra serviço. |
| `GET /api/servicos/listar` | Público | Lista serviços. Aceita `?nome=` e `?id=`. |
| `GET /api/servicos/:id` | Público | Busca serviço por id. |
| `PUT /api/servicos/atualizar/:id` | Usuário | Atualiza serviço. |
| `DELETE /api/servicos/deletar/:id` | Usuário | Exclui serviço. |

Corpo:
```json
{
  "nome_servico": "Lavagem Detalhada",
  "descricao": "Lavagem externa completa",
  "preco": 400,
  "duracao_horas": 6,
  "id_categoria": 1
}
```

Só é possível excluir serviço que não esteja vinculado a um agendamento (`409`).

### Agendamentos

| Método e caminho | Acesso | Uso |
|---|---|---|
| `POST /api/agendamentos/cliente` | Cliente | Solicita agendamento. |
| `GET /api/agendamentos/cliente/meus` | Cliente | Lista os próprios agendamentos. |
| `GET /api/agendamentos/cliente/meus/:id` | Cliente | Consulta um agendamento próprio. |
| `PUT /api/agendamentos/cliente/meus/:id` | Cliente | Edita um agendamento ainda não iniciado. |
| `PATCH /api/agendamentos/cliente/meus/:id/cancelar` | Cliente | Cancela um agendamento ainda não iniciado. |
| `GET /api/agendamentos/usuario` | Usuário | Lista todos os agendamentos. |
| `PATCH /api/agendamentos/usuario/:id/status` | Usuário | Atualiza o status com transições validadas. |

Criação/edição:
```json
{
  "data_hora": "2026-12-20T14:00:00-03:00",
  "placa_veiculo": "ABC-1234",
  "modelo_veiculo": "VW Golf",
  "servicos": [1, 9]
}
```

Regras:
- A data precisa ser futura.
- De 1 a 10 serviços, sem repetição.
- Serviço inexistente retorna `400`.
- Horário já ocupado retorna `409`.
- O cliente só edita/cancela se o status for `Pendente` ou `Confirmado`.
- Status possíveis: `Pendente`, `Confirmado`, `Em atendimento`, `Concluído` e `Cancelado`.

Transições permitidas:
```
Pendente        -> Confirmado | Cancelado
Confirmado      -> Em atendimento | Cancelado
Em atendimento  -> Concluído
Concluído       -> (final)
Cancelado       -> (final)
```

Atualização de status (usuário):
```json
{ "status": "Confirmado" }
```

### Dashboards

| Método e caminho | Acesso | Uso |
|---|---|---|
| `GET /api/dashboard/usuario` | Usuário | Fila do dia, faturamento concluído no mês e serviços mais solicitados. |
| `GET /api/dashboard/cliente` | Cliente | Totais por status, próximos e últimos agendamentos com status e serviços. |

O dashboard do cliente inclui agendamentos `Cancelado` e `Concluído`.

### Erros comuns

| Status | Quando |
|---|---|
| `400` | Dados inválidos, JSON inválido, referência inválida ou serviço inexistente. |
| `401` | Token ausente, inválido, expirado ou sessão revogada. |
| `403` | Usuário ou cliente inativo. |
| `404` | Recurso não encontrado (ou agendamento de outro cliente). |
| `409` | Duplicidade, conflito de horário, transição inválida ou vínculo ativo. |
| `503` | Banco de dados indisponível. |
| `500` | Erro inesperado (mensagem genérica; detalhe apenas no log). |

---

## 8. Segurança

| Item | Como |
|---|---|
| Senha | Nunca em texto puro: `bcrypt.hash(senha, 10)` |
| Login | Mensagem genérica e comparação com hash fictício quando o usuário não existe (mitiga *timing attack*) |
| Usuário inativo | Bloqueado (`403`) mesmo com senha correta e revalidado no banco a cada requisição |
| JWT | `HS256` explícito, `expiresIn: "1h"`, `jti` por token, segredo com no mínimo 32 caracteres |
| Revogação | `POST /api/auth/logout` invalida o token (lista de `jti` em memória) |
| Limite de login | 10 tentativas erradas em 15 min (`skipSuccessfulRequests`) |
| CORS | Lista explícita de origens em `CORS_ORIGINS` |
| Cabeçalhos | `helmet` |
| SQL | Sempre prepared statements (`pool.execute` com `?`) |
| Erros | JSON inválido -> `400`, duplicidade -> `409`, FK inválida -> `400`, banco fora -> `503`, resto -> `500` |

> A revogação de token fica em memória. Ao reiniciar a API ou rodar mais de uma
> instância, os tokens revogados voltam a ser aceitos. Para produção, usar Redis
> ou uma tabela no banco.

---

## 9. Banco de dados

- MySQL 8 em Docker, com volume `mysql_data` (dados persistem).
- `docker/init/*.sql` roda **uma vez**, na primeira criação do volume.
- A tabela `usuario` tem `UNIQUE` em `email` e `cpf`.
- O CPF é sempre gravado com 11 dígitos (sem pontos/traço).
- `clientes` tem e-mail único, hash de senha e status de ativação.
- Agendamentos usam os cinco status descritos acima.
- A tabela `veiculos` existe no dump, mas ainda não é usada pela API.

Banco de um volume já existente? Execute uma vez
`docker/migrations/001_auth_clientes_agendamentos.sql` no banco. O entrypoint do
Docker só executa scripts de `docker/init` quando cria um volume novo.

| Ação | Comando |
|---|---|
| Subir | `docker compose up -d` |
| Ver estado | `docker compose ps` |
| Ver logs | `docker compose logs mysql --tail 20` |
| Recriar do zero (apaga dados) | `docker compose down -v` e depois `docker compose up -d` |

---

## 10. Decisões (o quê / por quê)

| Decisão | Por quê |
|---|---|
| Express 5 | Rotas HTTP e middleware central de erros |
| Zod para validar | Uma só fonte de regra, mensagens em pt-BR e tipos inferidos |
| Zod também nas variáveis de ambiente | Falha cedo e com mensagem clara |
| Camada `services` | Controller só valida/responde; regra de negócio isolada |
| `AppError` | Separar erro esperado (401/403/409) de erro inesperado (500) |
| `helmet` + `cors` | Cabeçalhos de segurança e CORS |
| JWT `HS256` explícito | Evita *algorithm confusion* |
| `jti` no token | Permite revogar a sessão no logout |
| Revalidar o usuário no banco | Usuário desativado perde o acesso na hora |
| Limite de login contando só falhas | Login correto não gasta tentativa |
| CORS por lista (`CORS_ORIGINS`) | Evita que qualquer site chame a API |
| `dateStrings` + `timezone: "Z"` no pool | Datas vão e voltam como texto, sem tropeço de fuso |
| `decimalNumbers: true` no pool | `preco` e `duracao_horas` voltam como número |
| Hash fictício no login | Tempo de resposta parecido exista ou não o e-mail |
| `UNIQUE` em email/cpf | Integridade garantida pelo banco |
| `pool.execute` | Prepared statements (mais seguro) |
| Transação em agendamentos | Garante que o agendamento e seus serviços sejam salvos juntos |
| Dois níveis de acesso | Usuário com acesso total e cliente com autoatendimento |

---

## 11. Teste rápido (Insomnia)

`POST http://localhost:3333/api/auth/usuario/login`, Body **JSON**:

| Body | Esperado |
|---|---|
| `{ "email": "a@a.com", "senha": "123" }` | `401` (usuário não existe) |
| `{ "email": "a@a.com" }` | `400` (senha obrigatória) |
| `{ "email": "abc", "senha": "123" }` | `400` (e-mail inválido) |
| `{ "email": "usuario@email.com", "senha": "<correta>" }` | `200` com `token` |