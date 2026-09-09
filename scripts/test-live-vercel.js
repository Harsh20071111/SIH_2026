async function main() {
  const url = 'https://sih-2026-wine-one.vercel.app/api/health';
  console.log(`Polling ${url}...`);
  for (let i = 1; i <= 15; i++) {
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      const ct = res.headers.get('content-type') || '';
      console.log(`[Attempt ${i}] Status: ${res.status}, Content-Type: ${ct}`);
      if (ct.includes('application/json')) {
        const data = await res.json();
        console.log('✅ LIVE API HEALTH RESPONSE:', data);
        return true;
      }
    } catch (err) {
      console.log(`[Attempt ${i}] Error: ${err.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
  return false;
}

main().then(success => {
  if (!success) {
    console.log('Still awaiting deployment or received HTML response.');
  }
});
