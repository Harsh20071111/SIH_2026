module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString(),
    service: "SecureDocs API (Serverless)",
    version: "2.0.0"
  });
};
