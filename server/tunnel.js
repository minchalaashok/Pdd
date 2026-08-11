const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });

    console.log(`🌐 Public Web App URL: ${tunnel.url}`);
    fs.writeFileSync(path.join(__dirname, '..', 'LIVE_PUBLIC_URL.txt'), `LifeLink Live Public URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    console.error('Tunnel creation error:', err);
  }
})();
