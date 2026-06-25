// Pega referências aos elementos do HTML que vamos preencher
const mapa = document.getElementById('mapa');
const listaEquipamentos = document.getElementById('lista-equipamentos');
const ultimaAtualizacao = document.getElementById('ultima-atualizacao');

// Busca os dados do backend
async function buscarStatus() {
  const resposta = await fetch('/api/status');
  const dados = await resposta.json();
  return dados;
}

// Limpa e redesenha tudo na tela com base nos dados recebidos
function desenharDashboard(equipamentos) {
  // Limpa o conteúdo anterior antes de redesenhar
  // (senão, a cada atualização, as bolinhas iriam se acumulando)
  mapa.innerHTML = '';
  listaEquipamentos.innerHTML = '';

  equipamentos.forEach(equipamento => {
    // --- Cria a bolinha no mapa ---
    const bolinha = document.createElement('div');
    bolinha.className = 'equipamento-ponto ' + (equipamento.online ? 'online' : 'offline');
    bolinha.title = equipamento.nome; // mostra o nome ao passar o mouse
    mapa.appendChild(bolinha);

    // --- Cria o item na lista lateral ---
    const item = document.createElement('li');

    const statusBolinha = document.createElement('span');
    statusBolinha.className = 'status-bolinha';
    statusBolinha.style.backgroundColor = equipamento.online ? '#2ecc71' : '#e74c3c';

    const textoStatus = equipamento.online
      ? `Online (${equipamento.tempo}ms)`
      : 'Offline';

    item.appendChild(statusBolinha);
    item.append(`${equipamento.nome} — ${equipamento.ip} — ${textoStatus}`);

    listaEquipamentos.appendChild(item);
  });

  // Atualiza o horário da última atualização
  const agora = new Date();
  ultimaAtualizacao.textContent = 'Atualizado em ' + agora.toLocaleTimeString('pt-BR');
}

// Junta tudo: busca os dados e desenha na tela
async function atualizarDashboard() {
  const equipamentos = await buscarStatus();
  desenharDashboard(equipamentos);
}

// Roda uma vez imediatamente ao carregar a página...
atualizarDashboard();

// ...e depois repete a cada 5 segundos
setInterval(atualizarDashboard, 5000);