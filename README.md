# Monitor Hospitalar de Rede

Sistema de monitoramento de equipamentos de rede (PCs, impressoras, câmeras) para uma UPA, com dashboard visual que mostra em tempo (quase) real quais equipamentos estão online ou offline, com histórico de quedas e recuperações.

> Projeto de estudo/portfólio. Os testes com equipamentos reais foram feitos apenas na rede doméstica do autor — nenhum equipamento de produção (UPA) foi monitorado sem autorização formal.

## Como funciona (arquitetura)

```
┌──────────────────────────────────────────────────────────────┐
│                         SEU COMPUTADOR                        │
│                                                                │
│   ┌─────────────┐   ping (paralelo)   ┌──────────────────┐   │
│   │  server.js   │ ──────────────────► │  Equipamentos     │   │
│   │  (Express)   │ ◄────────────────── │  reais da rede    │   │
│   └──────┬───────┘      resposta       └──────────────────┘   │
│          │                                                     │
│          │  grava eventos de mudança de status                │
│          ▼                                                     │
│   ┌─────────────┐                                              │
│   │ historico.db │  (SQLite — não versionado no Git)           │
│   └─────────────┘                                              │
│          │                                                     │
│          │  serve /api/status e /api/historico                 │
│          ▼                                                     │
│   ┌─────────────┐                                              │
│   │  Navegador   │  busca /api/status a cada 5s                │
│   │  (dashboard) │  desenha bolinhas e exibe histórico ao clicar│
│   └─────────────┘                                              │
└──────────────────────────────────────────────────────────────┘
```

## Status do projeto

- [x] Etapa 1: Backend básico (Express rodando)
- [x] Etapa 2: Teste da lib `ping` (online e offline)
- [x] Etapa 3: Inventário de equipamentos (`devices.json`)
- [x] Etapa 4: Endpoint `/api/status` (ping em paralelo com `Promise.all`)
- [x] Etapa 5: Servir arquivos estáticos do frontend
- [x] Etapa 6: Frontend — HTML + CSS (mapa visual)
- [x] Etapa 7: Frontend — JavaScript (fetch + atualização automática)
- [x] Etapa 8: Testes com equipamentos reais da rede doméstica
- [ ] Etapa 9: Melhorias
  - [x] Debounce de falhas (evitar falso positivo em queda momentânea)
  - [x] Histórico de quedas/recuperações com banco de dados (SQLite)
  - [x] Exibição interativa do histórico no dashboard (clique no item)
  - [ ] Planta baixa real como fundo do mapa
  - [ ] WebSockets para atualização em tempo real (sem polling)
  - [ ] SNMP para detalhes avançados de impressoras

## Funcionalidades

- **Monitoramento em paralelo**: todos os equipamentos são verificados simultaneamente via `Promise.all`, não em sequência — essencial para escalar sem lentidão.
- **Debounce de falhas**: um equipamento só é marcado como offline após 2 falhas consecutivas, evitando alarmes falsos por instabilidade momentânea de rede.
- **Histórico persistente**: toda mudança real de status (online → offline ou vice-versa) é registrada em um banco SQLite local, com timestamp.
- **Dashboard interativo**: mapa visual com bolinhas coloridas (verde/vermelho) e lista lateral; clicar em um equipamento expande seu histórico recente de eventos.
- **Atualização automática**: o frontend busca o status mais recente a cada 5 segundos, sem necessidade de recarregar a página.

## Tecnologias

**Backend**
- Node.js
- Express — servidor HTTP e rotas
- [`ping`](https://www.npmjs.com/package/ping) — checagem de disponibilidade via ICMP
- [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) — banco de dados SQLite síncrono
- `cors` — liberação de acesso entre frontend e backend

**Frontend**
- HTML5 semântico
- CSS3 (Flexbox, gradientes, transições)
- JavaScript (DOM, `fetch`, `async/await`, `addEventListener`)

**Ferramentas**
- Git / GitHub (controle de versão)
- VS Code

## Endpoints da API

| Rota | Descrição |
|---|---|
| `GET /api/status` | Retorna o status atual (online/offline, tempo de resposta) de todos os equipamentos cadastrados. |
| `GET /api/historico` | Retorna todos os eventos de mudança de status registrados, mais recentes primeiro. |
| `GET /api/historico?ip=<ip>` | Retorna apenas os eventos de um equipamento específico. |
