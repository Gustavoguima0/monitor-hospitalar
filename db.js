const Database = require('better-sqlite3');

// Abre (ou cria, se não existir) o arquivo de banco de dados
const db = new Database('historico.db');

// Cria a tabela se ela ainda não existir.
// "IF NOT EXISTS" evita erro ao reiniciar o servidor com o banco já criado.
db.exec(`
  CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ip TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// Prepara a query de inserção uma única vez (mais eficiente que recriar a cada chamada)
const stmtInserir = db.prepare(`
  INSERT INTO historico (nome, ip, status) VALUES (?, ?, ?)
`);

function registrarEvento(nome, ip, status) {
  stmtInserir.run(nome, ip, status);
}

function buscarHistorico(ip = null) {
  if (ip) {
    return db.prepare('SELECT * FROM historico WHERE ip = ? ORDER BY id DESC').all(ip);
  }
  return db.prepare('SELECT * FROM historico ORDER BY id DESC').all();
}

module.exports = { registrarEvento, buscarHistorico };