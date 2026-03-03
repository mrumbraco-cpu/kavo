const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json', 'utf8'));
const networkItems = data.audits['network-requests']?.details?.items;
console.log('Total network requests:', networkItems.length);

const types = {};
networkItems.forEach(i => {
    types[i.resourceType] = (types[i.resourceType] || 0) + 1;
});
console.log('Resource types:', JSON.stringify(types, null, 2));

const domains = {};
networkItems.forEach(i => {
    try {
        const d = new URL(i.url).hostname;
        domains[d] = (domains[d] || 0) + 1;
    } catch (e) { }
});
console.log('Domains:', JSON.stringify(domains, null, 2));
