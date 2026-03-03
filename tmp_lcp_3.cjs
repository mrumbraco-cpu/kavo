const fs = require('fs');
const jsMap = fs.readFileSync('c:/Users/mrtua/Downloads/spshare/.next/server/client-reference-manifest.json', 'utf8');
const data = JSON.parse(jsMap);

for (const [key, value] of Object.entries(data.clientModules)) {
    if (value.indexOf('69be39811437728d.js') !== -1) {
        console.log("Module in chunk:", key);
    }
}
