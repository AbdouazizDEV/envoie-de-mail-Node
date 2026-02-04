const http = require('http');
const url = require('url');

// Charger les variables d'environnement
require('dotenv').config();

// Importer les handlers
const contactHandler = require('./api/contact');
const reservationHandler = require('./api/reservation');
const panelsInscriptionHandler = require('./api/panels-inscription');

const PORT = 3001;

// Adapter res pour être compatible avec Vercel handlers
function createResponseAdapter(res) {
  let statusCode = 200;
  const headers = { 'Content-Type': 'application/json' };
  const originalEnd = res.end.bind(res);

  res.status = (code) => {
    statusCode = code;
    return res;
  };

  res.json = (data) => {
    res.writeHead(statusCode, headers);
    originalEnd(JSON.stringify(data));
  };

  res.end = (data) => {
    if (data === undefined && statusCode) {
      res.writeHead(statusCode, headers);
    }
    originalEnd(data);
  };

  return res;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Adapter res pour Vercel
  const adaptedRes = createResponseAdapter(res);

  // Parser le body JSON
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    // Ajouter body et method à req pour les handlers
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (e) {
      req.body = {};
    }
    req.method = method;

    // Router les requêtes
    if (path === '/api/contact') {
      await contactHandler(req, adaptedRes);
    } else if (path === '/api/reservation') {
      await reservationHandler(req, adaptedRes);
    } else if (path === '/api/panels-inscription') {
      await panelsInscriptionHandler(req, adaptedRes);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Route non trouvée' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur http://localhost:${PORT}`);
  console.log(`📧 Test Contact: curl -X POST http://localhost:${PORT}/api/contact -H "Content-Type: application/json" -d '{"civility":"Monsieur","fullName":"Jean Dupont","email":"test@example.com","message":"Test message"}'`);
  console.log(`📅 Test Réservation: curl -X POST http://localhost:${PORT}/api/reservation -H "Content-Type: application/json" -d '{"fullName":"Marie Martin","email":"marie@example.com","package":"Premium","numberOfPeople":"2"}'`);
});
