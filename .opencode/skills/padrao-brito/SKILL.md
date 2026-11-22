---
name: padrao-brito
description: Use sempre que criar ou editar arquivos em backend/ ou frontend/ do Brito Estética Automotiva. Aplica o padrão atual de pastas, camadas, nomes mantidos, CSS Modules e textos em português do Brasil.
---

# Padrão Brito

Use esta skill antes de escrever ou alterar código do projeto.

## Regras do projeto

- Respeite `AGENTS.md`. Ele é a fonte principal de comandos, arquitetura e convenções.
- Backend: `routes/` → `controllers/` → `services/` → `repositories/`. Todo SQL fica no repositório com `pool.execute`.
- Frontend: páginas em `src/pages/site` e `src/pages/admin`, componentes em `src/components`, chamadas de API em `src/services`, contexto em `src/contexts`.
- Estilos: CSS Modules ao lado do componente, sempre `styles.module.css`.
- Use `import type` para importações que só existem como tipo no frontend.
- Textos de interface, mensagens de validação e respostas da API devem ser em português do Brasil.
- Preserve os aliases legados das rotas (`/api/...` e caminhos sem `/api`). Não remova nem renomeie rotas.
- **Mantenha os nomes atuais em inglês** de arquivos, pastas, identificadores, chaves JSON e rotas. O projeto decidiu não renomear nesta etapa.
- Não use padrões avançados, generics novos, reflexão ou abstração complexa. Prefira repetir um código simples e legível a criar uma camada nova.
- Não adicione comentários no código, a menos que o usuário peça.
- Faça uma alteração por vez e verifique o resultado antes de continuar.

## Antes de editar

1. Leia o arquivo de destino e um arquivo vizinho com o mesmo papel.
2. Copie a estrutura e a nomenclatura do vizinho.
3. Se a mudança tocar autenticação, CPF, senha ou `.env`, use também a skill `seguranca-brito`.
4. Ao terminar, use a skill `entrega-brito` para validar.
