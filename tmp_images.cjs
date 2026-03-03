const fs = require('fs');
const path = 'c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const network = data.audits['network-requests']?.details?.items;
if (network) {
    const images = network.filter(n => n.resourceType === 'Image' || n.mimeType.includes('image'));
    console.log("Largest images (transfer size):");
    const topImages = images.sort((a, b) => b.transferSize - a.transferSize).slice(0, 10);
    topImages.forEach(img => {
        console.log(`- ${img.url.substring(0, 80)}... (${(img.transferSize / 1024).toFixed(1)} KB)`);
    });
}

const diagnostic = data.audits['image-size-responsive']?.details?.items;
if (diagnostic && diagnostic.length > 0) {
    console.log("\nUnsized/Non-responsive images:");
    console.log(JSON.stringify(diagnostic, null, 2));
}

const lcpElement = data.audits['largest-contentful-paint-element']?.details?.items?.[0];
console.log("\nLCP Element info:", JSON.stringify(lcpElement, null, 2));
