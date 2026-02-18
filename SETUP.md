# Setup & Configuration Guide - Continuum Frontend

## Visão Geral
Este é o frontend do **Continuum**, um Life OS journal-first com sistema de entidades, hábitos e métricas.

## Pré-requisitos
- Node.js v18+ ou Bun
- npm, yarn, ou bun como package manager

## Instalação

### 1. Instalar dependências
```bash
npm install
# ou
bun install
```

### 2. Configurar variáveis de ambiente
Criar arquivo `.env.local` na raiz do projeto:

```env
# API Configuration
VITE_API_BASE_URL=https://continuum-backend.onrender.com

# Application Settings
VITE_APP_NAME=Continuum
```

⚠️ **Importante**: O arquivo `.env.local` **não deve ser commitado**. Use `.env.example` como referência.

## Executando a aplicação

### Development
```bash
npm run dev
# ou
bun dev
```

Acesse em `http://localhost:8080`

### Build
```bash
npm run build
# ou
bun build
```

### Preview
```bash
npm run preview
# ou
bun preview
```

## Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/            # shadcn/ui components
│   ├── AppLayout.tsx  # Layout principal
│   ├── PlanBadge.tsx  # Badge de plano
│   └── ...
├── pages/             # Páginas da aplicação
│   ├── Journal.tsx    # Página de journal
│   ├── Entities.tsx   # Overview de entidades
│   ├── EntityDetail.tsx # Detalhe de entidade
│   ├── Upgrade.tsx    # Página de planos
│   ├── Settings.tsx   # Configurações
│   └── ...
├── stores/            # Estado global (Zustand)
│   └── authStore.ts   # Autenticação e user
├── lib/               # Utilitários
│   ├── axios.ts       # Cliente API configurado
│   └── utils.ts
└── contexts/          # React Contexts
    └── ThemeContext.tsx # Tema da aplicação
```

## Sistema de Autenticação

### Flow
1. Login/Register em `/login` ou `/register`
2. Token salvo em `localStorage` como `continuum_token`
3. User data salvo em `localStorage` como `continuum_user`
4. Rotas protegidas via `<ProtectedRoute>`
5. Logout limpa ambos os arquivos

### Planos suportados
- `FREE` - Plano gratuito
- `PLUS` - Plano intermediário
- `PRO` - Plano profissional
- `VISION` - Plano ultrapremiun

### AuthStore (Zustand)
```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  plan?: "FREE" | "PLUS" | "PRO" | "VISION";
  subscriptionStatus?: "ACTIVE" | "PAST_DUE" | "CANCELED" | ...;
  maxEntities?: number;
  maxNotes?: number;
  maxHabits?: number;
  advancedMetrics?: boolean;
  dataExport?: boolean;
}
```

## API Endpoints

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registrar
- `GET /auth/me` - Dados do usuário logado
- `POST /auth/google/callback` - Callback Google OAuth (futuro)

### Notas (Journal)
- `GET /api/notes` - Listar notas (com filtros opcionais)
- `GET /api/notes/{id}` - Detalhes de uma nota
- `POST /api/notes` - Criar nota
- `PUT /api/notes/{id}` - Atualizar nota
- `DELETE /api/notes/{id}` - Arquivar nota
- `PATCH /api/notes/{id}/move` - Mover para pasta

### Entidades
- `GET /api/entities` - Listar (com filtro `?type=HABIT|PERSON|...`)
- `GET /api/entities/{id}` - Detalhes
- `POST /api/entities` - Criar
- `PUT /api/entities/{id}` - Atualizar
- `DELETE /api/entities/{id}` - Arquivar
- `GET /api/entities/search` - Buscar (`?q=texto&type=HABIT`)
- `GET /api/entities/archived` - Listar arquivadas

### Tracking (Hábitos/Métricas)
- `POST /api/entities/{id}/track` - Registrar atividade
- `DELETE /api/entities/{id}/track?date=2024-01-01` - Remover registro
- `GET /api/entities/{id}/stats` - Estatísticas
- `GET /api/entities/{id}/heatmap` - Dados for heatmap
- `GET /api/tracking/today` - Registros de hoje

### Métricas & Dashboard
- `GET /api/metrics/dashboard` - Dashboard geral
- `GET /api/metrics/entities/{id}/timeline` - Timeline de entidade

### Assinaturas
- `GET /api/subscriptions/me` - Dados de assinatura
- `POST /api/subscriptions/checkout` - Iniciar checkout (Stripe)
- `POST /api/subscriptions/cancel` - Cancelar assinatura
- `POST /api/webhooks/stripe` - Webhook do Stripe

### Pastas
- `GET /api/folders` - Listar pastas
- `POST /api/folders` - Criar pasta
- `PATCH /api/folders/{id}/rename` - Renomear
- `PATCH /api/folders/{id}/move` - Mover pasta
- `DELETE /api/folders/{id}` - Deletar pasta

## Componentes Principais

### Pages
- **Journal.tsx** - Lista de notas com busca
- **JournalEditor.tsx** - Editor de notas (create/edit)
- **Entities.tsx** - Overview de entidades
- **EntityList.tsx** - Lista filtrada por tipo
- **EntityDetail.tsx** - Detalhe com heatmap e timeline
- **EntityCreate.tsx** - Criação de entidades
- **Upgrade.tsx** - Página de planos
- **Settings.tsx** - Configurações de conta
- **Search.tsx** - Busca global
- **Connections.tsx** - Dashboard de conexões

### UI Components (shadcn/ui)
- Button, Input, Textarea, Label, Switch
- Dialog, AlertDialog, Popover, Tooltip
- Card, Skeleton, Badge, Tabs, Select
- Form components com React Hook Form

### Custom Components
- **AppLayout** - Layout principal (desktop/mobile)
- **ProtectedRoute** - Proteção de rotas
- **PlanBadge** - Indicador de plano
- **LimitBanner** - Aviso de limites
- **HeatmapGrid** - Visualização de atividades
- **StreakCounter** - Contador de streak
- **ProgressModal** - Modal de registro de atividade
- **JournalCard** - Card de nota
- **EntityCard** - Card de entidade
- **MentionTag** - Tag de menção

## Configuração de Tema

### ThemeContext
- Permite alternar entre temas (dark/light)
- Salva preferência em localStorage
- Aplicado via Tailwind CSS

```tsx
const { theme, toggleTheme } = useTheme();
```

## TypeScript

### Tipos principais
```typescript
// Usuário
type UserPlan = "FREE" | "PLUS" | "PRO" | "VISION";

// Nota
interface NoteResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Entidade
interface Entity {
  id: string;
  name: string;
  type: "PERSON" | "HABIT" | "PROJECT" | "GOAL" | "DREAM" | "CUSTOM";
  tracking?: TrackingConfig;
}

// Tracking
interface TrackingEvent {
  id: string;
  entityId: string;
  date: string;
  value: number;
}
```

## Estado Global

### AuthStore (Zustand)
```typescript
// Usar em componentes
const { user, token, login, logout, updateUser } = useAuthStore();

// Methods
login(token, user)        // Salva auth
logout()                  // Limpa auth
updateUser(updates)       // Atualiza user data
hydrate()                 // Restaura do localStorage
```

## Notifications

Usa `sonner` toast library:
```typescript
import { toast } from "sonner";

toast.success("Operação realizada!");
toast.error("Algo deu errado");
toast.loading("Carregando...");
```

## Tratamento de Erros

### Autenticação
- `401` - Token expirado → redirect to `/login`
- `403` - Acesso negado (pode ser limite de plano)

### Geral
- Sempre exibir mensagem de erro com `toast.error()`
- Log em console para debugging

## Build & Deploy

### Vite Build
Otimiza assets, minifica código JavaScript/CSS

```bash
npm run build
# Output: dist/
```

### Variáveis de Ambiente em Produção
⚠️ **Importante**: `.env.local` não é sincronizado. 
Configure variáveis no seu ambiente de deploy:
- Vercel: Project Settings → Environment Variables
- Netlify: Build & Deploy → Environment
- Docker: ENV vars no container

## Checklist de Funcionalidades

### Autenticação ✅
- [x] Login com email/senha
- [x] Registro de usuário
- [x] Proteção de rotas
- [x] Persistent login (localStorage)
- [ ] Google OAuth (em desenvolvimento)
- [ ] Recuperação de senha (em desenvolvimento)

###Journal ✅
- [x] Listar notas
- [x] Criar nota
- [x] Editar nota
- [x] Deletar nota
- [x] Auto-save
- [x] Preview Markdown
- [x] Busca de notas
- [ ] Citações/referências entre notas

### Entidades ✅
- [x] CRUD completo
- [x] Filtro por tipo
- [x] Busca global
- [x] Tipos: PERSON, HABIT, PROJECT, GOAL, DREAM, CUSTOM
- [x] Tracking configurável
- [ ] Edição de entidades
- [ ] Bulk operations

### Hábitos & Tracking ✅
- [x] Registrar atividade
- [x] Heatmap (calendario de atividades)
- [x] Statistics (streak, total)
- [x] Timeline de menções
- [ ] Gráfico de evolução (Recharts)
- [ ] Metas de hábitos

### Planos & Pagamento ✅
- [x] Exibição de planos
- [x] Checkout Stripe (integration)
- [x] Plan badge
- [x] Limit banner
- [x] Cancelar assinatura
- [ ] Webhook de confirmação

### Settings ✅
- [x] Perfil (username, email)
-[x] Plano atual
- [x] Cancelar assinatura
- [x] Exportação de dados
- [x] Logout
- [ ] Deletar conta

### Dashboard ✅
- [x] Conexões (pessoas, projetos, hábitos)
- [x] Top entities
- [x] Métricas gerais
- [ ] Gráficos avançados

## Troubleshooting

### "Cannot find module 'react'"
```bash
npm install
# ou
bun install
```

### API 401/403 Errors
- Verificar se `.env.local` está configurado corretamente
- Verificar token em browser DevTools → Application → Cookies/localStorage
- Fazer logout e login novamente

### Build Fails
```bash
npm run lint    # Verificar erros ESLint
npx tsc --noEmit # Verificar erros TypeScript
```

## Performance

- React Query para caching (TBD)
- Code splitting automático via Vite
- Lazy load de rotas (via React Router)
- Image optimization (TBD)

## Próximos Passos

### Curto Prazo
1. ✅ Corrigir endpoints (Journal → Notes)
2. ✅ Suportar múltiplos planos
3. ✅ Integração completa com API
4. ⏳ Testar fluxos end-to-end

### Médio Prazo
1. Google Calendar Sync
2. Gráficos avançados (Recharts)
3. Sistema de pastas completo
4. Edição de entidades

### Longo Prazo
1. iOS/Android apps
2. Integrações com 3rd parties
3. Offline-first support
4. Collaboration features

## Suporte & Contato

📧 Para bugs ou sugestões, abrir issue no repositório.

---

**Última atualização**: 17/02/2026
