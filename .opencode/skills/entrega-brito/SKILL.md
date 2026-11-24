---
name: entrega-brito
description: Use antes de finalizar qualquer alteração no Brito Estética Automotiva, para conferir a rubrica, executar apenas os comandos de verificação existentes e garantir que a entrega foi feita por etapas.
---
<!-- Skill de entrega: checklist e comandos seguros para validar antes de concluir. -->

# Skill: entrega-brito

# Entrega Brito

Use esta skill ao terminar uma tarefa, antes de responder que concluiu.

## Checklist

1. A alteração respeitou `AGENTS.md` e a skill `padrao-brito`?
2. Nenhum nome em inglês foi renomeado, conforme decisão do projeto?
3. Nenhum `.env` foi lido, modificado ou versionado?
4. Rotas antigas e aliases legados continuam funcionando?
5. Mensagens e textos novos estão em português do Brasil?
6. Mudanças foram feitas em etapas pequenas, sem métodos avançados?

## Comandos permitidos

Backend, dentro de `backend/`:

- `npx tsc --noEmit`
- `npm run build`
- `npm start`

Frontend, dentro de `frontend/`:

- `npm run lint`
- `npm run build`
- `npm run preview`

Raiz:

- `docker compose config --quiet`
- `docker compose up -d --build`
- `docker compose ps`
- `docker compose logs -f <serviço>`

## Atenção

- Não existe projeto npm na raiz. Execute `npm` dentro de `backend/` ou `frontend/`.
- Não invente testes, lint ou CI onde não existem.
- O `backend/Dockerfile` não compila: rode `npm run build` no backend antes de `docker compose build`, e não exclua `dist/` no `backend/.dockerignore`.
- Não use `docker compose down -v` sem confirmação explícita: isso apaga o volume do MySQL.

<!-- -----------------------------------------------------------------------------
RESUMO DO ARQUIVO
Skill de checklist final e comandos de verificação permitidos antes de concluir tarefas.
----------------------------------------------------------------------------- -->
