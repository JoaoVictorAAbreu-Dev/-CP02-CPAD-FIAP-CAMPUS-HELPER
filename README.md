# FIAP Campus Helper

Aplicativo mobile desenvolvido com Expo e React Native para centralizar fluxos internos de apoio ao campus, com foco em autenticacao local, reserva de salas e registro de itens em achados e perdidos.

## Visao Geral

O projeto foi estruturado para funcionar no Expo Go, sem dependencia de back-end externo, permitindo demonstracao rapida do fluxo completo da aplicacao. Os dados sao persistidos localmente no dispositivo com `AsyncStorage`, enquanto a senha do usuario e armazenada com `expo-secure-store`.

## Principais Funcionalidades

- Autenticacao local com cadastro, login e persistencia de sessao.
- Dashboard inicial com atalhos para os modulos principais.
- Consulta de salas e navegacao direta para o fluxo de agendamento.
- Registro de reservas locais com historico salvo no dispositivo.
- Cadastro e remocao de itens no modulo de achados e perdidos.
- Alternancia entre tema claro e escuro.

## Stack Tecnica

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router
- AsyncStorage
- Expo Secure Store

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Aplicativo Expo Go instalado no dispositivo

## Como Executar

```bash
npm install
npm start
```

Depois de iniciar o Metro Bundler:

- pressione `a` para abrir no Android;
- pressione `w` para abrir no navegador;
- ou escaneie o QR Code com o Expo Go no celular.

## Estrutura do Projeto

```text
app/                  rotas e telas com Expo Router
components/           componentes reutilizaveis de interface
constants/            tokens de tema e espacos
context/              estado global de autenticacao, tema e dados
storage/              helpers de persistencia local
styles/               estilos compartilhados
utils/                validacoes e funcoes auxiliares
assets/               icones e imagens do app
```

## Persistencia de Dados

O aplicativo utiliza armazenamento local para simplificar a execucao e demonstracao:

- `@fiap:user_session`: sessao autenticada atual
- `@fiap:users_db`: base local de usuarios cadastrados
- `@fiap:reservas`: reservas de salas
- `@fiap:itens`: itens do modulo de achados e perdidos
- `@fiap:theme`: preferencia de tema

As senhas sao armazenadas separadamente por RM com `expo-secure-store`.

## Compatibilidade com Expo Go

O projeto foi ajustado para execucao no Expo Go com as dependencias exigidas pelo `expo-router` e `react-native-reanimated` devidamente instaladas. A validacao local foi concluida com sucesso por meio de:

- `npx expo-doctor`
- `npx expo export --platform web`

## Scripts Disponiveis

```bash
npm start
npm run android
npm run ios
npm run web
```

## Observacoes

- O projeto utiliza persistencia local e nao depende de API externa.
- Os dados cadastrados permanecem no dispositivo ou emulador ate serem removidos manualmente.
- O fluxo atual e adequado para prototipacao, demonstracao academica e evolucao incremental do produto.
