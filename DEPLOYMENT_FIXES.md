# Correções para Deploy no Vercel

## 🎯 Resumo

Este documento detalha as correções aplicadas para resolver **4 erros críticos** de build no Vercel.

## 📝 Problemas Identificados e Soluções

### ❌ Erro 1: Platform-Specific Dependencies (EBADPLATFORM)

**Mensagem de erro:**
```
npm error code EBADPLATFORM
npm error notsup Unsupported platform for @rollup/rollup-win32-x64-msvc@4.46.2
```

**Causa:**
O `package-lock.json` foi gerado em ambiente Windows e continha dependências específicas de plataforma que não podem ser instaladas no Linux (ambiente do Vercel).

**Solução:**
1. Regenerado `package-lock.json` em ambiente Linux
2. Atualizado `vercel.json` para usar `npm install --legacy-peer-deps`

**Arquivos modificados:**
- `package-lock.json` - Regenerado
- `vercel.json` - Adicionado `--legacy-peer-deps` ao installCommand

**Commit:** `8ca5c4d - fix: Resolve Vercel build error with platform-specific dependencies`

---

### ❌ Erro 2: Turborepo Pipeline Deprecated

**Mensagem de erro:**
```
Error: Found `pipeline` field instead of `tasks`.
Changed in 2.0: `pipeline` has been renamed to `tasks`.
```

**Causa:**
Turborepo 2.0 renomeou o campo `pipeline` para `tasks` no arquivo de configuração.

**Solução:**
Atualizado `turbo.json` para usar o novo formato com campo `tasks`.

**Arquivos modificados:**
- `turbo.json` - Renomeado `pipeline` para `tasks`

**Commit:** `e9c547a - fix: Update turbo.json to use 'tasks' instead of deprecated 'pipeline'`

---

### ❌ Erro 3: Next.js 15 API Route Type Error

**Mensagem de erro:**
```
Type error: Route "src/app/api/requests/[id]/route.ts" has an invalid "GET" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

**Causa:**
Next.js 15 mudou a assinatura dos API routes com parâmetros dinâmicos. O segundo parâmetro agora deve ser `Promise<{ id: string }>` em vez de `{ id: string }`.

**Solução:**
Atualizado tipo de `params` para `Promise<{ id: string }>` e adicionado `await params` no código.

**Arquivos modificados:**
- `apps/web/src/app/api/requests/[id]/route.ts` - Tipo e acesso ao params

**Commit:** `3fcd72d - fix: Resolve Next.js 15 API route type error`

---

### ❌ Erro 4: Missing Environment Variables & ESLint

**Mensagem de erro:**
```
WARNING - the following environment variables are set on your Vercel project,
but missing from "turbo.json":
- SUPABASE_SERVICE_KEY
- USE_SUPABASE_STORAGE
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- AZURE_CLIENT_ID
- AZURE_CLIENT_SECRET

ESLint must be installed in order to run during builds
```

**Causa:**
1. Turborepo precisa conhecer todas as variáveis de ambiente usadas no build
2. Pacote `eslint` não estava instalado explicitamente

**Solução:**
1. Adicionadas todas as variáveis de ambiente server-side no `turbo.json`
2. Adicionado `eslint` como devDependency no `apps/web/package.json`

**Arquivos modificados:**
- `turbo.json` - Adicionadas env vars em `tasks.build.env` e `globalEnv`
- `apps/web/package.json` - Adicionado `"eslint": "^8"`
- `package-lock.json` - Instalado eslint e dependências

**Commit:** `3fcd72d - fix: Resolve Next.js 15 API route type error and build warnings`

---

## 📂 Arquivos de Configuração Atualizados

### vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "turbo run build --filter=web",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

### turbo.json (estrutura atualizada)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SERVER_URL",
        "SUPABASE_SERVICE_KEY",
        "USE_SUPABASE_STORAGE",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "AZURE_CLIENT_ID",
        "AZURE_CLIENT_SECRET"
      ]
    }
  },
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SERVER_URL",
    "SUPABASE_SERVICE_KEY",
    "USE_SUPABASE_STORAGE",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "AZURE_CLIENT_ID",
    "AZURE_CLIENT_SECRET"
  ]
}
```

### API Route (Next.js 15 compatible)
```typescript
// apps/web/src/app/api/requests/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise wrapper
) {
  const { id } = await params;  // ✅ await params
  // ... rest of code
}
```

---

## 🚀 Deploy Status

**Branch Principal de Deploy:** `main`

**Commits aplicados:**
1. `f567a0f` - Configuração inicial do Vercel
2. `8ca5c4d` - Fix de dependências específicas de plataforma
3. `e9c547a` - Fix do Turborepo 2.0 (pipeline → tasks)
4. `3fcd72d` - Fix de tipos Next.js 15 + env vars + ESLint

**Status Esperado:** ✅ Build deve completar com sucesso após aplicar estas correções

---

## 📋 Próximos Passos

1. **Push para GitHub:**
   ```bash
   # Push da branch main
   git push origin main --force-with-lease

   # Push da branch develop
   git checkout develop
   git push origin develop
   ```

2. **Verificar Deploy:**
   - Acessar: https://vercel.com/gtaquino-automatelabs-projects
   - Verificar que o build está rodando
   - Confirmar que não há erros

3. **Configurar Variáveis de Ambiente:**
   - Adicionar todas as variáveis do `.env.local` no dashboard do Vercel
   - Atualizar OAuth redirect URIs após primeiro deploy

---

## 🔧 Comandos de Build (Referência)

### Local
```bash
npm install --legacy-peer-deps
turbo run build --filter=web
```

### Vercel
```bash
npm install --legacy-peer-deps  # Executado automaticamente
turbo run build --filter=web    # Executado automaticamente
```

---

## ✅ Checklist de Verificação

- [x] `package-lock.json` regenerado sem dependências específicas de Windows
- [x] `vercel.json` configurado com `--legacy-peer-deps`
- [x] `turbo.json` atualizado para Turborepo 2.0 (`tasks` em vez de `pipeline`)
- [x] Todas as variáveis de ambiente declaradas no `turbo.json`
- [x] ESLint instalado como devDependency
- [x] API route atualizada para Next.js 15 (params como Promise)
- [ ] Push para GitHub (aguardando autenticação)
- [ ] Deploy no Vercel bem-sucedido
- [ ] Variáveis de ambiente configuradas
- [ ] OAuth redirect URIs atualizados

---

**Última atualização:** 2025-10-23
**Status:** Pronto para deploy após push para GitHub
