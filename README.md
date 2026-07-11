# 🎮 PlayZone Bar - Sistema de Gerenciamento

Um sistema completo de gerenciamento para bares temáticos de jogos, desenvolvido com **TypeScript**, **React**, **Node.js** e **PostgreSQL**. Monorepo estruturado com pnpm workspaces.

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Build & Deploy](#-build--deploy)
- [Arquitetura](#-arquitetura)

## 🎯 Visão Geral

PlayZone Bar é um sistema SaaS para gerenciar bares temáticos de jogos com:

- **Painel de Admin**: Gerenciamento de usuários, eventos, reservas, menu, galeria
- **Frontend Público**: Página de eventos, cardápio, galeria, reservas
- **Backend API**: REST API com autenticação, validação Zod, ORM Drizzle
- **Database**: PostgreSQL com migrations automáticas
- **Código Gerado**: OpenAPI spec com Orval para client TypeScript tipado

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|-----------|
| **Linguagem** | TypeScript 5.9 |
| **Runtime** | Node.js 24 |
| **Package Manager** | pnpm |
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + Custom Components (Radix UI) |
| **Backend** | Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod v4 + drizzle-zod |
| **API Spec** | OpenAPI + Orval (codegen) |
| **Animations** | Framer Motion |
| **Build Tool** | esbuild (CJS) |
| **Monorepo** | pnpm workspaces |

## 📁 Estrutura do Projeto

```
playzone/
├── artifacts/                    # Aplicações finais deployáveis
│   ├── api-server/              # Backend Express (Node.js)
│   │   ├── src/
│   │   │   ├── app.ts           # Setup Express
│   │   │   ├── index.ts         # Entry point
│   │   │   ├── routes/          # Endpoints REST
│   │   │   ├── middleware/      # Auth, logging
│   │   │   ├── lib/             # Utilities (logger, Cloudinary)
│   │   │   └── types/           # TypeScript definitions
│   │   └── build.mjs            # Script de build
│   │
│   ├── playzone-bar/            # Frontend SPA (React + Vite)
│   │   ├── src/
│   │   │   ├── components/      # React components reutilizáveis
│   │   │   │   ├── ui/          # Componentes base (Dialog, Button, etc)
│   │   │   │   └── layout/      # Navbar, Footer, layouts
│   │   │   ├── pages/           # Rotas/páginas
│   │   │   │   ├── admin/       # Painel administrativo
│   │   │   │   ├── home/        # Homepage
│   │   │   │   └── [públicas]   # Events, menu, gallery, reservations
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── lib/             # Utilities e helpers
│   │   └── vite.config.ts       # Vite configuration
│   │
│   └── mockup-sandbox/          # Sandbox para prototipos
│
├── lib/                          # Pacotes compartilhados (monorepo)
│   ├── api-client-react/        # Client React gerado (fetch tipado)
│   ├── api-spec/                # OpenAPI spec + Orval config
│   ├── api-zod/                 # Schemas Zod gerados automaticamente
│   ├── db/                      # Drizzle ORM + schema PostgreSQL
│   │   └── schema/              # Definição de tabelas
│   └── integrations/            # Integrações externas (Cloudinary, etc)
│
├── scripts/                      # Utilitários globais
│   ├── dev.mjs                  # Inicia ambiente desenvolvimento
│   ├── reset-db.ts              # Reset do banco de dados
│   └── seed.ts                  # Seed de dados iniciais
│
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # Define workspaces + catálogo versions
├── tsconfig.base.json           # TypeScript base (ES2022, strict)
├── tsconfig.json                # TypeScript root reference
└── .gitignore                   # Git exclusions

```

## 🚀 Instalação

### Pré-requisitos
- Node.js 24+
- pnpm 8+
- PostgreSQL 14+
- Variáveis de ambiente configuradas

### Steps

1. **Clonar repositório**
```bash
git clone https://github.com/seu-usuario/playzone.git
cd playzone
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
# Criar arquivo .env na raiz
cp .env.example .env
# Editar .env com suas credenciais de banco de dados e APIs
```

4. **Setup do banco de dados**
```bash
# Executar migrations
pnpm --filter @workspace/db run push

# (Opcional) Seed de dados iniciais
pnpm run seed
```

## 💻 Desenvolvimento

### Iniciar servidor de desenvolvimento
```bash
pnpm run dev
```

Inicia simultaneamente:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

### Typecheck
```bash
pnpm run typecheck
```

### Construir toda a solução
```bash
pnpm run build
```

### Scripts por workspace

```bash
# Backend
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/playzone-bar run dev

# Database (migrations)
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run studio  # Drizzle Studio

# Regenerar cliente a partir do OpenAPI spec
pnpm --filter @workspace/api-spec run build
```

## 🏗️ Build & Deploy

### Build para produção
```bash
pnpm run build
```

Gera:
- `/artifacts/api-server/dist/` - Backend compilado
- `/artifacts/playzone-bar/dist/` - Frontend estático

### Deploy

#### Backend (Node.js)
```bash
node artifacts/api-server/dist/index.js
```

#### Frontend (Static Hosting)
- Deploy `/artifacts/playzone-bar/dist/` para serviço de hosting (Vercel, Netlify, GitHub Pages, etc)

## 🏛️ Arquitetura

### Monorepo Structure (pnpm Workspaces)

O projeto usa **pnpm workspaces** para:
- Compartilhar código entre packages
- Versionamento centralizado (`pnpm-workspace.yaml` catalogo)
- Build otimizado com dependências internas

### Camadas

```
Frontend (React + Vite)
    ↓
API Client Tipado (Orval + Fetch)
    ↓
Backend API (Express)
    ↓
Database Layer (Drizzle ORM)
    ↓
PostgreSQL
```

### Fluxo de Validação

1. **OpenAPI Spec** (`lib/api-spec/openapi.yaml`) - Single source of truth
2. **Orval Codegen** - Gera TypeScript client tipado (`lib/api-client-react/`)
3. **Backend Validation** - Zod schemas (`lib/api-zod/`)
4. **Frontend Type Safety** - React components com tipos gerados

### Segurança

- ✅ Supply chain attack defense: `npm` security > 1-day minimum release age
- ✅ Environment variables para secrets
- ✅ CORS configurado no Express
- ✅ Zod validation em todas as APIs
- ✅ TypeScript strict mode

## 📚 Documentação Adicional

- [Backend API Documentation](./artifacts/api-server/README.md)
- [Frontend Development Guide](./artifacts/playzone-bar/README.md)
- [Database Schema](./lib/db/schema/)
- [API Specification](./lib/api-spec/openapi.yaml)

## 🐛 Troubleshooting

### Erro "pnpm: command not found"
```bash
npm install -g pnpm
```

### Lock file desatualizado
```bash
pnpm install --frozen-lockfile
```

### Migração do banco falha
```bash
pnpm --filter @workspace/db run drop  # ⚠️ Deleta DB
pnpm --filter @workspace/db run push  # Recria
```

## 📝 Licença

Proprietary - PlayZone Bar

## 👤 Autor

Desenvolvido com ❤️ para PlayZone Bar

---

**Última atualização:** 2026-07-11
