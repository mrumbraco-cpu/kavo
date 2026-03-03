const fs = require('fs');
const path = 'c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const lcpElement = data.audits['largest-contentful-paint-element'];
if (lcpElement && lcpElement.details && lcpElement.details.items) {
    console.log("LCP Element:", JSON.stringify(lcpElement.details.items[0], null, 2));
}

const renderBlocking = data.audits['render-blocking-resources'];
if (renderBlocking && renderBlocking.details && renderBlocking.details.items) {
    console.log("Render Blocking:", JSON.stringify(renderBlocking.details.items, null, 2));
}

const unminifiedCss = data.audits['unminified-css'];
if (unminifiedCss && unminifiedCss.details && unminifiedCss.details.items) {
    console.log("Unminified CSS:", JSON.stringify(unminifiedCss.details.items, null, 2));
}

const bootup = data.audits['bootup-time'];
if (bootup && bootup.details && bootup.details.items) {
    console.log("Bootup scripts:", JSON.stringify(bootup.details.items.slice(0, 5), null, 2));
}
