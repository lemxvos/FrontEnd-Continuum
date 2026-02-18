# 🌟 Continuum Frontend

Frontend application for the Continuum platform - a comprehensive Life OS SaaS for tracking entities, journals, connections, and user progress.

**Status**: ✅ **Refactoring Complete** | **Ready for Production**

---

## ⚡ Quick Start (5 min)

```bash
npm install
npm run dev
```

👉 **New? Start with [QUICKSTART.md](./QUICKSTART.md)**

---

## 📚 Complete Documentation

| Document | Purpose | Time |
|----------|---------|------|
| [QUICKSTART.md](./QUICKSTART.md) | Start here - 5 steps | 5 min |
| [SETUP.md](./SETUP.md) | Installation & API reference | 15 min |
| [MIGRATION.md](./MIGRATION.md) | What changed (20+ fixes) | 30 min |
| [INDEX.md](./INDEX.md) | Navigation hub | 5 min |

👉 **See [INDEX.md](./INDEX.md) for complete documentation**

---

## 🎯 Features

### ✅ Autenticação
- Register/Login com JWT
- 4 planos: FREE, PLUS, PRO, VISION
- Logout automático (401)

### ✅ Notas (Journal)
- Create/Read/Delete notas
- Auto-save a cada 30s
- Markdown + mentions (@usuario, #projeto)

### ✅ Entidades
- Create/Read/Delete personas, hábitos, projetos, goals
- Search global
- Tracking diário (heatmap)
- Timeline de mentions

### ✅ Dashboard
- Métricas gerais (pessoas, projetos, hábitos)
- Top entities
- Conexões & timeline

### ✅ Planos & Pagamento
- 4 tiers com limites
- Checkout Stripe
- Subscription management

### ✅ Settings
- Profile
- Data export (JSON)
- Logout seguro

---

## 🛠️ Technologies

- **Vite** - Lightning fast build tool
- **TypeScript 5+** - Type-safe JavaScript
- **React 18** - UI library
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Client state management (auth)
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
```

Server runs at **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Variables

`.env.local` is already created with:

```env
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

For local development, change to:
```env
VITE_API_BASE_URL=http://localhost:8080
```

See [SETUP.md](./SETUP.md) for all variables

---

## 📊 Project Status

```
✅ AUTENTICAÇÃO     - 4 planos, JWT, logout seguro
✅ JOURNAL          - CRUD completo, auto-save
✅ ENTIDADES        - CRUD, search, tracking, timeline
✅ DASHBOARD        - Métricas, top entities
✅ PLANOS           - 4 tiers, Stripe integration
✅ SETTINGS         - Profile, export, logout
✅ COMPONENTES      - Responsivo, mobile-first
✅ DOCUMENTAÇÃO     - 8 arquivos (4000+ linhas)

🎯 STATUS: READY FOR PRODUCTION
```

## 📋 Recent Refactoring

**What Changed** (v1.0):
- ✅ 15 files fixed/updated
- ✅ 30+ endpoints aligned
- ✅ 2 plans → 4 plans
- ✅ 0 breaking changes
- ✅ 0 TypeScript errors

See [MIGRATION.md](./MIGRATION.md) for details

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript check
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── pages/           # 13 pages + routing
├── components/      # UI components
├── stores/          # Zustand (auth)
├── lib/             # Axios + utils
├── contexts/        # Theme
└── hooks/           # Custom hooks

.env.local          # Environment vars
vite.config.ts      # Vite config
tsconfig.json       # TypeScript config
```

### API Endpoints

Complete reference in [SETUP.md → API Endpoints](./SETUP.md#api-endpoints)

**Quick Reference**:
```
✅ /auth/login, /auth/register, /auth/me
✅ /api/notes (CRUD)
✅ /api/entities (CRUD + search)
✅ /api/entities/{id}/track (tracking)
✅ /api/metrics (dashboard)
✅ /api/subscriptions (checkout, cancel)
```

---

## 📦 Backend

Backend URL: `https://continuum-backend.onrender.com`

Local development: `http://localhost:8080`

API Docs: OpenAPI 3.0.1 specification available in team docs

---

## 🐛 Troubleshooting

**Problem**: npm install fails
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: VITE_API_BASE_URL not working
- Check [SETUP.md → Troubleshooting](./SETUP.md#troubleshooting)

**Problem**: TypeScript errors
```bash
npm run type-check
```

See [SETUP.md → Troubleshooting](./SETUP.md#troubleshooting) for more

---

## 🎓 For New Developers

1. Read [QUICKSTART.md](./QUICKSTART.md) (5 min)
2. Run `npm install && npm run dev` (5 min)
3. Test the app (5 min)
4. Read [SETUP.md](./SETUP.md) (15 min)
5. Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) (30 min)

Total: ~1 hour to get productive

---

## 🗺️ Roadmap (Next Sprints)

### Sprint 2
- [ ] Entity editing page
- [ ] Interactive charts (Recharts)
- [ ] Folder system

### Sprint 3
- [ ] React Query integration
- [ ] Google Calendar sync
- [ ] E2E tests (Cypress)

See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for full roadmap

---

## 📞 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [INDEX.md](./INDEX.md) - Documentation hub
- [SETUP.md](./SETUP.md) - Complete setup guide
- [MIGRATION.md](./MIGRATION.md) - Technical details
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Workflow & roadmap
- [SESSION_COMPLETE.md](./SESSION_COMPLETE.md) - Project summary

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # Reusable UI components (shadcn-ui)
│   └── [other]       # Feature-specific components
├── pages/            # Page components (routed)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── stores/           # Zustand state stores
├── contexts/         # React context providers
└── pages/            # Page routes
```

## API Integration

The application communicates with the Continuum Backend API using Axios.

### Base URL

Default: `https://continuum-backend.onrender.com`

Can be customized via `VITE_API_BASE_URL` environment variable.

### Authentication

- Tokens are stored in `localStorage` as `continuum_token`
- Authorization header: `Bearer {token}`
- Automatic redirect to login on 401 responses

## Building & Deployment

### Production Build

```sh
npm run build
```

The `dist` folder will contain the optimized build ready for deployment.

### Deployment Options

The application can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## License

MIT
