const fs = require('fs');
const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    const numeros = fs.readFileSync('pruebaNumero.csv', 'utf8')
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const mensaje = fs.readFileSync('mensaje.txt', 'utf8');

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com/');

    console.log('Escanea el código QR y presiona Enter cuando estés dentro...');
    process.stdin.once('data', async () => {
      for (const numero of numeros) {
        try {
          const url = `https://web.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
          await page.goto(url);

          await page.waitForSelector('span[data-testid="send"]', { timeout: 20000 });
          await page.click('span[data-testid="send"]');

          // Pausa aleatoria entre 1 y 3 segundos
          await sleep(Math.floor(Math.random() * 2000) + 1000);

          console.log(`Mensaje enviado a ${numero}`);
        } catch (err) {
          console.log(`No se pudo enviar a ${numero}: ${err.message}`);
        }
      }
      console.log('¡Todos los mensajes han sido procesados!');
      await browser.close();
      process.exit();
    });

  } catch (err) {
    console.error('Error general:', err);
  }
})();
