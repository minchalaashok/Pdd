const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5000 });
    console.log(`Tunnel URL: ${tunnel.url}`);
    fs.writeFileSync(path.join(__dirname, '..', 'backend_tunnel.txt'), `your url is: ${tunnel.url}\n`);
    
    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    console.error('Error starting tunnel:', err);
  }
})();
