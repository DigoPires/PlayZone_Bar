# Contributing to PlayZone Bar

Obrigado pelo interesse em contribuir! Este documento fornece diretrizes e instruções para contribuir.

## 🎯 Código de Conduta

Por favor, seja respeitoso e construtivo em todas as interações.

## 🔄 Processo de Contribuição

### 1. Setup Local

```bash
git clone https://github.com/seu-usuario/playzone.git
cd playzone
pnpm install
pnpm run dev
```

### 2. Criar Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bug
```

**Nomenclatura de branches:**
- `feature/nome-descritivo` - Novas funcionalidades
- `fix/nome-descritivo` - Correções de bugs
- `chore/nome-descritivo` - Tarefas de manutenção
- `docs/nome-descritivo` - Documentação

### 3. Fazer Mudanças

- Mantenha a estrutura do projeto
- Siga o estilo de código existente
- Adicione testes quando necessário
- Atualize documentação se relevante

### 4. Commit

```bash
git commit -m "tipo: descrição breve

Descrição mais detalhada se necessário.
Explique o porquê, não o que.
"
```

**Tipos de commit:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças em documentação
- `style:` - Formatação, sem mudança lógica
- `refactor:` - Reestruturação de código
- `perf:` - Melhorias de performance
- `chore:` - Dependências, setup, etc

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Abra um Pull Request com:
- Título claro e descritivo
- Descrição do que foi feito
- Referência a issues relacionadas (se houver)

## 📦 Workflow de Desenvolvimento

O projeto utiliza pnpm workspaces. Ao trabalhar:

```bash
# Typecheck antes de commitar
pnpm run typecheck

# Build para validar tudo
pnpm run build

# Dev com rebuild automático
pnpm run dev
```

## 🗂️ Estrutura de Pastas

```
artifacts/
  ├── api-server/        # Backend - Express, routes, migrations
  ├── playzone-bar/      # Frontend - React, pages, components
  └── mockup-sandbox/    # Prototipagem

lib/
  ├── api-client-react/  # Client gerado (não editar manualmente)
  ├── api-spec/          # OpenAPI spec (fonte da verdade)
  ├── api-zod/           # Schemas Zod (gerado)
  └── db/                # Drizzle ORM, schema

scripts/                  # Utilitários globais
```

## 📝 Guidelines

### TypeScript
- Use `strict: true`
- Sempre adicione types explícitos onde necessário
- Evite `any`

### React Components
- Funcional com hooks
- Props bem tipadas
- Nomes em PascalCase
- Separados em `components/`, `pages/`, `hooks/`

### CSS
- Tailwind CSS + custom classes
- Evite inline styles
- Use componentes base do Radix UI

### Backend
- Express middlewares em `middleware/`
- Routes em `routes/`
- Tipagem Zod para validation
- Async/await, não callbacks

## 🔍 PR Review Checklist

Antes de submeter, verifique:

- [ ] Código segue o estilo do projeto
- [ ] TypeScript sem erros (`pnpm run typecheck`)
- [ ] Builds sem erros (`pnpm run build`)
- [ ] Commits com mensagens claras
- [ ] README atualizado se necessário
- [ ] Sem console.log ou código de debug

## 📞 Dúvidas?

Abra uma issue ou entre em contato com os mantenedores.

---

Muito obrigado pela contribuição! 🎉
