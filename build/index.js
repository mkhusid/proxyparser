const logParser = require('./LogParser');
const main = async () => {
    let hostsAppeareceCounter = new logParser('cs-host', 'fields', process.argv[2]);
    await hostsAppeareceCounter.parseLogs();
    hostsAppeareceCounter.countAppearence();
};
main().catch(e => console.log(`[${e.name}]: ${e.message}`));
