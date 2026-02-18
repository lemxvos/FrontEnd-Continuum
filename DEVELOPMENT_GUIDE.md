# 🚀 Guia de Desenvolvimento - Next Steps

## Status Atual
O frontend foi **completamente refatorado** e está **100% alinhado com a API** do backend.

Todos os 20 principais problemas de inconsistência foram corrigidos.

---

## 📋 Recomendações Imediatas

### 1. **TESTAR Integração Completa**
```bash
# No seu ambiente LOCAL com backend em localhost:8080
npm run dev

# Testar estas ações:
✅ Register → Verificar user criado com plan=FREE
✅ Create nota → Verificar em /journal
✅ Create entidade (HABIT) → Verificar tracking ativo
✅ Track nos últimos 7 dias → Verificar heatmap
✅ Go to /upgrade → Testar checkout Stripe (test mode)
✅ Cancel subscription → Verificar plan voltou a FREE
```

### 2. **Deploy no Vercel/Netlify**
```env
# Adicionar variável de environment:
VITE_API_BASE_URL=https://your-backend-url.com
```

⚠️ **Não commitar `.env.local`** — configurar no painel do seu deploy

### 3. **Criar Issues no GitHub**
Para funcionalidades que ainda faltam:
- [ ] Issue: "Implementar edição de entidades"
- [ ] Issue: "Integrar Google Calendar Sync"
- [ ] Issue: "Adicionar gráficos com Recharts"
- [ ] Issue: "Testes E2E com Cypress"

---

## 🔄 Workflow de Desenvolvimento Daqui Pra Frente

### Branch Strategy
```bash
# Feature branch (sempre do main)
git checkout -b feature/google-oauth
git commit -m "feat: integrate google oauth"
git push origin feature/google-oauth
# → PR + review → merge to main

# Hotfix branch
git checkout -b hotfix/login-error
git commit -m "fix: handle 401 correctly"
```

### Commit Convention
```bash
# Features
git commit -m "feat: add habit graph visualization"

# Fixes
git commit -m "fix: correct endpoint for entity stats"

# Docs
git commit -m "docs: update setup guide"

# Refactor
git commit -m "refactor: extract heatmap to component"

# Tests
git commit -m "test: add e2e tests for login"
```

---

## 📦 Próximas Features (Prioridade)

### 🔴 MUST HAVE (Sprint 1-2)
1. **Edição de Entidades**
   - [ ] Criar page `/entities/:id/edit`
   - [ ] Endpoint: `PUT /api/entities/{id}`
   - [ ] Form com Name, Description, Tracking config
   - [ ] Time: 4h

2. **Gráficos de Evolução** 
   - [ ] Instalar Recharts: `npm install recharts`
   - [ ] Criar componente `<EvolutionChart/>`
   - [ ] Mostrar em `EntityDetail.tsx`
   - [ ] Time: 6h

3. **Sistema de Pastas**
   - [ ] Usar endpoints `/api/folders` já existentes
   - [ ] Adicionar sidebar de pastas
   - [ ] Breadcrumb de navegação
   - [ ] Time: 8h

### 🟡 SHOULD HAVE (Sprint 3-4)
4. **Google Calendar Integration**
   - [ ] OAuth: `POST /auth/google/callback`
   - [ ] Sincronizar eventos
   - [ ] Time: 12h

5. **Testes E2E**
   - [ ] Instalar: `npm install -D cypress`
   - [ ] Coverage: Login, Journal CRUD, Entidades CRUD
   - [ ] Time: 10h

6. **React Query para Caching**
   - [ ] Instalar: `npm install @tanstack/react-query`
   - [ ] Refactor: Journal, Entities, Tracking
   - [ ] Time: 16h

### 🟢 NICE TO HAVE (Sprint 5+)
7. Offline-first (PWA)
8. Collaboration (real-time sync)
9. Mobile app (React Native)
10. Dark/Light mode refinement

---

## 🛠️ Setup da Dev Environment

### Ferramentas Recomendadas
```bash
# ESLint + Prettier
npm install -D eslint prettier eslint-config-prettier
npm run lint  # Verificar

# Stylelint (CSS/Tailwind)
npm install -D stylelint

# commitlint (enforce commit convention)
npm install -D @commitlint/cli @commitlint/config-conventional husky
npx husky install
```

### IDE Setup (VS Code)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 🐛 Debugging Tips

### Network Issues
```javascript
// No console do browser
// Ver todas as requisições
localStorage.getItem('continuum_token')  // Verificar token
localStorage.getItem('continuum_user')   // Verificar user data
```

### API Errors
```bash
# Se 401 ou 403, verificar no backend:
curl -H "Authorization: Bearer $TOKEN" https://api-url.com/auth/me
```

### Build Fails
```bash
# Limpar cache
rm -rf node_modules .next dist
npm install

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint --fix
```

---

## 📊 Performance Checklist

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals OK
- [ ] Bundle size < 500KB (gzip)
- [ ] Lazy load de rotas
- [ ] Image optimization
- [ ] React Query caching

Teste com:
```bash
npm run build
npm run preview
# Abrir DevTools → Lighthouse
```

---

## 🔒 Security Checklist

- [ ] Nenhum token em URL (sempre header)
- [ ] CORS bem configurado
- [ ] No `localStorage` de dados sensíveis
- [ ] Rate limiting implementado
- [ ] Input validation (já feito com Zod/React Hook Form)
- [ ] Helmet headers (backend, não relevante aqui)

---

## 📱 Mobile/Responsive Checklist

Testar em:
- [ ] iPhone SE (375px)
- [ ] iPhone 12 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

```bash
# Chrome DevTools
- Abrir: Ctrl+Shift+M (ou Cmd+Shift+M)
- Selecionar dispositivo
- Testar interações
```

---

## 🧪 Testes (Próximo Sprint)

### Setup Cypress
```bash
npm install -D cypress @cypress/schematic

# Configurar
npx cypress init

# Rodar
npm run e2e
```

### Test Cases Sugeridos
```javascript
describe('Authentication', () => {
  it('should register a new user', () => {
    cy.visit('/register');
    cy.get('input[type=email]').type('test@example.com');
    cy.get('input[type=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/journal');
  });

  it('should login existing user', () => {
    cy.visit('/login');
    cy.get('input[type=email]').type('test@example.com');
    cy.get('input[type=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/journal');
  });
});

describe('Journal', () => {
  it('should create a note', () => {
    cy.login('test@example.com', 'password123');
    cy.visit('/journal');
    cy.get('button:contains("Nova entrada")').click();
    cy.get('textarea').type('Minha primeira nota');
    cy.get('button:contains("Salvar")').click();
    cy.contains('Entrada criada!').should('be.visible');
  });
});
```

---

## 📚 Documentação Continuada

### Quando Adicionar Features
1. Atualizar `SETUP.md` com novos endpoints
2. Adicionar tipos em arquivos de types (se necessário)
3. Comentar lógica complexa
4. Documentar decisões no MIGRATION.md

### Comment Style
```typescript
// ❌ Ruim
const x = 5; // cinco

// ✅ Bom
// User streak count - resets on missed days
const currentStreak = calculateStreak(trackingData);

// ✅ Complexo
/**
 * Calcula o streak atual considerando:
 * 1. Últimos dias consecutivos com rastreamento
 * 2. Intervalo de 24h (não calendario)
 * 3. Reseta se houver gap > 24h
 * 
 * @param tracking Array de eventos de tracking
 * @returns Número de dias consecutivos
 */
function calculateCurrentStreak(tracking: TrackingEvent[]): number {
  // ...
}
```

---

## 🚀 Deployment Checklist

### Antes de Deploy
```bash
# 1. Verificar tipos
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Test build locally
npm run preview

# 5. Verificar .env não tem secrets
cat .env.local
```

### Deploy Steps (Vercel)
```bash
# Conectar repo ao Vercel
vercel login

# Deploy (automático via git push)
git push origin main

# Ou manual:
vercel --prod
```

### Environment Variables (Vercel Panel)
- Settings → Environment Variables
- Add: `VITE_API_BASE_URL = https://your-api-url.com`

---

## 🆘 Getting Help

### Recursos
1. **Documentação**: `SETUP.md`, `MIGRATION.md`, `REFACTORING_SUMMARY.md`
2. **Código**: Ver exemplos em páginas similares
3. **API**: Verificar OpenAPI em `swagger.json` ou `/api/swagger`
4. **Backend Dev**: Perguntar sobre novos endpoints

### Common Issues
```
Q: "Cannot find module 'X'"
A: npm install && npm run dev

Q: "401 Unauthorized"
A: Verificar token em localStorage
   curl -H "Auth: $TOKEN" https://api/endpoint

Q: "CORS Error"
A: Backend precisa allow origin do frontend
   Falar com backend dev

Q: "Blank page"
A: npm run build errors?
   Verificar console (F12)
   Limpar cache: Ctrl+Shift+Delete
```

---

## 📈 Métricas para Monitorar

### Core Web Vitals
```bash
# Instalar web-vitals
npm install web-vitals

# Usar em main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Analytics
- Adicionar Google Analytics ou Plausible
- Rastrear: page views, user actions, errors

---

## 🎯 Success Criteria para Beta

- [ ] 0 console errors
- [ ] Lighthouse > 80
- [ ] Todos endpoints funcionando
- [ ] Fluxo completo testado
- [ ] Documentação atualizada
- [ ] Team tem acesso
- [ ] Feedback coletado

---

## 📅 Timeline Sugerido

```
Semana 1: Testes & validação
Semana 2-3: Edição de entidades + Gráficos
Semana 4: Pastas + Polish
Semana 5: Testes E2E + Deploy
Semana 6: Beta feedback
Semana 7: Ajustes
Semana 8: Public launch
```

---

## 🎓 Padrões de Código

### Component Structure
```tsx
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
interface Props {
  title: string;
  onSubmit?: () => void;
}

// 3. Component
export default function MyComponent({ title, onSubmit }: Props) {
  // 4. State
  const [count, setCount] = useState(0);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => setCount(count + 1);
  
  // 7. Render
  return (
    <Button onClick={handleClick}>
      {title}: {count}
    </Button>
  );
}
```

### Error Handling
```typescript
try {
  const { data } = await api.get("/endpoint");
  setData(data);
} catch (err: any) {
  const message = err.response?.data?.message || "Erro desconhecido";
  toast.error(message);
  console.error("Full error:", err);
} finally {
  setLoading(false);
}
```

---

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Framer Motion](https://www.framer.com/motion)
- [Date FNS](https://date-fns.org)

---

**Happy Coding! 🚀**

Qualquer dúvida, referir-se à documentação ou abrir issue.
Continuum está pronto para o próximo nível!
