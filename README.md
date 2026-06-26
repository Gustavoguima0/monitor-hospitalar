# Monitor Hospitalar de Rede

Sistema de monitoramento de equipamentos de rede para uma UPA. Realiza pings contínuos em todos os equipamentos — como um eco: o sistema grita e espera a resposta voltar. Se não voltar, marca o equipamento como offline e registra o momento da queda, permitindo agir antes que os chamados comecem a abrir.

## O problema que resolve

Em ambientes hospitalares com dezenas de equipamentos, identificar qual está com problema exige tempo. Esse sistema permite visualizar em tempo real o status de toda a rede e chegar na fonte do problema antes que os usuários percebam.

## Como funciona


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

- O servidor pinga todos os equipamentos **ao mesmo tempo** (paralelo). Em um ambiente com 30 equipamentos, verificar um por um levaria 30 segundos — em paralelo leva menos de 2s.
- Um equipamento só é marcado offline após **2 falhas consecutivas**, evitando alarme falso por instabilidade momentânea de rede. O primeiro verifica, o segundo confirma.
- Toda mudança real de status é gravada em banco de dados — não na memória do servidor, que seria perdida ao reiniciar.
- O frontend exibe quanto tempo cada equipamento está offline e o histórico completo de quedas e recuperações.

## O que aprendi construindo esse projeto

- **Promise.allSettled vs Promise.all** — o `allSettled` nunca rejeita: se um IP falhar, os outros continuam. O `all` derrubaria tudo.
- **AbortController** — evita race condition no frontend: se uma requisição nova começa antes da anterior terminar, a anterior é cancelada.
- **Prepared statements** — protegem contra SQL injection substituindo valores com `?` em vez de concatenar strings.
- **Debounce de falhas** — confirmação dupla antes de marcar offline, evitando falso alarme.
- **Processamento paralelo** — `Promise.allSettled` com `map` pinga todos os equipamentos simultaneamente.

## Tecnologias

**Backend:** Node.js, Express, `ping`, `better-sqlite3`  
**Frontend:** HTML5, CSS3, JavaScript (fetch, async/await, DOM, AbortController)  
**Banco:** SQLite  
**Versionamento:** Git / GitHub

## Endpoints

| Rota | Descrição |
|---|---|
| `GET /api/status` | Status atual de todos os equipamentos |
| `GET /api/historico` | Histórico completo de quedas e recuperações |
| `GET /api/historico?ip=<ip>` | Histórico de um equipamento específico |
## Como rodar
```bash
npm install
node server.js



Acesse http://localhost:3000

Projeto de estudo e portfólio. Os IPs no devices.json são fictícios — substitua pelos IPs reais da sua rede antes de usar em produção.