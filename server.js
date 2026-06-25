const express = require('express');
const cors = require('cors');
const ping = require('ping');
const devices = require('./devices.json');
const app = express();

app.use(cors());

app.get('/api/status', async (req, res) => {
  const promises = devices.map(device => ping.promise.probe(device.ip, { timeout: 2 }));
  const resultados = await Promise.all(promises);

  const status = devices.map((device, index) => ({
    nome: device.nome,
    ip: device.ip,
    tipo: device.tipo,
    online: resultados[index].alive,
    tempo: resultados[index].time
  }));

  res.json(status);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});