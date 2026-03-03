const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T093959.json', 'utf8'));

const metrics = data.audits.metrics.details.items[0];
console.log('--- Key Metrics ---');
console.log('Performance Score:', data.categories.performance.score * 100);
console.log('LCP:', metrics.largestContentfulPaint, 'ms');
console.log('TBT:', metrics.totalBlockingTime, 'ms');
console.log('FCP:', metrics.firstContentfulPaint, 'ms');
console.log('CLS:', metrics.cumulativeLayoutShift);
console.log('SI (Speed Index):', metrics.speedIndex, 'ms');

console.log('\n--- Long Tasks (> 50ms) ---');
const longTasks = data.audits['long-tasks']?.details?.items || [];
longTasks.filter(t => t.duration > 50).forEach(t => {
    console.log(`- Duration: ${t.duration.toFixed(2)}ms | URL: ${t.url}`);
});

console.log('\n--- Unused JS ---');
const unusedJs = data.audits['unused-javascript']?.details?.items || [];
unusedJs.forEach(item => {
    console.log(`- Wasted: ${(item.wastedBytes / 1024).toFixed(1)}KB | URL: ${item.url}`);
});

console.log('\n--- Main Thread Breakdown ---');
const mtBreakdown = data.audits['mainthread-work-breakdown']?.details?.items || [];
mtBreakdown.forEach(item => {
    console.log(`- ${item.groupLabel}: ${item.duration.toFixed(2)}ms`);
});

console.log('\n--- Network Summary ---');
const network = data.audits['network-requests']?.details?.items || [];
const heavy = network.sort((a, b) => b.transferSize - a.transferSize).slice(0, 5);
heavy.forEach(n => {
    console.log(`- Size: ${(n.transferSize / 1024).toFixed(1)}KB | URL: ${n.url}`);
});
