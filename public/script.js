const mapa = document.getElementById('mapa');
const listaEquipamentos = document.getElementById('lista-equipamentos');
const ultimaAtualizacao = document.getElementById('ultima-atualizacao');

let ipExpandido = null;

// Guarda o controlador da requisição em andamento, pra poder cancelar
// uma busca anterior se uma nova começar antes dela terminar.
let controladorAtual = null;

async function buscarStatus() {
  // Cancela qualquer requisição anterior ainda pendente
  if (controladorAtual) {
    controladorAtual.abort();
  }
  controladorAtual = new AbortController();

  const resposta = await fetch('/api/status', { signal: controladorAtual.signal });
  if (!resposta.ok) {
    throw new Error(`Servidor respondeu com erro ${resposta.status}`);
  }
  return resposta.json();
}

async function buscarHistorico(ip) {
  // encodeURIComponent protege contra IPs ou caracteres especiais
  // que quebrariam a query string da URL
  const resposta = await fetch(`/api/historico?ip=${encodeURIComponent(ip)}`);
  if (!resposta.ok) {
    throw new Error(`Servidor respondeu com erro ${resposta.status}`);
  }
  return resposta.json();
}

async function criarPainelHistorico(ip) {
  const painel = document.createElement('div');
  painel.className = 'historico-painel';
  painel.textContent = 'Carregando histórico...';

  try {
    const eventos = await buscarHistorico(ip);
    painel.innerHTML = '';

    if (eventos.length === 0) {
      painel.textContent = 'Nenhuma queda ou recuperação registrada ainda.';
      return painel;
    }

    const listaEventos = document.createElement('ul');
    eventos.slice(0, 5).forEach(evento => {
      const linha = document.createElement('li');
      const cor = evento.status === 'online' ? '#2ecc71' : '#e74c3c';
      linha.innerHTML = `<span style="color: ${cor}">●</span> `;
      linha.append(`${evento.status === 'online' ? 'Voltou online' : 'Caiu (offline)'} em ${evento.timestamp}`);
      listaEventos.appendChild(linha);
    });
    painel.appendChild(listaEventos);
  } catch (erro) {
    painel.textContent = 'Não foi possível carregar o histórico agora.';
  }

  return painel;
}

async function alternarHistorico(item, ip) {
  const painelExistente = item.querySelector('.historico-painel');

  if (painelExistente) {
    painelExistente.remove();
    ipExpandido = null;
    return;
  }

  ipExpandido = ip;
  const painel = await criarPainelHistorico(ip);

  // Proteção extra: só anexa se o item ainda estiver na página
  // e ainda não tiver um painel (evita duplicar em casos de corrida)
  if (item.isConnected && !item.querySelector('.historico-painel')) {
    item.appendChild(painel);
  }
}

function desenharDashboard(equipamentos) {
  mapa.innerHTML = '';
  listaEquipamentos.innerHTML = '';

  equipamentos.forEach(equipamento => {
    const bolinha = document.createElement('div');
    bolinha.className = 'equipamento-ponto ' + (equipamento.online ? 'online' : 'offline');
    bolinha.title = equipamento.nome;
    mapa.appendChild(bolinha);

    const item = document.createElement('li');
    item.style.cursor = 'pointer';

    const statusBolinha = document.createElement('span');
    statusBolinha.className = 'status-bolinha';
    statusBolinha.style.backgroundColor = equipamento.online ? '#2ecc71' : '#e74c3c';

    let textoStatus;
    if (!equipamento.online) {
      textoStatus = 'Offline';
    } else if (equipamento.tempo === 'unknown') {
      textoStatus = 'Verificando...';
    } else {
      textoStatus = `Online (${equipamento.tempo}ms)`;
    }

    item.appendChild(statusBolinha);
    item.append(`${equipamento.nome} — ${equipamento.ip} — ${textoStatus}`);

    item.addEventListener('click', () => alternarHistorico(item, equipamento.ip));
    listaEquipamentos.appendChild(item);

    if (ipExpandido === equipamento.ip) {
      criarPainelHistorico(equipamento.ip).then(painel => {
        if (item.isConnected && !item.querySelector('.historico-painel')) {
          item.appendChild(painel);
        }
      });
    }
  });

  const agora = new Date();
  ultimaAtualizacao.textContent = 'Atualizado em ' + agora.toLocaleTimeString('pt-BR');
}

async function atualizarDashboard() {
  try {
    const equipamentos = await buscarStatus();
    desenharDashboard(equipamentos);
  } catch (erro) {
    if (erro.name === 'AbortError') {
      // Cancelamento intencional (nova requisição substituiu esta) — ignora
      return;
    }
    console.error('Erro ao atualizar o dashboard:', erro);
    ultimaAtualizacao.textContent = 'Erro ao buscar dados do servidor. Tentando novamente...';
  }
}

atualizarDashboard();
setInterval(atualizarDashboard, 5000);