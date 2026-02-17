# Relatório de Necessidades - FrontEnd-Continuum

## 1. VARIÁVEIS DE AMBIENTE (.env.local)

```
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

**Nota:** Um arquivo `.env.example` foi criado na raiz do projeto como referência.

---

## 2. ENDPOINTS DA API CONSUMIDOS

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /auth/me` - Obter dados do usuário autenticado

### Journal (Diário)
- `GET /api/journal` - Listar todas as entradas do diário
- `GET /api/journal/{id}` - Obter detalhes de uma entrada
- `POST /api/journal` - Criar nova entrada
- `PUT /api/journal/{id}` - Atualizar entrada existente
- `DELETE /api/journal/{id}` - Deletar entrada

### Entities (Entidades - Pessoas, Hábitos, etc)
- `GET /api/entities` - Listar todas as entidades
- `GET /api/entities/stats` - Obter estatísticas gerais
- `GET /api/entities/{id}` - Detalhes de uma entidade específica
- `GET /api/entities/{id}/stats` - Estatísticas de uma entidade
- `GET /api/entities/{id}/heatmap` - Dados de mapa de calor (atividade)
- `POST /api/entities` - Criar nova entidade
- `DELETE /api/entities/{id}` - Deletar entidade
- `POST /api/entities/{id}/checkmark?date={date}` - Registrar atividade em uma data
- `POST /api/entities/{id}/track` - Registrar rastreamento/progresso

### Connections (Conexões entre entidades)
- `GET /api/connections/dashboard` - Visualização de dashboard de conexões
- `GET /api/connections/{type}/{id}` - Conexões de uma entidade específica
- `GET /api/connections/search?{params}` - Buscar conexões

### Subscription (Plano de assinatura)
- `GET /api/subscription/me` - Informações de assinatura do usuário
- `POST /api/subscription/checkout` - Iniciar processo de checkout
- `POST /api/subscription/sync` - Sincronizar status de assinatura
- `POST /api/subscription/cancel` - Cancelar assinatura

---

## 3. MODELO DE DADOS DO USUÁRIO

```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  plan?: "FREE" | "PRO";
  active?: boolean;
}
```

---

## 4. AUTENTICAÇÃO

- **Método:** Bearer Token JWT
- **Header:** `Authorization: Bearer {token}`
- **Armazenamento:** localStorage
- **Chaves utilizadas:**
  - `continuum_token` - Token JWT
  - `continuum_user` - Dados do usuário (JSON stringificado)
- **Comportamento:** Redirecionamento automático para login (401)

---

## 5. ESTRUTURA DE TIPOS DE ENTIDADES

O sistema suporta diferentes tipos de entidades (rastreáveis através dos endpoints):
- **people** - Pessoas
- **habits** - Hábitos
- Outros tipos podem ser suportados pela API

---

## 6. DEPENDÊNCIAS PRINCIPAIS

### Runtime
- React 18.3.1
- React Router 6.30.1
- Axios 1.13.5 (HTTP client)
- Zustand 5.0.11 (State management)
- TanStack React Query 5.83.0 (Server state)
- React Hook Form 7.61.1 (Form management)
- Tailwind CSS 3.4.17 (Styling)
- shadcn-ui components

### Development
- TypeScript 5.8.3
- Vite 5.4.19 (Build tool)
- ESLint 9.32.0
- Vitest 3.2.4 (Testing)

---

## 7. SCRIPTS DISPONÍVEIS

```bash
npm run dev           # Iniciar servidor de desenvolvimento
npm run build         # Build para produção
npm run build:dev     # Build em modo desenvolvimento
npm run preview       # Visualizar build de produção
npm run lint          # Executar linter ESLint
npm run test          # Rodar testes uma vez
npm run test:watch    # Rodar testes em modo watch
```

---

## 8. CONFIGURAÇÃO DO SERVIDOR DE DESENVOLVIMENTO

- **Host:** `::`
- **Porta:** `8080`
- **HMR:** Overlay desabilitado

---

## 9. FUNCIONALIDADES PRINCIPAIS

### Dashboard
- Visualização de statisticas gerais
- Dashboard de conexões
- Mapa de calor de atividades

### Journal
- Criar, editar e deletar entradas
- Armazenamento de textos longos

### Entity Management
- Rastrear entidades (pessoas, hábitos)
- Registrar checkmarks de atividades
- Visualizar estatísticas e progressão
- Deletar entidades

### Subscription
- Gerenciar planos (FREE/PRO)
- Processar pagamentos
- Sincronizar status de assinatura

### Busca
- Buscar por todos os recursos
- Busca em conexões

---

## 10. REMOVIDO DO PROJETO

✅ Dependência `lovable-tagger` removida do `package.json`
✅ Importação do `componentTagger` removida de `vite.config.ts`
✅ README.md atualizado, removidas todas as referências ao Lovable
✅ Arquivo `.env.example` criado para documentar variáveis de ambiente

---

## 11. PRÓXIMAS ETAPAS RECOMENDADAS

1. **Configurar variáveis de ambiente:** Criar `.env.local` com `VITE_API_BASE_URL`
2. **Validar backend:** Certificar que todos os endpoints documentados estão implementados
3. **Testes:** Executar suite de testes com `npm run test`
4. **Build:** Testar build de produção com `npm run build`
5. **Deployment:** Configurar em Vercel, Netlify ou outro host estático

---

**Data do Relatório:** 17 de Fevereiro de 2026
**Status:** ✅ Projeto limpo de dependências do Lovable
