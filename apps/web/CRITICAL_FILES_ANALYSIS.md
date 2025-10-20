# Análise de Arquivos Críticos - Trip Form App

## Resumo Executivo

Este documento identifica os arquivos e pastas **estritamente necessários** para manter o trip-form-app funcional. A análise foi baseada no funcionamento atual do sistema, não em possibilidades futuras.

## 1. Arquivos de Configuração Raiz (CRÍTICOS)

```
apps/web/
├── package.json              # Define dependências e scripts do projeto
├── next.config.ts            # Configuração do Next.js
├── tsconfig.json             # Configuração TypeScript
├── tailwind.config.js        # Configuração de estilos
├── postcss.config.mjs        # Processamento CSS
└── components.json           # Configuração shadcn/ui
```

## 2. Estrutura de Entrada Next.js (CRÍTICOS)

```
apps/web/src/
├── app/
│   ├── layout.tsx           # Layout raiz da aplicação
│   ├── page.tsx             # Página inicial com redirecionamento
│   └── globals.css          # Estilos globais (se existir)
└── index.css                # Estilos base
```

## 3. Páginas Essenciais (CRÍTICOS)

```
apps/web/src/app/
├── login/
│   └── page.tsx             # Autenticação de usuários
├── form/
│   ├── page.tsx             # Página wrapper do formulário
│   └── multi-step-page.tsx  # Lógica principal do formulário multi-step
├── my-requests/
│   └── page.tsx             # Listagem de solicitações do usuário
└── auth/
    └── callback/
        └── route.ts         # Callback OAuth Supabase
```

## 4. API Routes (CRÍTICOS)

```
apps/web/src/app/api/
├── submit-form/
│   └── route.ts             # Submissão principal do formulário
├── projetos/
│   └── route.ts             # Busca lista de projetos
├── trip-requests/
│   └── route.ts             # CRUD de solicitações
├── form/submit/
│   └── route.ts             # Rota alternativa de submissão
└── health/
    └── route.ts             # Health check da aplicação
```

## 5. Componentes de Formulário (CRÍTICOS)

```
apps/web/src/components/form/
├── form-layout.tsx          # Layout base do formulário
├── form-navigation.tsx      # Navegação entre páginas
├── form-submission.tsx      # Lógica de submissão
├── form-progress.tsx        # Indicador de progresso
└── pages/                   # Páginas do formulário multi-step
    ├── passenger-data.tsx   # Página 1: Dados do passageiro
    ├── travel-details.tsx   # Página 2: Detalhes da viagem
    ├── expense-types.tsx    # Página 3: Tipos de despesa
    ├── preferences.tsx      # Página 4: Preferências
    ├── international-travel.tsx  # Página 5: Viagem internacional
    ├── time-restrictions.tsx     # Página 6: Restrições de tempo
    ├── flight-preferences.tsx    # Página 7: Preferências de voo
    └── trip-objective.tsx        # Página 8: Objetivo da viagem
```

## 6. Componentes Core (CRÍTICOS)

```
apps/web/src/components/
├── providers.tsx            # Providers React Query, Theme, etc.
├── header.tsx               # Cabeçalho com autenticação
├── auth/
│   └── login-form.tsx       # Formulário de login
└── ui/                      # Componentes shadcn/ui
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── textarea.tsx
    └── [outros componentes UI usados]
```

## 7. Contextos e Estado (CRÍTICOS)

```
apps/web/src/
├── contexts/
│   └── auth-context.tsx     # Contexto de autenticação
├── stores/
│   └── form-store.ts        # Estado global do formulário (Zustand)
└── hooks/
    ├── useFormNavigation.ts # Hook de navegação
    ├── useFormValidation.ts # Hook de validação
    └── useFormSubmission.ts # Hook de submissão
```

## 8. Schemas de Validação (CRÍTICOS)

```
apps/web/src/schemas/
├── form.schema.ts           # Schema principal do formulário
├── passenger-data.schema.ts # Validação dados passageiro
├── travel-details.schema.ts # Validação detalhes viagem
├── preferences.schema.ts    # Validação preferências
└── [outros schemas de validação]
```

## 9. Utilitários e Bibliotecas (CRÍTICOS)

```
apps/web/src/lib/
├── supabase/
│   ├── client.ts            # Cliente Supabase browser
│   ├── server.ts            # Cliente Supabase server
│   ├── route.ts             # Cliente para API routes
│   └── config.ts            # Configuração Supabase
├── auth/
│   ├── auth-helpers.ts      # Funções de autenticação
│   └── rate-limiter.ts      # Rate limiting
├── repositories/
│   ├── base-repository.ts   # Repository base
│   └── travel-request-repository.ts # Repository solicitações
├── file-validation.ts       # Validação de arquivos
├── submission-queue.ts      # Fila de submissão
└── utils.ts                 # Utilitários gerais
```

## 10. Banco de Dados (CRÍTICOS)

```
supabase/
├── config.toml              # Configuração Supabase local
├── migrations/              # Essencial para estrutura do BD
│   ├── 20240916000000_initial_setup.sql
│   ├── 20251015210000_initial_tables.sql
│   ├── 20251017111942_create_bancos_brasileiros_table.sql
│   ├── 20251017_220000_add_structured_bank_fields.sql
│   ├── 20250115_create_projetos_table.sql
│   ├── add_missing_travel_request_columns.sql
│   └── populate_projetos.sql
└── seed.sql                 # Dados iniciais (opcional mas útil)
```

## 11. Assets Públicos (IMPORTANTES)

```
apps/web/public/
├── images/
│   ├── logo.png             # Logo da aplicação
│   └── ceia-logo.png        # Logo CEIA
├── background.png           # Imagem de fundo
└── perfil 1.jpg            # Imagem padrão perfil
```

## 12. Variáveis de Ambiente (CRÍTICOS)

Arquivo `.env.local` (não versionado) deve conter:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `NODE_ENV`

## Arquivos que NÃO são críticos para funcionamento:

1. **Documentação** (`docs/`, `README.md`)
2. **Testes** (`tests/`, `*.test.ts`, `vitest.config.mts`)
3. **BMAD** (`bmad/` - ferramentas de desenvolvimento)
4. **Scripts auxiliares** (`scripts/`, `analyze_tokens.js`)
5. **Arquivos de exemplo** (`payload-example.json`)
6. **Screenshots** (`screenshots/`)
7. **Downloads temporários** (`downloads/`)

## Resumo de Impacto

### Perda CRÍTICA (sistema para de funcionar):
- Qualquer arquivo em `app/api/`
- `stores/form-store.ts`
- `contexts/auth-context.tsx`
- Componentes em `components/form/pages/`
- Configurações Supabase em `lib/supabase/`
- Migrações do banco de dados

### Perda ALTA (funcionalidades quebradas):
- Schemas de validação
- Hooks de formulário
- Componentes UI essenciais

### Perda MÉDIA (experiência degradada):
- Assets públicos
- Alguns componentes UI
- Utilitários auxiliares

Esta análise reflete o estado atual funcional do sistema, focando apenas no que mantém o trip-form-app operacional no momento presente.
