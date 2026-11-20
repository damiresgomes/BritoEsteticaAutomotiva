---
name: seguranca-brito
description: Use quando a tarefa envolver login, cadastro ou edição de usuário/cliente, CPF, senha, JWT, tokens no localStorage, rotas protegidas ou variáveis de ambiente no Brito Estética Automotiva.
---

# Segurança Brito

Use esta skill sempre que o trabalho tocar autenticação ou credenciais.

## Nunca faça

- Não leia, não imprima e não copie o conteúdo de `.env`, `backend/.env`, `frontend/.env` ou qualquer `*.env.*`.
- `.env.example` pode ser lido, pois contém apenas modelos de variáveis.
- Não exponha segredos em mensagens, logs, commits ou respostas de API.

## Regras de autenticação

- Senha sempre com hash `bcrypt` antes de salvar; comparação com `bcrypt.compare`.
- E-mail validado com regex e obrigatório; CPF validado com os dois dígitos verificadores.
- Política de senha: mínimo de 8 caracteres, maiúscula, minúscula, número e símbolo.
- JWT com expiração e `jti`; verificação no middleware antes de liberar a rota.
- Existem dois tokens separados: administrador e cliente. Não misture.
- Rotas administrativas exigem `authMiddleware` + `exigirPapel("admin")`; listar, cadastrar e desativar usuários seguem essa regra.
- `PUT /usuarios/:id` exige que o token pertença ao próprio usuário, mesmo que seja admin.
- Rotas de cliente exigem JWT com `tipo: "cliente"`.
- Exceções públicas intencionais: login, cadastro de cliente, `/health` e catálogo/horários de leitura pública.
- Edição de perfil nunca permite alterar e-mail.
- Usuário comum só pode editar o próprio cadastro.

## Regras de formulário

- Cadastro e edição devem pedir nome, e-mail, senha e CPF quando a regra pedir.
- Confirmação de senha é obrigatória quando a senha é informada.
- Mensagens de erro amigáveis, em português do Brasil, sem detalhes do banco de dados.

## Se encontrar uma credencial

Pare e avise o usuário. Não tente corrigir sozinho nem inclua o valor em nenhum arquivo.
