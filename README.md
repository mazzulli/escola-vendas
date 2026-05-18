# EscolaVendas Pro 🎓💼

Sistema de gestão financeira e de estoque otimizado para o comércio escolar. O projeto conta com uma interface **High Density**, focada em produtividade, densidade de informações e uma estética profissional.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Segurança](#segurança)
- [Design e Interface](#design-e-interface)
- [Modelo de Dados](#modelo-de-dados)
- [Como Começar](#como-começar)

---

## 🎯 Visão Geral

O **EscolaVendas Pro** é uma aplicação full-stack desenvolvida com as mais modernas tecnologias web, projetada para gerenciar de forma eficiente:

- 📊 Controle financeiro em tempo real
- 📦 Gestão integrada de estoque
- 💰 Sistema de vendas e reservas
- 👥 Gerenciamento de usuários com segurança
- 📱 Interface responsiva e de alta densidade

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia       | Versão   | Descrição                                 |
| ---------------- | -------- | ----------------------------------------- |
| **React**        | 19.0.1   | Library para construção de interfaces web |
| **React Router** | 7.15.1   | Roteamento client-side                    |
| **TypeScript**   | ~5.8.2   | Tipagem estática para JavaScript          |
| **Vite**         | 6.2.3    | Build tool rápido e moderno               |
| **Tailwind CSS** | 4.1.14   | Framework CSS utilities-first             |
| **Shadcn/UI**    | 4.7.0    | Componentes de UI customizáveis           |
| **Lucide React** | 0.546.0  | Ícones SVG de alta qualidade              |
| **Recharts**     | 3.8.1    | Biblioteca de gráficos para React         |
| **Sonner**       | 2.0.7    | Sistema de toast notifications            |
| **Date-fns**     | 4.1.0    | Manipulação de datas                      |
| **Motion**       | 12.23.24 | Animações web                             |

### Backend

| Tecnologia       | Versão | Descrição                     |
| ---------------- | ------ | ----------------------------- |
| **Express.js**   | 4.21.2 | Framework web para Node.js    |
| **TypeScript**   | ~5.8.2 | Tipagem estática              |
| **Prisma**       | 6.2.1  | ORM para Node.js e TypeScript |
| **JWT**          | 9.0.3  | Autenticação com tokens       |
| **Nodemailer**   | 8.0.7  | Envio de e-mails              |
| **Google GenAI** | 1.29.0 | Integração com IA do Google   |

### Banco de Dados

| Tecnologia        | Descrição                         |
| ----------------- | --------------------------------- |
| **PostgreSQL**    | Banco de dados relacional robusto |
| **Prisma Client** | Client para interação com o banco |

### Ferramentas de Build

| Ferramenta  | Descrição                        |
| ----------- | -------------------------------- |
| **ESBuild** | Bundler rápido para produção     |
| **TSX**     | Executor de TypeScript           |
| **pnpm**    | Gerenciador de pacotes eficiente |

---

## 📁 Estrutura do Projeto

```
escola-vendas/
├── 📄 components.json              # Configuração de componentes
├── 📄 index.html                   # Página HTML principal
├── 📄 metadata.json                # Metadados do projeto
├── 📄 package.json                 # Dependências do projeto
├── 📄 pnpm-lock.yaml               # Lock file de dependências
├── 📄 pnpm-workspace.yaml          # Configuração de monorepo
├── 📄 prisma.config.ts             # Configuração do Prisma
├── 📄 tsconfig.json                # Configuração TypeScript
├── 📄 vite.config.ts               # Configuração do Vite
├── 📄 server.ts                    # Servidor Express
├── 📄 README.md                    # Este arquivo
│
├── 📂 components/                  # Componentes reutilizáveis (shadcn/ui base)
│   └── 📂 ui/                      # Componentes primitivos de UI
│       ├── badge.tsx               # Badge para labels
│       ├── button.tsx              # Botão reusável
│       ├── calendar.tsx            # Seletor de data
│       ├── card.tsx                # Container card
│       ├── dialog.tsx              # Modal/Dialog
│       ├── input.tsx               # Campo de entrada
│       ├── label.tsx               # Label de formulário
│       ├── popover.tsx             # Popover/Dropdown
│       ├── scroll-area.tsx         # Área com scroll
│       ├── select.tsx              # Dropdown seletor
│       ├── separator.tsx           # Divisor visual
│       ├── sonner.tsx              # Configuração de toasts
│       ├── switch.tsx              # Toggle switch
│       ├── table.tsx               # Tabela de dados
│       └── tabs.tsx                # Sistema de abas
│
├── 📂 prisma/                      # Configuração do banco de dados
│   └── schema.prisma               # Schema do Prisma (modelos do BD)
│
└── 📂 src/                         # Código fonte da aplicação
    ├── 📄 App.tsx                  # Componente principal da app
    ├── 📄 index.css                # Estilos globais
    ├── 📄 main.tsx                 # Ponto de entrada React
    │
    ├── 📂 components/              # Componentes específicos da aplicação
    │   ├── AuthProvider.tsx        # Provider de autenticação
    │   ├── DeleteConfirmation.tsx  # Modal de confirmação de exclusão
    │   ├── Layout.tsx              # Layout principal (sidebar + conteúdo)
    │   └── 📂 ui/                  # Componentes de UI customizados
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       └── tabs.tsx
    │
    ├── 📂 lib/                    # Funções utilitárias
    │   └── utils.ts               # Helper functions e classe cn (Tailwind merge)
    │
    └── 📂 pages/                  # Páginas da aplicação (rotas principais)
        ├── Dashboard.tsx          # Dashboard - Visão geral e métricas
        ├── Login.tsx              # Página de login com OTP
        ├── Products.tsx           # Gestão de produtos
        ├── Reservations.tsx       # Gestão de reservas/encomendas
        ├── Sales.tsx              # Sistema de vendas
        └── Users.tsx              # Gestão de usuários
```

### Descrição Detalhada dos Diretórios

#### `components/`

Componentes base reutilizáveis importados do shadcn/ui. Estes são componentes primitivos que servem como blocos construtivos para a interface.

#### `src/components/`

Componentes específicos da aplicação que combinam os componentes primitivos para criar funcionalidades de negócio.

#### `src/pages/`

Componentes de página que mapeiam para rotas principais:

- **Dashboard**: Visão centralizada com métricas, gráficos e KPIs
- **Login**: Autenticação com One-Time Password (OTP)
- **Products**: CRUD completo de produtos com gerenciamento de estoque
- **Sales**: Registro e histórico de transações de venda
- **Reservations**: Gerenciamento de reservas e encomendas
- **Users**: Administração de usuários do sistema

#### `prisma/`

Define o schema do banco de dados PostgreSQL com todos os modelos de dados.

---

## ✨ Funcionalidades

### 1️⃣ Controle Financeiro e Dashboards

- 📊 **Visão Geral em Tempo Real**: Dashboard com vendas do dia, mês e comparativos
- 🎯 **Monitoramento de Metas**: Acompanhamento de metas de faturamento
- 📈 **Status do Sistema**: Indicadores de saúde do sistema
- 🚨 **Alertas de Estoque**: Relatório automático de itens com estoque baixo para reposição imediata

### 2️⃣ Gestão de Produtos

- ✅ **Cadastro Completo**: Nome, descrição, preço unitário, estoque atual e mínimo
- 🔍 **Filtragem Rápida**: Busca em tempo real e filtros customizáveis
- ✏️ **Ações Inline**: Edição e exclusão de produtos em tabelas compactas
- 📊 **Visualização de Estoque**: Indicadores visuais de níveis de estoque

### 3️⃣ Sistema de Vendas Diretas

- 💳 **Múltiplos Métodos de Pagamento**: Dinheiro, Débito, Crédito, PIX
- 📉 **Abatimento Automático de Estoque**: Redução automática ao confirmar venda
- 🧮 **Cálculos Automáticos**: Subtotais, totais e descontos
- 📋 **Histórico Detalhado**: Rastreamento completo de todas as transações

### 4️⃣ Encomendas e Reservas

- 📝 **Registro de Reservas**: Nome, documento (RG/CPF), telefone e quantidade
- 🔄 **Fluxo de Entrega**: Conversão automática de reserva em venda
- 📊 **Status de Acompanhamento**: Controle de pendência, conclusão e cancelamento
- 🔗 **Rastreabilidade**: Histórico completo de transações

### 5️⃣ Segurança e Acesso Controlado

- 🔐 **Autenticação OTP**: Código de acesso via e-mail
- ⏱️ **Validade Rigorosa**: Códigos expiram após 5 minutos
- 🛡️ **Proteção JWT**: Tokens no backend para validação de requisições
- 👤 **Controle de Permissões**: Níveis de acesso por usuário (Admin/Usuário)

---

## 🎨 Design e Interface

### Paleta de Cores

- **Cores Primárias**: Slate (cinza neutro) e Indigo (azul profundo)
- **Cores Secundárias**: Suporta tema claro e escuro via `next-themes`
- **Acessibilidade**: Contraste aprimorado para leitura confortável

### Tipografia

- **Font Principal**: [Inter](https://fonts.google.com/specimen/Inter) - Interface clara e legível
- **Font Monoespacial**: JetBrains Mono - Números e dados
- **Fontes**: Integradas via `@fontsource-variable`

### Características de Design (High Density)

- 📐 **Sidebar Estruturada**: Navegação clara com resumos de segurança
- 📊 **Tabelas Compactas**: Otimizadas para visualizar grandes volumes de dados
- 🎯 **Cards com Bordas Nítidas**: Definição clara de seções
- 📏 **Espaçamento Otimizado**: Balanceamento entre densidade e legibilidade
- ⚡ **Animações Suaves**: Via biblioteca `Motion` para transições naturais
- 🔔 **Sistema de Notificações**: Toasts via `Sonner` para feedback do usuário

---

## 🗄️ Modelo de Dados

### User

```typescript
- id: String (ID único)
- email: String (único)
- name: String (opcional)
- isAdmin: Boolean (controle de permissões)
- createdAt: DateTime
- updatedAt: DateTime
- sales: Sale[] (relacionamento)
```

### OTP

```typescript
- id: String (ID único)
- email: String
- code: String (código de acesso)
- expiresAt: DateTime (validade de 5 minutos)
- createdAt: DateTime
```

### Product

```typescript
- id: String (ID único)
- name: String
- description: String (opcional)
- price: Float (preço unitário)
- stock: Int (quantidade em estoque)
- minStock: Int (nível mínimo para alerta)
- createdAt: DateTime
- updatedAt: DateTime
- sales: Sale[] (relacionamento)
- reservations: Reservation[] (relacionamento)
```

### Sale

```typescript
- id: String (ID único)
- productId: String (FK)
- product: Product (relacionamento)
- quantity: Int
- total: Float
- userId: String (FK)
- user: User (relacionamento)
- paymentMethod: String (MONEY, DEBIT, CREDIT, PIX)
- date: DateTime
```

### Reservation

```typescript
- id: String (ID único)
- productId: String (FK)
- product: Product (relacionamento)
- quantity: Int
- customerName: String
- customerDoc: String (RG/CPF)
- customerPhone: String
- date: DateTime
- status: String (PENDING, COMPLETED, CANCELED)
```

---

## 🚀 Como Começar

### Pré-requisitos

- **Node.js** 18+ e **pnpm** instalados
- **PostgreSQL** em execução
- **Arquivo .env** configurado com as variáveis de ambiente

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm prisma migrate dev

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/escola_vendas"
GEMINI_API_KEY="sua_chave_api_aqui"
JWT_SECRET="seu_secret_jwt"
EMAIL_USER="seu_email@exemplo.com"
EMAIL_PASSWORD="sua_senha_email"
```

### Scripts Disponíveis

| Script         | Descrição                                         |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Inicia servidor de desenvolvimento com hot-reload |
| `pnpm build`   | Compila a aplicação para produção                 |
| `pnpm preview` | Prévia da build de produção                       |
| `pnpm start`   | Inicia o servidor de produção                     |
| `pnpm lint`    | Verifica erros TypeScript                         |
| `pnpm clean`   | Remove arquivos de build                          |

---

## 📝 Notas

- Este projeto utiliza **monorepo** com pnpm workspaces
- O servidor Express é executado em TypeScript via `tsx`
- A build para produção gera um arquivo `server.cjs` otimizado
- Suporta integração com Google GenAI para funcionalidades futuras
- Exportação de dados em Excel via biblioteca `xlsx`

# Configuração para rodar na Vercel

- Foi feito ajuste para mover o arquivo que gerencia o uso da API para a pasta ./api
- Foi criado o arquivo index.ts com o código correspondente aos requisitos da Vercel
- Para rodar a aplicação local para os testes usar o comando "vercel dev"
- O arquivo server.ts continua com a configuração para uso em servidores com Node.js
- Para rodar em um servidor VPS ou outro fora da Vercel, deve ser feito ajustes para apontar para o server.ts, e alterar o package.json para apontar para o server.ts e não para o index.ts

---

**Desenvolvido com ❤️ pela SSIT Consulting**
