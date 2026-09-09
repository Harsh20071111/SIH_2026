const fs = require('fs');
const path = require('path');

async function runProductionTests() {
  const baseUrl = 'https://sih-2026-wine-one.vercel.app';
  console.log('====================================================');
  console.log('  SECUREDOCS LIVE VERCEL PRODUCTION VERIFICATION    ');
  console.log('  Target:', baseUrl);
  console.log('====================================================\n');

  // 1. Poll GET /api/health
  console.log('[1/4] Checking GET /api/health...');
  let healthOk = false;
  let healthData = null;

  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, { headers: { 'Cache-Control': 'no-cache' } });
      const ct = res.headers.get('content-type') || '';
      console.log(`  [Attempt ${attempt}] Status: ${res.status}, Content-Type: ${ct}`);
      if (res.ok && ct.includes('application/json')) {
        healthData = await res.json();
        console.log('  ✅ GET /api/health SUCCEEDED:', JSON.stringify(healthData, null, 2));
        healthOk = true;
        break;
      }
    } catch (err) {
      console.log(`  [Attempt ${attempt}] Error:`, err.message);
    }
    await new Promise(r => setTimeout(r, 6000));
  }

  if (!healthOk) {
    console.error('\n❌ Health check failed to return JSON 200 within timeout.');
    return { healthOk: false };
  }

  // 2. Test POST /api/documents (Multipart upload with menu.html)
  console.log('\n[2/4] Testing POST /api/documents with menu.html (multipart/form-data)...');
  const menuPath = path.resolve(__dirname, '../menu.html');
  const fileBuffer = fs.readFileSync(menuPath);
  const crypto = require('crypto');
  const localHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  console.log('  Local file exact SHA-256:', localHash);

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="caseId"\r\n\r\nCASE-2026-00421\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="documentType"\r\n\r\nInvestigation Record\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="confidentiality"\r\n\r\nRestricted\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="description"\r\n\r\nProduction Live Upload Test\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="uploadedBy"\r\n\r\nOfficer Raj Patel\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="file"; filename="menu.html"\r\n`;
  body += `Content-Type: text/html\r\n\r\n`;

  const preamble = Buffer.from(body, 'utf-8');
  const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const fullBody = Buffer.concat([preamble, fileBuffer, epilogue]);

  const uploadRes = await fetch(`${baseUrl}/api/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBody.length.toString()
    },
    body: fullBody
  });

  console.log('  Upload Response Status:', uploadRes.status);
  const uploadJson = await uploadRes.json();
  console.log('  Upload Response Body:', JSON.stringify(uploadJson, null, 2));

  let uploadOk = (uploadRes.status === 201 && uploadJson.document && uploadJson.document.hash === localHash);
  console.log(`  Upload SHA-256 Match: ${uploadOk ? '✅ EXACT MATCH' : '❌ MISMATCH'}`);

  // 3. Test POST /api/documents/:id/verify-integrity
  let verifyOk = false;
  if (uploadJson.document) {
    const docId = uploadJson.document.id || uploadJson.document._id || uploadJson.document.documentId;
    console.log(`\n[3/4] Testing POST /api/documents/${docId}/verify-integrity...`);
    const verifyRes = await fetch(`${baseUrl}/api/documents/${docId}/verify-integrity`, {
      method: 'POST'
    });
    console.log('  Verify Response Status:', verifyRes.status);
    const verifyJson = await verifyRes.json();
    console.log('  Verify Response Body:', JSON.stringify(verifyJson, null, 2));
    verifyOk = (verifyRes.status === 200 && verifyJson.status === 'Verified' && verifyJson.isIntact === true);
    console.log(`  Cryptographic Integrity Status: ${verifyOk ? '✅ INTACT & VERIFIED' : '❌ FAILED'}`);
  }

  // 4. Test GET /api/documents
  console.log('\n[4/4] Testing GET /api/documents...');
  const listRes = await fetch(`${baseUrl}/api/documents`);
  console.log('  List Response Status:', listRes.status);
  const listJson = await listRes.json();
  const found = listJson.documents && listJson.documents.some(d => d.hash === localHash);
  console.log(`  Document in Catalog: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);

  console.log('\n====================================================');
  console.log('  VERIFICATION SUMMARY:');
  console.log('  Health Check:           ', healthOk ? 'PASS' : 'FAIL');
  console.log('  Production Upload:      ', uploadOk ? 'PASS' : 'FAIL');
  console.log('  SHA-256 Match:          ', uploadOk ? 'PASS' : 'FAIL');
  console.log('  Integrity Verification: ', verifyOk ? 'PASS' : 'FAIL');
  console.log('  Catalog Retrieval:      ', found ? 'PASS' : 'FAIL');
  console.log('====================================================');

  return { healthOk, uploadOk, verifyOk, found };
}

runProductionTests().catch(err => {
  console.error('Fatal error during production verification:', err);
});
