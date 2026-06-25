# Monitor Hospitalar de Rede

Sistema de monitoramento de equipamentos de rede (PCs, impressoras, câmeras) para uma UPA, com dashboard visual que mostra em tempo (quase) real quais equipamentos estão online ou offline.

## Como funciona (visão geral)

```
┌─────────────────────────────────────────────────────────┐
│                     SEU COMPUTADOR                       │
│                                                            │
│   ┌──────────────┐         ┌──────────────────────┐      │
│   │  servidor.js  │  ping   │  Equipamentos reais   │      │
│   │               │ ──────► │  (PCs, impressoras,  │      │
│   │               │ ◄────── │   câmeras na rede)    │      │
│   └──────┬───────┘ resposta └──────────────────────┘      │
│          │                                                │
│          │  serve o endpoint /api/status                  │
│          ▼                                                │
│   ┌──────────────┐                                        │
│   │               │  busca /api/status a cada 5s          │
│   │  dashboard    │  e desenha bolinhas verde/vermelha     │
│   └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

## Status do projeto

- [x] Etapa 1: Backend básico (Express rodando)
- [x] Etapa 2: Teste da lib `ping` (online e offline)
- [x] Etapa 3: Inventário de equipamentos (`devices.json`)
- [x] Etapa 4: Endpoint `/api/status` (ping em paralelo com `Promise.all`)
- [x] Etapa 5: Servir arquivos estáticos do frontend
- [x] Etapa 6: Frontend — HTML + CSS (mapa visual)
- [x] Etapa 7: Frontend — JavaScript (fetch + atualização automática)
- [x] Etapa 8: Testes com equipamentos reais da rede
- [ ] Etapa 9: Melhorias (WebSockets, histórico, SNMP, planta baixa)
 

## Tecnologias

- Node.js
- Express
- lib `ping`
- HTML/CSS/JS 
