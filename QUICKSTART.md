# ⚡ Quick Start - Continuum Frontend

**Tempo estimado: 5 minutos**

---

## 1️⃣ Instalar Dependências

```bash
cd /workspaces/FrontEnd-Continuum
npm install
# ou: bun install
```

✅ Resultado esperado: `npm run dev` funciona sem erros

---

## 2️⃣ Configurar Ambiente

O arquivo `.env.local` já existe com:
```env
VITE_API_BASE_URL=https://continuum-backend.onrender.com
VITE_APP_NAME=Continuum
```

Para desenvolvimento local, altere:
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 3️⃣ Iniciar Servidor

```bash
npm run dev
```

Abra em browser: **http://localhost:5173**

---

## 4️⃣ Testar Fluxo Principal

### 🔐 Autenticação (2 min)
```
1. Clique "Register"
2. Preencha: Email, Username, Senha
3. Submit → Verifica se criou com plan=FREE
```

### 📝 Journal (2 min)
```
1. Clique "Journal"
2. Clique "New Note"
3. Escreva algo e salve
4. Volte para Journal → Verifica se lista
```

### 🏢 Entidades (1 min)
```
1. Clique "Entities"
2. Clique em um tipo (People, Habits, etc)
3. Clique "Create" → Preencha → Submit
```

---

## 5️⃣ Próximos Passos

![Status]
```
✅ Frontend refatorado & corrigido
✅ Todos 30+ endpoints alinhados
✅ 4 planos (FREE, PLUS, PRO, VISION)
⏳ Próximo: QA Testing
⏳ Próximo: Deploy Staging
```

---

## 📚 Documentação Completa

| Doc | Para | Tempo |
|-----|------|-------|
| [SETUP.md](./SETUP.md) | Devs | 15 min |
| [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) | Todos | 20 min |
| [MIGRATION.md](./MIGRATION.md) | Code Review | 30 min |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Dev Workflow | 30 min |
| [INDEX.md](./INDEX.md) | Navegação | 5 min |
| [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) | Métricas | 10 min |

---

## 🎯 Status das Features

```
AUTENTICAÇÃO
├── ✅ Register com plan=FREE
├── ✅ Login com JWT
└── ✅ Logout automático 401

JOURNAL
├── ✅ Create note
├── ✅ List notas
├── ✅ Delete note
└── ✅ Auto-save

ENTIDADES
├── ✅ Create entity
├── ✅ List por tipo
├── ✅ Detail com stats
├── ✅ Tracking
├── ✅ Heatmap
└── ✅ Timeline

BUSCA
├── ✅ Global search
└── ✅ Filtro por tipo

PLANOS
├── ✅ 4 tiers (FREE, PLUS, PRO, VISION)
├── ✅ Checkout via Stripe
└── ✅ Limits por plano

SETTINGS
├── ✅ Profile
├── ✅ Subscription status
├── ✅ Data export
└── ✅ Logout
```

---

## 🐛 Troubleshooting Rápido

### "npm install fails"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "VITE_API_BASE_URL não funciona"
Verificar [SETUP.md → Troubleshooting](./SETUP.md#troubleshooting)

### "Erro 401 no register"
Backend deve estar rodando em localhost:8080 ou staging

### "TypeScript errors em src/"
```bash
npm run type-check
```

---

## 🚀 Deploy Rápido

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Deploy (Vercel)
```bash
npm install -g vercel
vercel
```

---

## 💡 Tips

- **DevTools**: F12 para console/network
- **Componentes**: Verificar src/components/
- **Páginas**: Verificar src/pages/
- **API**: Documentado em [SETUP.md → API Endpoints](./SETUP.md#api-endpoints)

---

## 🎓 Próximas Features

1. **Edição de Entidades** (4h) - Precisa de página em src/pages/EntityEdit.tsx
2. **Gráficos** (6h) - Usar Recharts + dados de /api/metrics
3. **Pastas** (8h) - UI para organizar notas

Ver [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) para detalhes.

---

## ✅ Getting Help

```
Erro específico?
→ Ver SETUP.md → Troubleshooting

Fluxo não funciona?
→ Ver MIGRATION.md → Mudanças

Precisa código novo?
→ Ver DEVELOPMENT_GUIDE.md → Patterns

Precisa artefatos?
→ Ver INDEX.md → Documentação
```

---

## 🗂️ Estrutura Importante

```
src/
├── pages/          # 13 páginas + routing
├── components/     # UI reutilizáveis
├── stores/         # Zustand (auth)
├── lib/            # Axios + utils
├── contexts/       # Theme
└── hooks/          # Custom hooks

.env.local         # Variáveis (já criado)
vite.config.ts     # Build config
tsconfig.json      # TypeScript
```

---

**Pronto? Comece com `npm run dev` 🚀**

Documentação completa: [INDEX.md](./INDEX.md)
