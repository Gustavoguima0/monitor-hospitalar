const express = require('express');
const cors = require('cors');
const ping = require('ping');
const devices = require('./devices.json');
const { registrarEvento, buscarHistorico } = require('./db');
const app = express();

app.use(cors());
app.use(express.static('public'));

const LIMITE_FALHAS = 2;
const falhasConsecutivas = {};

// Guarda o último status conhecido de cada equipamento (true/false),
// pra sabermos se houve MUDANÇA de status entre uma checagem e outra
const ultimoStatusConhecido = {};

app.get('/api/status', async (req, res) => {
  const promises = devices.map(device => ping.promise.probe(device.ip, { timeout: 2 }));
  const resultados = await Promise.all(promises);

  const status = devices.map((device, index) => {
    const respondeuAgora = resultados[index].alive;

    if (respondeuAgora) {
      falhasConsecutivas[device.ip] = 0;
    } else {
      falhasConsecutivas[device.ip] = (falhasConsecutivas[device.ip] || 0) + 1;
    }

    const online = falhasConsecutivas[device.ip] < LIMITE_FALHAS;

    // Detecta se houve mudança de status desde a última checagem
    const statusAnterior = ultimoStatusConhecido[device.ip];
    if (statusAnterior !== undefined && statusAnterior !== online) {
      registrarEvento(device.nome, device.ip, online ? 'online' : 'offline');
    }
    ultimoStatusConhecido[device.ip] = online;

    return {
      nome: device.nome,
      ip: device.ip,
      tipo: device.tipo,
      online: online,
      tempo: resultados[index].time,
      falhasConsecutivas: falhasConsecutivas[device.ip]
    };
  });

  res.json(status);
});

// Novo endpoint: consulta o histórico registrado.
// Uso: /api/historico            -> tudo
//      /api/historico?ip=8.8.8.8 -> só de um equipamento
app.get('/api/historico', (req, res) => {
  const ip = req.query.ip || null;
  const historico = buscarHistorico(ip);
  res.json(historico);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});