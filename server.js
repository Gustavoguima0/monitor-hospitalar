const ping = require('ping');

async function testarOnline() {
  console.log('Testando IP online (8.8.8.8)...');
  const resultado = await ping.promise.probe('8.8.8.8');
  console.log(resultado);
}

async function testarOffline() {
  console.log('\nTestando IP offline/inexistente (192.168.99.99)...');
  const resultado = await ping.promise.probe('192.168.99.99', { timeout: 2 });
  console.log(resultado);
}

async function main() {
  await testarOnline();
  await testarOffline();
}

main();