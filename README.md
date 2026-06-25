Monitor Hospitalar de Rede

Sistema de monitoramento de equipamentos de rede (PCs, impressoras, câmeras) para uma UPA, com dashboard visual que mostra em tempo (quase) real quais equipamentos estão online ou offline.

Como funciona (visão geral)

┌─────────────────────────────────────────────────────────┐
│                     SEU COMPUTADOR                       │
│                                                            │
│   ┌──────────────┐         ┌──────────────────────┐      │
│   │  servidor.js  │  ping   │  Equipamentos reais   │      │
│   │  (backend)    │ ──────► │  (PCs, impressoras,  │      │
│   │               │ ◄────── │   câmeras na rede)    │      │
│   └──────┬───────┘ resposta └──────────────────────┘      │
│          │                                                │
│          │  serve o endpoint /api/status                  │
│          ▼                                                │
│   ┌──────────────┐                                        │
│   │   Navegador   │  busca /api/status a cada 5s          │
│   │  (dashboard)  │  e desenha bolinhas verde/vermelha     │
│   └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘

Status do projeto


 Etapa 1: Backend básico (Express rodando)
 Etapa 2: Teste da lib ping (online e offline)
 Etapa 3: Inventário de equipamentos (devices.json)
 Etapa 4: Endpoint /api/status (ping em paralelo com Promise.all)
 Etapa 5: Servir arquivos estáticos do frontend
 Etapa 6: Frontend — HTML + CSS (mapa visual)
 Etapa 7: Frontend — JavaScript (fetch + atualização automática)
 Etapa 8: Testes com equipamentos reais da rede
 Etapa 9: Melhorias (WebSockets, histórico, SNMP, planta baixa)


Decisões técnicas

Por que a lib ping e não implementar ICMP do zero?

A lib não reimplementa o protocolo de ping em JavaScript — ela chama o comando ping nativo do sistema operacional e interpreta a resposta de texto, devolvendo um objeto estruturado (alive, time, host, etc.). Isso evita lidar com sockets ICMP brutos, que exigiriam permissões de administrador em vários sistemas.

Por que usar async/await?

Toda chamada de rede é assíncrona — o resultado não volta na hora. async/await é a forma moderna do JavaScript de lidar com isso, mais legível que a alternativa antiga com .then()/.catch() encadeados. Isso também prepara o terreno para a Etapa 4, onde vamos pingar vários equipamentos em paralelo com Promise.all().

Por que definir timeout no probe()?

Sem um timeout curto, um equipamento offline pode demorar muito tempo até a lib desistir da tentativa. Em um dashboard com vários equipamentos, isso travaria a atualização da tela por bastante tempo.

Tecnologias


Node.js
Express
lib ping
(em breve) HTML/CSS/JS no frontend
