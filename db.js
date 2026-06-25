const path = require('path');
const Database = require('better-sqlite3');

// Caminho absoluto: garante que o banco sempre seja criado/aberto
// na mesma pasta do projeto, independente de onde o processo for iniciado
// (ex: systemd, Docker, ou um atalho que abre em outro diretório).
const dbPath = path.join(__dirname, 'historico.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ip TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

const stmtInserir = db.prepare(`
  INSERT INTO historico (nome, ip, status) VALUES (?, ?, ?)
`);

function registrarEvento(nome, ip, status) {
  try {
    stmtInserir.run(nome, ip, status);
  } catch (erro) {
    // Um erro de banco (disco cheio, permissão, etc.) não deve derrubar
    // o servidor inteiro — só perdemos esse registro de histórico, e seguimos.
    console.error('Erro ao registrar evento no histórico:', erro.message);
  }
}

function buscarHistorico(ip = null, limite = 100) {
  try {
    if (ip) {
      return db
        .prepare('SELECT * FROM historico WHERE ip = ? ORDER BY id DESC LIMIT ?')
        .all(ip, limite);
    }
    return db.prepare('SELECT * FROM historico ORDER BY id DESC LIMIT ?').all(limite);
  } catch (erro) {
    console.error('Erro ao buscar histórico:', erro.message);
    return []; // devolve lista vazia em vez de quebrar o endpoint
  }
}

function fecharBanco() {
  try {
    db.close();
    console.log('Banco de dados fechado corretamente.');
  } catch (erro) {
    console.error('Erro ao fechar o banco:', erro.message);
  }
}

module.exports = { registrarEvento, buscarHistorico, fecharBanco };