const express = require('express');
const cors = require('cors');
const ping = require('ping');
const devices = require('./devices.json');
const app = express();

app.use(cors());
app.use(express.static('public'));

// Quantas falhas consecutivas um equipamento precisa ter
// antes de ser considerado realmente offline
const LIMITE_FALHAS = 2;

// Guarda o número de falhas consecutivas de cada equipamento, por IP.
// Esse objeto vive fora da rota, então persiste entre uma chamada e outra
// enquanto o servidor estiver rodando.
const falhasConsecutivas = {};

app.get('/api/status', async (req, res) => {
  const promises = devices.map(device => ping.promise.probe(device.ip, { timeout: 2 }));
  const resultados = await Promise.all(promises);

  const status = devices.map((device, index) => {
    const respondeuAgora = resultados[index].alive;

    if (respondeuAgora) {
      // Respondeu: zera o contador de falhas dele
      falhasConsecutivas[device.ip] = 0;
    } else {
      // Não respondeu: incrementa o contador (ou começa em 1, se for a primeira falha)
      falhasConsecutivas[device.ip] = (falhasConsecutivas[device.ip] || 0) + 1;
    }

    // Só é considerado offline "de verdade" se atingiu o limite de falhas
    const online = falhasConsecutivas[device.ip] < LIMITE_FALHAS;

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});