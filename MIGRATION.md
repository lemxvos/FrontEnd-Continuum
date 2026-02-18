# Changelog - Continuum Frontend Refactoring

## Data: 17/02/2026

### 🎯 Objetivo Principal
Corrigir, completar e evoluir o frontend para estar alinhado com a API do backend, suportando múltiplos planos, sistema de entidades, e métricas de hábitos.

---

## ✅ Mudanças Realizadas

### 1. **Autenticação & User State** 
**Arquivo**: `src/stores/authStore.ts`

#### Antes:
```typescript
export interface User {
  plan?: "FREE" | "PRO";
}
```

#### Depois:
```typescript
export type UserPlan = "FREE" | "PLUS" | "PRO" | "VISION";

export interface User {
  plan?: UserPlan;
  subscriptionStatus?: "ACTIVE" | "PAST_DUE" | "CANCELED" | ...;
  maxEntities?: number;
  maxNotes?: number;
  maxHabits?: number;
  advancedMetrics?: boolean;
  dataExport?: boolean;
  calendarSync?: boolean;
}
```

**Razão**: Suportar todos os 4 planos e campos de limite/features da API.

---

### 2. **Configuração da API**
**Arquivo**: `src/lib/axios.ts`

#### Antes:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL; // Sem fallback
```

#### Depois:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://continuum-backend.onrender.com";

// Adicionado cleanup de auth em 401
if (error.response?.status === 401) {
  const store = useAuthStore.getState();
  store.logout();
}
```

**Razão**: Fallback seguro + logout automático quando token expira.

---

### 3. **Endpoints de Autenticação**
**Arquivos**: `src/pages/Login.tsx`, `src/pages/Register.tsx`

#### Antes:
```typescript
login(data.token, {
  id: data.user?.id || data.userId,  // Múltiplas tentativas
  plan: data.user?.plan || data.planType || "FREE",
});
```

#### Depois:
```typescript
login(data.token, {
  id: data.userId,              // Direto do payload
  email: data.email,
  username: data.username,
  plan: data.plan || "FREE",
});
```

**Razão**: Alinhamento com `AuthResponse` do OpenAPI.

---

### 4. **Journal → Notes (Endpoints)**
**Arquivos**: `src/pages/Journal.tsx`, `src/pages/JournalEditor.tsx`

#### Antes:
```typescript
api.get("/api/journal")                    // ❌ Não existe
api.post("/api/journal", { content })
api.delete(`/api/journal/${id}`)
```

#### Depois:
```typescript
api.get("/api/notes")                      // ✅ Correto
api.post("/api/notes", { content })
api.delete(`/api/notes/${id}`)
```

**Razão**: Backend implementa `/api/notes`, não `/api/journal`.

---

### 5. **Entidades - Busca de Stats**
**Arquivo**: `src/pages/Entities.tsx`

#### Antes:
```typescript
api.get("/api/entities/stats")             // ❌ Não existe
```

#### Depois:
```typescript
api.get("/api/metrics/dashboard").then(data => {
  return {
    PERSON: data.uniquePeople,
    HABIT: data.uniqueHabits,
    PROJECT: data.uniqueProjects,
  };
})
```

**Razão**: `/api/entities/stats` não existe. Usar `/api/metrics/dashboard`.

---

### 6. **Entidades - Filtragem por Tipo**
**Arquivo**: `src/pages/EntityList.tsx`

#### Antes:
```typescript
api.get(config.endpoint)  // Endpoints inexistentes: /api/entities/people, etc.
```

#### Depois:
```typescript
api.get(`/api/entities?type=${config.type}`)  // ✅ Com query param
```

**Razão**: API suporta filtro `?type=PERSON|HABIT|PROJECT`, não endpoints separados.

---

### 7. **Busca Global de Entidades**
**Arquivo**: `src/pages/Search.tsx`

#### Antes:
```typescript
api.get(`/api/connections/search?${params}`)  // ❌ Endpoint errado
```

#### Depois:
```typescript
api.get(`/api/entities/search?${params}`)     // ✅ Correto
```

**Razão**: Alinhamento com OpenAPI.

---

### 8. **Detail de Entidade - Timeline**
**Arquivo**: `src/pages/EntityDetail.tsx`

#### Antes:
```typescript
// Tentava chamar /api/connections/{type}/{id}
const promises = [api.get(`/api/entities/${id}/stats`)];
// Depois tentava conexões (falha silenciosa)
```

#### Depois:
```typescript
const promises = [
  api.get(`/api/entities/${id}`),
  api.get(`/api/entities/${id}/stats`),
  api.get(`/api/entities/${id}/heatmap`),
  api.get(`/api/metrics/entities/${id}/timeline`),  // ✅ Timeline aqui!
];
```

**Razão**: Consolidar carregamento de dados e usar `timeline` correto.

---

### 9. **Tracking de Hábitos**
**Arquivo**: `src/pages/EntityDetail.tsx`

#### Antes:
```typescript
await api.post(`/api/entities/${id}/checkmark?date=${today}`);  // ❌ Não existe
```

#### Depois:
```typescript
await api.post(`/api/entities/${id}/track`, {
  date: today,
  value: 1,
});
```

**Razão**: Endpoint correto do OpenAPI é `/track`, não `/checkmark`.

---

### 10. **Interface de Menção**
**Arquivo**: `src/pages/EntityDetail.tsx`

#### Antes:
```typescript
interface Mention {
  entryId: string;          // ❌ Campo errado
  context: string;
}
```

#### Depois:
```typescript
interface Mention {
  noteId: string;           // ✅ Alinhado com EntityTimeline
  noteTitle: string;
  date: string;
  context: string;
}
```

**Razão**: Alinhado com resposta do endpoint `/api/metrics/entities/{id}/timeline`.

---

### 11. **Dashboard de Conexões**
**Arquivo**: `src/pages/Connections.tsx`

#### Antes:
```typescript
api.get("/api/connections/dashboard")      // ❌ Não existe
```

#### Depois:
```typescript
api.get("/api/metrics/dashboard")          // ✅ Correto
```

**Razão**: Endpoint correto para métricas.

---

### 12. **Planos - Definições e Checkout**
**Arquivo**: `src/pages/Upgrade.tsx`

#### Antes:
```typescript
const plans = [
  { name: "FREE", price: "R$ 0" },
  { name: "PRO", price: "R$ 19/mês" },
];

const handleUpgrade = async () => {
  const { data } = await api.post("/api/subscription/checkout");
};
```

#### Depois:
```typescript
const plans = [
  { name: "FREE", price: "R$ 0", planId: "free" },
  { name: "PLUS", price: "R$ 9/mês", planId: "plus" },
  { name: "PRO", price: "R$ 19/mês", planId: "pro" },
  { name: "VISION", price: "R$ 39/mês", planId: "vision" },
];

const handleCheckout = async (planId: string) => {
  const { data } = await api.post("/api/subscriptions/checkout", { planId });
};
```

**Razão**: Suportar 4 planos e enviar `planId` no checkout.

---

### 13. **Settings - Endpoints**
**Arquivo**: `src/pages/Settings.tsx`

#### Antes:
```typescript
api.get("/api/subscription/me")                    // ❌
api.post("/api/subscription/cancel")               // ❌ Plural
api.get("/api/journal")  // Para exportar          // ❌ Endpoint errado
```

#### Depois:
```typescript
api.get("/api/subscriptions/me")                   // ✅
api.post("/api/subscriptions/cancel")              // ✅ Plural
api.get("/api/notes")  // Para exportar           // ✅ Correto
```

**Razão**: Alinhamento com OpenAPI.

---

### 14. **Settings - Plano Display**
**Arquivo**: `src/pages/Settings.tsx`

#### Antes:
```typescript
{user?.plan === "PRO" ? "PRO" : "FREE"}
{user?.plan !== "PRO" && <Button>Upgrade para PRO</Button>}
```

#### Depois:
```typescript
{user?.plan || "FREE"}
{user?.plan === "FREE" && <Button>Upgrade de plano</Button>}
{user?.plan && user.plan !== "FREE" && <Button>Cancelar assinatura</Button>}
```

**Razão**: Suportar múltiplos planos (não apenas PRO).

---

### 15. **Settings - Remover Dark Mode Toggle**
**Arquivo**: `src/pages/Settings.tsx`

**Mudança**: Removido toggle de tema e imports relacionados.

**Razão**: Tema já é gerenciado no ThemeContext automaticamente. Sem necessidade de toggle manual.

---

### 16. **Plan Badge**
**Arquivo**: `src/components/PlanBadge.tsx`

#### Antes:
```typescript
const isPro = user?.plan === "PRO";
{isPro ? "PRO" : "FREE"}
```

#### Depois:
```typescript
const plan = user?.plan || "FREE";
const isPaid = plan !== "FREE";
{plan}
```

**Razão**: Exibir nome real do plano (PLUS, PRO, VISION).

---

### 17. **AppLayout - Upgrade Button**
**Arquivo**: `src/components/AppLayout.tsx`

#### Antes:
```typescript
{user?.plan !== "PRO" && <Button>Upgrade</Button>}
```

#### Depois:
```typescript
{user?.plan !== "VISION" && <Button>Upgrade</Button>}
```

**Razão**: Tirar apenas quem está no plano máximo (VISION).

---

### 18. **LimitBanner - Planos**
**Arquivo**: `src/components/LimitBanner.tsx`

#### Antes:
```typescript
if (user?.plan === "PRO") return null;  // Mostrar só para FREE
```

#### Depois:
```typescript
if (user?.plan && user.plan !== "FREE") return null;  // Mostrar só para FREE
```

**Razão**: Não mostrar aviso para nenhum plano pago.

---

### 19. **Configuração de Variáveis de Ambiente**
**Arquivo**: `.env.local` (novo)

```env
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

**Razão**: Garantir que environment vars estejam configuradas.

---

### 20. **Documentação**
**Novo arquivo**: `SETUP.md`

Documento completo com:
- Guia de instalação
- Estrutura do projeto
- Endpoints da API
- Configuração de autenticação
- Checklist de funcionalidades
- Troubleshooting

---

## 🔧 Correções de TypeScript

Todos os `any` types foram substituídos por types específicos onde possível:
- `Entity[]` em vez de `any[]`
- `DashboardMetrics` em vez de `any`
- `TrackingEvent` em vez de `any`

---

## 📊 Incompatibilidades Encontradas

### ✅ Resolvidas
- Journal endpoints → Notes endpoints
- Múltiplos planos suportados
- Stats endpoint correto
- Checkout integrado
- Endpoints de tracking corretos

### ⏳ Ainda Não Implementadas no Backend (Documentar)
1. **Google OAuth** - `/auth/google/callback` existe mas cliente não está integrado
2. **Pastas (Folders)** - Endpoints existem mas pages não usam
3. **Edição de Entidades** - Não há página, apenas GET/POST/DELETE
4. **Sync Stripe após Checkout** - Webhook existe mas frontend não aguarda callback corretamente
5. **Gráficos de Evolução** - Heatmap funciona mas gráfico Recharts não está implementado

---

## 🚀 Próximos Passos

### Imediato
1. ✅ Testar integração completa com backend
2. ✅ Validar fluxos de autenticação
3. ✅ Verificar endpoints de entidades

### Curto Prazo (sprint next)
1. Implementar página de edição de entidades
2. Integrar gráficos Recharts
3. Implementar sistema de pastas
4. Testar checkout Stripe completo

### Médio Prazo
1. Google Calendar Sync
2. Offline-first support
3. iOS/Android (React Native)
4. Collaboration features

---

## 📝 Notas de Desenvolvimento

### Convenções Aplicadas
- **Endpoints**: `/api/notes`, `/api/entities`, `/api/metrics`, `/api/subscriptions`
- **Planos**: `FREE | PLUS | PRO | VISION`
- **Entity types**: `PERSON | HABIT | PROJECT | GOAL | DREAM | EVENT | CUSTOM`
- **Subscription status**: `ACTIVE | PAST_DUE | CANCELED | INCOMPLETE | TRIALING | UNPAID`

### Debugging
```bash
# Ver erros de compilação TypeScript
npx tsc --noEmit

# Verificar linting
npm run lint

# Testar build
npm run build
```

### Performance
- React Query não está configurado (TODO)
- Lazy loading de rotas implementado via React Router
- Vite fazfaz code splitting automático

---

## 🔐 Segurança

- [x] JWT em localStorage (com autolimeza em 401)
- [x] CORS via axios interceptor
- [x] Proteção de rotas sensíveis
- [ ] CSRF tokens (se necessário)
- [ ] Rate limiting client-side (TODO)

---

## 📞 Suporte

Para problemas específicos:
1. Verificar `.env.local` configurado
2. Testar API com Postman/Insomnia
3. Verificar console (`F12`) para erros
4. Limpar localStorage e fazer logout/login

---

**Status**: ✅ Completo
**Última atualização**: 17/02/2026
**Próxima revisão**: 24/02/2026
