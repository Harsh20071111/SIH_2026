// Live Audit Log Watcher for SecureDocs MongoDB
// Usage: mongosh "mongodb://localhost:27017/securedocs" --quiet scripts/watch-audit.js

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";

function formatLog(log) {
  const time = new Date(log.timestamp).toLocaleTimeString();
  let tag = `[${log.action}]`;
  let color = CYAN;

  if (log.action.includes("LOGIN_SUCCESS")) {
    tag = `[LOGIN SUCCESS]`;
    color = GREEN;
  } else if (log.action.includes("LOGIN_FAILED") || log.action.includes("Failed login")) {
    tag = `[LOGIN FAILED] `;
    color = RED;
  } else if (log.action.includes("LOGOUT")) {
    tag = `[LOGOUT]       `;
    color = YELLOW;
  } else if (log.action.includes("VIEW")) {
    tag = `[ACCESS VIEW]  `;
    color = BLUE;
  } else if (log.action.includes("UPLOAD") || log.action.includes("CREATE")) {
    tag = `[CREATE/UPLOAD]`;
    color = CYAN;
  }

  const user = log.userName || log.userId || "Unknown";
  const role = log.userRole ? `(${log.userRole})` : "";
  const ip = log.ipAddress ? ` | IP: ${log.ipAddress}` : "";
  const extra = log.documentId ? ` | Doc: ${log.documentId}` : (log.caseId ? ` | Case: ${log.caseId}` : "");
  const res = log.result ? ` | Result: ${log.result}` : "";

  return `${GRAY}[${time}]${RESET} ${BOLD}${color}${tag}${RESET} ${BOLD}${user}${RESET} ${role}${extra}${ip}${res}`;
}

print(`\n${BOLD}${CYAN}==============================================================${RESET}`);
print(`${BOLD} 🔴 LIVE AUDIT LOG STREAM - SECUREDOCS${RESET}`);
print(` Monitoring real-time logins, access, and user actions...`);
print(` ${GRAY}Press Ctrl+C to stop${RESET}`);
print(`${BOLD}${CYAN}==============================================================${RESET}\n`);

// Fetch last 5 records
const initialLogs = db.auditlogs.find().sort({ timestamp: -1 }).limit(5).toArray();
let lastTime = new Date();

if (initialLogs.length > 0) {
  print(`${GRAY}--- Recent Activity ---${RESET}`);
  initialLogs.reverse().forEach((l) => {
    print(formatLog(l));
    const t = new Date(l.timestamp);
    if (t > lastTime) lastTime = t;
  });
  print(`${GRAY}--- Watching for new events... ---${RESET}\n`);
}

while (true) {
  const newLogs = db.auditlogs
    .find({ timestamp: { $gt: lastTime } })
    .sort({ timestamp: 1 })
    .toArray();

  for (const l of newLogs) {
    print(formatLog(l));
    const t = new Date(l.timestamp);
    if (t > lastTime) lastTime = t;
  }

  sleep(1000);
}
