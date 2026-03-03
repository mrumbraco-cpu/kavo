const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json', 'utf8'));
const metrics = data.audits.metrics.details.items[0];
console.log("LCP:", metrics.largestContentfulPaint);
console.log("FCP:", metrics.firstContentfulPaint);
console.log("TBT:", metrics.totalBlockingTime);
console.log("CLS:", metrics.cumulativeLayoutShift);
console.log("TTI:", metrics.interactive);
