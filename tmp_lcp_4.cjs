const fs = require('fs');
const path = 'c:/Users/mrtua/Downloads/spshare/localhost_3000-20260303T013326.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const audits = data.audits;
if (audits) {
    console.log("Bootup Time:", audits['bootup-time']?.displayValue);
    const bootupDetails = audits['bootup-time']?.details?.items?.slice(0, 5);
    console.log("Bootup Details:", JSON.stringify(bootupDetails, null, 2));

    console.log("Main Thread Work:", audits['mainthread-work-breakdown']?.displayValue);
    const mtDetails = audits['mainthread-work-breakdown']?.details?.items;
    console.log("Main Thread Details:", JSON.stringify(mtDetails, null, 2));

    console.log("Long Tasks score:", audits['long-tasks']?.displayValue);
    const longTasks = audits['long-tasks']?.details?.items?.filter(t => t.duration > 100).map(t => ({
        duration: t.duration,
        url: t.url,
    }));
    console.log("Long Tasks > 100ms:", JSON.stringify(longTasks, null, 2));
}
