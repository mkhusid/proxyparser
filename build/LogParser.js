const { promises } = require('fs');
class LogParser {
    constructor(countedField, fieldsStatement, filePath) {
        this.countedField = countedField;
        this.fieldsStatement = new RegExp(`^#${fieldsStatement}\\W+`, 'gi');
        this.filePath = filePath;
    }
    async parseLogs(filePath = this.filePath) {
        if (!filePath)
            this.noLogFileException();
        const logs = await promises.readFile(filePath, { encoding: 'utf-8' });
        const lines = logs.split('\r\n');
        const fieldsLine = lines.find((line) => { return line.match(this.fieldsStatement); });
        if (!fieldsLine)
            this.noFieldsException();
        this.fields = fieldsLine.substring(fieldsLine.match(this.fieldsStatement)[0].length).split(' ');
        this.rows = lines.filter(line => !line.startsWith('#') && line.length > 0);
        return { fields: this.fields, rows: this.rows };
    }
    countAppearence(rows = this.rows, fields) {
        if (!Array.isArray(rows))
            this.rowsTypeException();
        let entryCounts = {};
        rows.forEach((row) => {
            let entryKey = (typeof row === 'string')
                ? this.parseRowAndGetIndex(row, fields)
                : (typeof row === "object") ? row[this.countedField]
                    : this.rowTypeException();
            if (entryKey)
                entryCounts[entryKey] ? entryCounts[entryKey]++ : entryCounts[entryKey] = 1;
        });
        this.printCounted(entryCounts);
        return entryCounts;
    }
    parseRowAndGetIndex(row, fields = this.fields) {
        if (!fields)
            this.noFieldsException();
        const hasQuotes = row.match(/"|'|`/g);
        let values = hasQuotes ? this.parseRowWithQuotes(row) : row.split(' ');
        let countedFieldIndex = values[fields.indexOf(this.countedField)];
        if (!countedFieldIndex)
            this.fieldNotFoundException();
        return countedFieldIndex;
    }
    parseRowWithQuotes(row) {
        return row.split(/"|'|`/g).reduce((values, piece) => (piece.startsWith(' ') || piece.endsWith(' '))
            ? values = values.concat(piece.match(/[^ ]+/g))
            : values = values.concat(piece), []);
    }
    printCounted(entryCounts) {
        for (let entry in entryCounts) {
            console.log(`${this.countedField}: ${entry}, count: ${entryCounts[entry]}`);
        }
    }
    rowTypeException() {
        throw TypeError('Row value should be a String or an Object.');
    }
    rowsTypeException() {
        throw TypeError('Rows value should be an Array.');
    }
    noFieldsException() {
        throw ReferenceError('Fields are not specified.');
    }
    fieldNotFoundException() {
        throw ReferenceError('Specified field wasn`t found in the provided logs.');
    }
    noLogFileException() {
        throw ReferenceError('Path to log file is not specified.');
    }
}
module.exports = LogParser;
