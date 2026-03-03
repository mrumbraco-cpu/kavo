const fs = require('fs');
const path = 'c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const audits = data.audits;
if (audits) {
    const lcp = audits['largest-contentful-paint-element'];
    console.log("LCP Element:", JSON.stringify(lcp?.details?.items, null, 2));
}

const network = audits['network-requests']?.details?.items;
if (network) {
    const apiReqs = network.filter(n => n.url.includes('/api/search'));
    console.log("API Requests:", JSON.stringify(apiReqs, null, 2));

    // Also print longest running tasks or largest assets
    const largest = [...network].sort((a, b) => b.transferSize - a.transferSize).slice(0, 5);
    console.log("Largest assets:", largest.map(n => ({ url: n.url, size: n.transferSize })));
}
