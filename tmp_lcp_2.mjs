import fs from 'fs';
const path = 'c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const audits = data.audits;
if (audits) {
    const unusedJs = audits['unused-javascript']?.details?.items;
    console.log("Unused JS items:", JSON.stringify(unusedJs, null, 2));

    // Let's also check the script treemap to see what's inside these chunks
    const treemap = audits['script-treemap-data']?.details?.nodes;
    if (treemap) {
        const hugeChunk = treemap.find(n => n.name.includes('69be39811437728d'));
        if (hugeChunk) {
            console.log("Huge Chunk details:", JSON.stringify(hugeChunk, null, 2));
        }
    }
}
