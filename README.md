<div align="center">

<img src="./assets/fiap-logo.png" alt="FIAP Logo" width="120"/>

# Campus Helper

[![React Native](https://img.shields.io/badge/React%20Native-0.74-green.svg?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-v3-blue.svg?style=for-the-badge&logo=expo&logoColor=white)](https://expo.github.io/router/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-yellow.svg?style=for-the-badge&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Context API](https://img.shields.io/badge/Context%20API-State%20Management-blueviolet.svg?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/reference/react/createContext)
[![AsyncStorage](https://img.shields.io/badge/AsyncStorage-Persistence-orange.svg?style=for-the-badge&logo=react-native&logoColor=white)](https://react-native-async-storage.github.io/async-storage/)
[![FIAP](https://img.shields.io/badge/FIAP-CPAD%20Checkpoint%202-purple.svg?style=for-the-badge&logo=university&logoColor=white)](https://www.fiap.com.br/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg?style=for-the-badge)](https://github.com/user/fiap-campus-helper)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=mit)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-gray.svg?style=for-the-badge&logo=apple&logoColor=white)](https://reactnative.dev/docs/platform-specific-code)

**Sistema cross-platform de gerenciamento acadêmico para o ecossistema FIAP, com autenticação segura, persistência local e navegação inteligente.**

</div>

---

#  Sumário

| Seção | Descrição |
|-------|-----------|
| [Sobre o Projeto](#-sobre-o-projeto) | Contexto, problema e solução |
| [Funcionalidades](#-funcionalidades) | Checklist completo das features |
| [Diferencial Técnico](#-diferencial-implementado) | Recuperação automática de sessão |
| [Stack Tecnológica](#-stack-tecnológica) | Tecnologias e justificativas |
| [Arquitetura](#️-arquitetura-do-projeto) | Organização e responsabilidades |
| [Fluxo de Autenticação](#-fluxo-de-autenticação) | Estrutura do fluxo |
| [Context API](#️-context-api) | Gerenciamento global de estado |
| [AsyncStorage](#-asyncstorage) | Persistência de dados |
| [Validações](#-validações) | Regras dos formulários |
| [UX/UI](#-uxui) | Design system |
| [Demonstração](#-demonstração-visual) | Prints e vídeo |
| [Como Executar](#-como-executar-o-projeto) | Guia de instalação |
| [Commits](#-estrutura-de-commits) | Convenção utilizada |
| [Integrantes](#-integrantes) | Equipe |
| [Roadmap](#️-roadmap-futuro) | Evoluções futuras |

---

# Sobre o Projeto

##  Contexto Operacional

O **Campus Helper** foi desenvolvido para a disciplina **Cross-Platform Application Development (CPAD)** da FIAP como evolução direta do projeto desenvolvido no Checkpoint 1.

O aplicativo foi pensado para resolver problemas recorrentes do ecossistema acadêmico FIAP, centralizando funcionalidades importantes em uma única plataforma moderna, intuitiva e escalável.

### Principais dores identificadas

- Gerenciamento fragmentado de salas e reservas
- Comunicação descentralizada
- Falta de persistência offline
- Navegação pouco intuitiva
- Perda constante de sessão
- Experiência mobile limitada

---

##  Problema Resolvido

Atualmente, muitos processos acadêmicos exigem múltiplas etapas manuais.

### Fluxo tradicional

```text
Aluno → WhatsApp → Portal → Planilha → Confirmação Manual
````

### Fluxo com o Campus Helper

```text
Aluno → Aplicativo → Dados Centralizados → Ação Imediata ✅
```

---

##  Objetivo do Produto

Criar uma plataforma unificada para gerenciamento acadêmico com:

* Autenticação segura
* Persistência local
* Navegação protegida
* Escalabilidade arquitetural
* UX moderna
* Responsividade cross-platform

---

#  Evolução CP1 → CP2

| Aspecto      | CP1           | CP2           |
| ------------ | ------------- | ------------- |
| Estado       | useState      | Context API   |
| Persistência | Não havia     | AsyncStorage  |
| Navegação    | Básica        | Protegida     |
| UX/UI        | MVP funcional | Design system |
| Estrutura    | Monolítica    | Modular       |
| Sessão       | Temporária    | Persistente   |

---

#  Funcionalidades

* [x] Cadastro de usuários
* [x] Login persistente
* [x] Logout seguro
* [x] Recuperação automática de sessão
* [x] Context API
* [x] AsyncStorage
* [x] Rotas protegidas
* [x] Formulários validados
* [x] Feedback visual
* [x] Loading states
* [x] Toast notifications
* [x] Skeleton loading
* [x] Tema dinâmico
* [x] Responsividade mobile

---

#  Diferencial Implementado

##  Recuperação Automática de Sessão

O principal diferencial implementado foi um sistema híbrido de autenticação utilizando:

* `Context API`
* `AsyncStorage`

O objetivo foi manter a sessão do usuário persistida mesmo após fechar o aplicativo.

---

##  Benefícios Técnicos

| Benefício              | Resultado |
| ---------------------- | --------- |
| Persistência de sessão | 100%      |
| Suporte offline        | Completo  |
| Tempo de carregamento  | Reduzido  |
| UX                     | Melhorada |

---

##  Implementação

```javascript
const STORAGE_KEYS = {
  SESSION: '@campus_helper:session',
  USER_DATA: '@campus_helper:user',
  APP_DATA: '@campus_helper:appData'
};
```

```javascript
const recoverSession = async () => {
  try {
    const session = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);

    if (session) {
      setAuthenticated(true);
    }
  } catch (error) {
    console.log(error);
  }
};
```

---

#  Stack Tecnológica

| Tecnologia        | Finalidade             |
| ----------------- | ---------------------- |
| React Native      | Desenvolvimento mobile |
| Expo              | Build e execução       |
| Expo Router       | Navegação              |
| JavaScript        | Linguagem principal    |
| Context API       | Estado global          |
| AsyncStorage      | Persistência local     |
| Expo Vector Icons | Ícones                 |
| SafeAreaContext   | Responsividade         |

---

#  Arquitetura do Projeto

##  Estrutura de Pastas

```text
fiap-campus-helper/
├── app/
│   ├── _layout.js
│   ├── login.js
│   ├── register.js
│   ├── salas.js
│   ├── achados.js
│   └── agendamento.js
│
├── components/
│   ├── CustomInput.js
│   ├── CustomButton.js
│   ├── SkeletonCard.js
│   └── Header.js
│
├── context/
│   ├── AuthContext.js
│   ├── AppDataContext.js
│   └── ThemeContext.js
│
├── storage/
│   └── asyncStorageHelper.js
│
├── styles/
│   └── themes.js
│
└── utils/
    └── validators.js
```

---

#  Fluxo de Autenticação

```text
App inicia
↓
AuthContext verifica sessão
↓
AsyncStorage retorna dados
↓
Sessão válida?
↓
SIM → Home
NÃO → Login
```

---

## Proteção de Rotas

```javascript
<Stack>
  <Stack.Screen name="login" />
  <Stack.Screen name="salas" />
</Stack>
```

---

#  Context API

## Contextos Implementados

| Context        | Responsabilidade     |
| -------------- | -------------------- |
| AuthContext    | Login e sessão       |
| AppDataContext | Dados compartilhados |
| ThemeContext   | Tema dinâmico        |

---

#  AsyncStorage

## Estrutura Utilizada

```javascript
const KEYS = {
  SESSION: '@campus:session:v1',
  USER: '@campus:user:v1',
  APP_DATA: '@campus:appData:v1'
};
```

---

#  Validações

| Campo | Regra                  |
| ----- | ---------------------- |
| Email | Regex + domínio válido |
| Senha | 8+ caracteres          |
| RM    | 5 dígitos              |
| Nome  | Nome completo          |

---

## UX de Formulários

* Validação inline
* Feedback visual
* Botões desabilitados
* Loading states
* Mensagens contextuais

---

#  UX/UI

##  Design System

| Elemento   | Cor       |
| ---------- | --------- |
| Primária   | `#1E3A8A` |
| Secundária | `#0F172A` |
| Sucesso    | `#10B981` |
| Erro       | `#EF4444` |

---

##  Estratégias de UX

* Skeleton loading
* Toast notifications
* Empty states
* Microinterações
* Responsividade
* SafeAreaContext

---

#  Demonstração Visual

##  Screenshots

### Tela de Login

```md
![Login](./assets/readme/login.png)
```

### Tela de Cadastro

```md
![Cadastro](./assets/readme/register.png)
```

### Tela Principal

```md
![Home](./assets/readme/home.png)
```

### Salas

```md
![Room](.assets/reardme/room.png)
```

### Achados

```md
![Found](.assets/readme/found.png)
```
### Agendamentos

```md
![Appointments](.assets/readme/appointments.png)
```
---

##  Demonstração em Vídeo

```md
[Assista à demonstração](https://youtube.com/)
```

---

#  Como Executar o Projeto

##  Pré-requisitos

```bash
Node.js 18+
Expo CLI 6+
Expo Go
```

---

##  Instalação

```bash
# Clonar repositório
git clone https://github.com/user/fiap-campus-helper.git

# Entrar na pasta
cd fiap-campus-helper

# Instalar dependências
npm install

# Executar projeto
npx expo start
```

---

#  Estrutura de Commits

## Convenção Utilizada

```bash
feat: adicionar recuperação automática de sessão
fix: corrigir validação de formulário
refactor: reorganizar context providers
style: ajustar espaçamentos
docs: atualizar README
chore: atualizar dependências
```

---

#  Integrante

| Nome         | RM    | GitHub                 | LinkedIn                    |
| ------------ | ----- | ---------------------- | --------------------------- |
| João Victor Alves de Abreu   | 564946 | github.com/JoaoVictorAAbreu-Dev  | linkedin.com/in/joãovictoraabreu   |


---

#  Roadmap Futuro

## Q3 2026

* [ ] Backend Node.js
* [ ] PostgreSQL
* [ ] API REST
* [ ] Push Notifications

---

## Q4 2026

* [ ] Analytics
* [ ] Testes E2E
* [ ] GitHub Actions
* [ ] CI/CD

---

## 2027

* [ ] Integração com IA
* [ ] Deploy App Store
* [ ] Observabilidade com Sentry

---

#  Licença

Este projeto está sob a licença MIT.

---

#  Considerações Finais

O Campus Helper representa a evolução de um MVP acadêmico para uma arquitetura moderna de aplicação mobile utilizando boas práticas de desenvolvimento cross-platform.

O projeto consolidou conhecimentos em:

* React Native
* Expo
* Context API
* AsyncStorage
* Navegação protegida
* UX/UI
* Persistência de dados
* Componentização
* Arquitetura mobile

```
```
