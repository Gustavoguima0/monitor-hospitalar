const resultado = await ping.promise.probe("192.168.99.99");

async function testar() {
  const resultado = await ping.promise.probe("8.8.8.8");
  console.log(resultado);
}

testar();