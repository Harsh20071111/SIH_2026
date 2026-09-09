const fs = require('fs');
const path = require('path');

async function testUpload() {
  const fileBuffer = fs.readFileSync(path.resolve(__dirname, '../menu.html'));
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="caseId"\r\n\r\nCASE-2026-00421\r\n';
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="file"; filename="menu.html"\r\n';
  body += 'Content-Type: text/html\r\n\r\n';

  const preamble = Buffer.from(body, 'utf-8');
  const epilogue = Buffer.from('\r\n--' + boundary + '--\r\n', 'utf-8');
  const fullBody = Buffer.concat([preamble, fileBuffer, epilogue]);

  console.log('Testing POST https://sih-2026-wine-one.vercel.app/api/documents ...');
  try {
    const res = await fetch('https://sih-2026-wine-one.vercel.app/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary
      },
      body: fullBody
    });

    console.log('STATUS:', res.status);
    console.log('CONTENT-TYPE:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error('ERROR:', err.message);
  }

  console.log('\nTesting POST https://sih-2026-wine-one.vercel.app/api/documents/upload ...');
  try {
    const res = await fetch('https://sih-2026-wine-one.vercel.app/api/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary
      },
      body: fullBody
    });

    console.log('STATUS:', res.status);
    console.log('CONTENT-TYPE:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testUpload();
