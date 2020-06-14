
const { expect, assert } = require('chai');
const logParser = require('../build/LogParser.js');
const { logFileOutput, parsedFile } = require('./expectedOutputs');

describe('Log file parser test =>', () => {
    it('returns object with entry counts', async () => {
        const hostsAppeareceCounter = new logParser('cs-host', 'fields', 'tests/testFile.log');
        const logs = await hostsAppeareceCounter.parseLogs();
        assert.deepEqual(logs,parsedFile)
    });

    it('should throw "no filePath" error, when it`s not in constructor', async () => {
        const hostsAppeareceCounter = new logParser('cs-host', 'fields');
            await hostsAppeareceCounter.parseLogs()
                .catch( e => {
                    console.log(e.message)
                    expect(() => {throw e}).to.throw(ReferenceError)
                })    
            });

    it('should throw "no fields" error, when it`s not in constructor', async () => {
        const hostsAppeareceCounter = new logParser('cs-host');
        hostsAppeareceCounter.filePath = 'tests/testFile.log'
            await hostsAppeareceCounter.parseLogs()
                .catch( e => {
                    console.log(e.message)
                    expect(() => {throw e}).to.throw(ReferenceError)
                })    
        });

    it('should throw "no fields" error, when it`s specifeid in constructor, but not in file', async () => {
        const hostsAppeareceCounter = new logParser('cs-host', 'logFields', 'tests/testFile.log');
            await hostsAppeareceCounter.parseLogs()
                .catch( e => {
                    console.log(e.message)
                    expect(() => {throw e}).to.throw(ReferenceError)
                })
    });
});


describe('Appearence Counter test =>', () => {
    it('returns object with entry counts from file', async () => {
        let hostsAppeareceCounter = new logParser('cs-host', 'fields', 'tests/testFile.log');
        await hostsAppeareceCounter.parseLogs();
        const entryCounts = hostsAppeareceCounter.countAppearence()
        assert.deepEqual(entryCounts,logFileOutput)
    });

    it('returns object with entry counts from json (e.g. for HTTP request)', async () => {
        let hostsAppeareceCounter = new logParser('csHost');
        const logs = [
            {ip: "127.0.0.1", csHost: 'google.com'},
            {ip: "127.0.0.1", csHost: 'facebook.com'},
            {ip: "127.0.0.1", csHost: 'google.com'},
            {ip: "127.0.0.1", csHost: 'facebook.com'},
            {ip: "127.0.0.1", csHost: 'google.com'},
            {ip: "127.0.0.1", csHost: 'gmail.com'},
        ]
        const output = { 'google.com': 3, 'facebook.com': 2, 'gmail.com': 1 }
        const entryCounts = hostsAppeareceCounter.countAppearence(logs)
        assert.deepEqual(entryCounts,output)
    });

    it('returns object with entry counts from json (e.g. for HTTP request)', async () => {
        let hostsAppeareceCounter = new logParser('csHost');
        const logs = [
            "127.0.0.1 google.com",
            "127.0.0.1 facebook.com",
            "127.0.0.1 google.com",
            "127.0.0.1 gmail.com",
            "127.0.0.1 google.com",
            "127.0.0.1 gmail.com"
        ]
        const output = { 'google.com': 3, 'facebook.com': 1, 'gmail.com': 2 }
        const entryCounts = hostsAppeareceCounter.countAppearence(logs, ['ip', 'csHost'])
        assert.deepEqual(entryCounts,output)
    });


    it('returns object with entry counts from json when some wors has missing fields', async () => {
        let hostsAppeareceCounter = new logParser('user');
        const logs = [
            {ip: "127.0.0.1", csHost: 'google.com', user: 'mkhusid'},
            {ip: "127.0.0.1", csHost: 'facebook.com'},
            {ip: "127.0.0.1", csHost: 'google.com', user: 'anonymous'},
            {ip: "127.0.0.1", csHost: 'facebook.com', user: 'mkhusid'},
        ]
        const output = {mkhusid: 2, anonymous: 1}
        const entryCounts =  hostsAppeareceCounter.countAppearence(logs)
        assert.deepEqual(entryCounts,output)

    });


    it('should throw "wrong rows type" error', async () => {
        const hostsAppeareceCounter = new logParser('cs-host');
        const logs = `'google.com','facebook.com','gmail.com'`
        try {
            hostsAppeareceCounter.countAppearence(logs)

        } catch (e) {
            expect( e => expect(() => {throw e}).to.throw(TypeError))
            console.log(e.message)

        }
    });

    it('should throw "wrong row type" error', async () => {
        const hostsAppeareceCounter = new logParser('cs-host');
        const logs = [1,2,3]
        try {
            hostsAppeareceCounter.countAppearence(logs)
        } catch (e) {
            expect( e => expect(() => {throw e}).to.throw(TypeError))
            console.log(e.message)
        }
    });

    it('should throw "no fields" error, when rows are strings, but fields are not specified', async () => {
        const hostsAppeareceCounter = new logParser('cs-host');
        const logs = ['google.com','facebook.com','gmail.com']
        try {
            hostsAppeareceCounter.countAppearence(logs)
        } catch (e) {
            expect( e => expect(() => {throw e}).to.throw(ReferenceError))
            console.log(e.message)
        }
    });

    it('should throw "field not found" error', async () => {
        let hostsAppeareceCounter = new logParser('domain', 'fields', 'tests/testFile.log');
        await hostsAppeareceCounter.parseLogs();
        try {
          hostsAppeareceCounter.countAppearence()
        } catch (e) {
            expect( e => expect(() => {throw e}).to.throw(ReferenceError))
            console.log(e.message)
        }
    });
});

