// Pega referências aos elementos do HTML que vamos preencher
const mapa = document.getElementById('mapa');
const listaEquipamentos = document.getElementById('lista-equipamentos');
const ultimaAtualizacao = document.getElementById('ultima-atualizacao');

// Guarda qual equipamento (por IP) está com o histórico expandido no momento.
// Fica fora da função de desenho para sobreviver aos redesenhos a cada 5s.
let ipExpandido = null;

// Busca os dados de status do backend
async function buscarStatus() {
  const resposta = await fetch('/api/status');
  const dados = await resposta.json();
  return dados;
}

// Busca o histórico de um equipamento específico
async function buscarHistorico(ip) {
  const resposta = await fetch(`/api/historico?ip=${ip}`);
  const dados = await resposta.json();
  return dados;
}

// Cria o bloco visual do histórico (lista de eventos) dentro do item
async function criarPainelHistorico(ip) {
  const painel = document.createElement('div');
  painel.className = 'historico-painel';
  painel.textContent = 'Carregando histórico...';

  const eventos = await buscarHistorico(ip);

  painel.innerHTML = ''; // limpa o "Carregando..."

  if (eventos.length === 0) {
    painel.textContent = 'Nenhuma queda ou recuperação registrada ainda.';
    return painel;
  }

  const listaEventos = document.createElement('ul');
  // Mostra só os 5 eventos mais recentes, pra não poluir a tela
  eventos.slice(0, 5).forEach(evento => {
    const linha = document.createElement('li');
    const cor = evento.status === 'online' ? '#2ecc71' : '#e74c3c';
    linha.innerHTML = `<span style="color: ${cor}">●</span> `;
    linha.append(`${evento.status === 'online' ? 'Voltou online' : 'Caiu (offline)'} em ${evento.timestamp}`);
    listaEventos.appendChild(linha);
  });

  painel.appendChild(listaEventos);
  return painel;
}

// Alterna entre abrir/fechar o painel de histórico de um item
async function alternarHistorico(item, ip) {
  const painelExistente = item.querySelector('.historico-painel');

  if (painelExistente) {
    // já está aberto -> fecha
    painelExistente.remove();
    ipExpandido = null;
    return;
  }

  // está fechado -> abre
  ipExpandido = ip;
  const painel = await criarPainelHistorico(ip);
  item.appendChild(painel);
}

// Limpa e redesenha tudo na tela com base nos dados recebidos
function desenharDashboard(equipamentos) {
  mapa.innerHTML = '';
  listaEquipamentos.innerHTML = '';

  equipamentos.forEach(equipamento => {
    // --- Cria a bolinha no mapa ---
    const bolinha = document.createElement('div');
    bolinha.className = 'equipamento-ponto ' + (equipamento.online ? 'online' : 'offline');
    bolinha.title = equipamento.nome;
    mapa.appendChild(bolinha);

    // --- Cria o item na lista lateral ---
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

    // Clique no item alterna o painel de histórico
    item.addEventListener('click', () => alternarHistorico(item, equipamento.ip));

    listaEquipamentos.appendChild(item);

    // Se esse equipamento estava marcado como expandido antes do redesenho,
    // reabre o painel automaticamente
    if (ipExpandido === equipamento.ip) {
      criarPainelHistorico(equipamento.ip).then(painel => item.appendChild(painel));
    }
  });

  const agora = new Date();
  ultimaAtualizacao.textContent = 'Atualizado em ' + agora.toLocaleTimeString('pt-BR');
}

async function atualizarDashboard() {
  const equipamentos = await buscarStatus();
  desenharDashboard(equipamentos);
}

atualizarDashboard();
setInterval(atualizarDashboard, 5000);