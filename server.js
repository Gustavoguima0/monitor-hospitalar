const express = require('express');
const cors = require('cors');
const ping = require('ping');
const devices = require('./devices.json');
const { registrarEvento, buscarHistorico, fecharBanco } = require('./db');

const app = express();
app.use(cors());
app.use(express.static('public'));

const LIMITE_FALHAS = 2;
const INTERVALO_VERIFICACAO_MS = 5000;

// --- Validação na inicialização ---
// Falha rápido e com mensagem clara, em vez de quebrar silenciosamente
// no meio de uma requisição mais tarde.
devices.forEach((device, index) => {
  if (!device.ip || !device.nome) {
    console.error(
      `Erro em devices.json: o item no índice ${index} está sem "nome" ou "ip". Corrija o arquivo antes de iniciar o servidor.`
    );
    process.exit(1);
  }
});

const falhasConsecutivas = {};
const ultimoStatusConhecido = {};
const momentoDaQueda = {};

// Cache do status mais recente — o endpoint /api/status só lê isso,
// nunca dispara um ping novo. Só o loop abaixo escreve aqui.
let statusCache = [];

async function verificarTodos() {
  // Promise.allSettled NUNCA rejeita: cada resultado vem com status
  // 'fulfilled' ou 'rejected', então um IP problemático não derruba os outros.
  const resultados = await Promise.allSettled(
    devices.map(device => ping.promise.probe(device.ip, { timeout: 2 }))
  );

  statusCache = devices.map((device, index) => {
    const resultado = resultados[index];
    const respondeuAgora = resultado.status === 'fulfilled' && resultado.value.alive;
    const tempo = resultado.status === 'fulfilled' ? resultado.value.time : 'unknown';

    if (respondeuAgora) {
      falhasConsecutivas[device.ip] = 0;
    } else {
      falhasConsecutivas[device.ip] = (falhasConsecutivas[device.ip] || 0) + 1;
    }

    const online = falhasConsecutivas[device.ip] < LIMITE_FALHAS;

    const statusAnterior = ultimoStatusConhecido[device.ip];
    if (statusAnterior !== undefined && statusAnterior !== online) {
      registrarEvento(device.nome, device.ip, online ? 'online' : 'offline');
      if (!online) {
        momentoDaQueda[device.ip] = new Date();
      } else {
        delete momentoDaQueda[device.ip];
      }
    }
    ultimoStatusConhecido[device.ip] = online;


    return {
      nome: device.nome,
      ip: device.ip,
      tipo: device.tipo,
      online,
      tempo,
      falhasConsecutivas: falhasConsecutivas[device.ip],
      quedaEm: momentoDaQueda[device.ip] || null
    };
  });
}

app.get('/api/status', (req, res) => {
  // Só lê o cache — não dispara ping nenhum aqui.
  res.json(statusCache);
});

app.get('/api/historico', (req, res) => {
  const ip = req.query.ip ? String(req.query.ip) : null;
  const historico = buscarHistorico(ip);
  res.json(historico);
});

// Roda uma verificação completa ANTES de começar a aceitar requisições,
// pra já existir dados no cache desde a primeira chamada do frontend.
verificarTodos().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });

  setInterval(verificarTodos, INTERVALO_VERIFICACAO_MS);
});


// Garante que o banco SQLite seja fechado corretamente antes do processo
// morrer, evitando corrupção em caso de Ctrl+C ou parada por systemd/Docker.
function encerrarServidor() {
  console.log('\nEncerrando servidor...');
  fecharBanco();
  process.exit(0);
}
process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);