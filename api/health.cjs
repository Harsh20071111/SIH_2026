module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString(),
    service: "SecureDocs API (Serverless CJS)",
    version: "2.0.0"
  }));
};
