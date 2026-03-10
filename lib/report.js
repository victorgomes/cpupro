const os = require('os');
const fs = require('fs');
const path = require('path');
const open = require('open');
const createHtmlRawTextPrinter = require('./html-data-printers/raw-text');
const createHtmlBase64DataPrinter = require('./html-data-printers/base64');
const {defaultFilename} = require('./utils');
const jsonxl = require('./tmp/jsonxl-snapshot9');

const reportTemplateFilename = path.join(__dirname, '../build/report.html');

function createBase64DataPrinter(maxChunkSize, binary, compress) {
    return createHtmlBase64DataPrinter(
        maxChunkSize,
        compress,
        // type
        `discovery/${binary ? 'binary-' : ''}${compress ? 'compressed-' : ''}data-chunk`,
        // onDataChunk
        `discoveryLoader.push(chunk, ${binary}, ${compress})`
    );
}

function createRawTextDataPrinter(maxChunkSize) {
    return createHtmlRawTextPrinter(
        maxChunkSize,
        // type
        'discovery/data-chunk',
        // onDataChunk
        'discoveryLoader.push(chunk, false, false)'
    );
}

module.exports = function createReport(data, filename, turbofanData) {
    let writtenToFile = false;
    const writeToFile = async filepath => {
        writtenToFile = filepath || defaultFilename('html');

        let template = await fs.promises.readFile(reportTemplateFilename, 'utf8');
        template = template.replace(/dataSource:\s*"url"\s*,\s*data:\s*[a-zA-Z0-9_.]+/g, 'dataSource:"push",data:true');
        await fs.promises.writeFile(writtenToFile, template);

        const chunkSize = 1024 * 1024;
        const mainModule = require.main?.filename || '';
        const result = [];
        const printer =
            typeof data === 'string'
                ? createRawTextDataPrinter(16 * 64 * 1024) // 1Mb
                : createBase64DataPrinter(8 * 64 * 1024, true, true); // 512Kb
        const content = typeof data === 'string' || ArrayBuffer.isView(data) ? data : jsonxl.encode(data);
        let encodedSize = 0;

        result.push(
            `\n<script>discoveryLoader.start(${JSON.stringify({
                type: filename ? 'file' : 'build',
                name: filename || (mainModule && path.relative(process.cwd(), mainModule)),
                size: 'byteLength' in content ? content.byteLength : content.length,
                createdAt: Date.now()
            })})</script>`
        );

        for (let i = 0; i < content.length; i += chunkSize) {
            for (const outChunk of printer.push(content.slice(i, i + chunkSize))) {
                encodedSize += outChunk.length;
                result.push(outChunk);
            }
            if (result.length > 0) {
                await fs.promises.appendFile(writtenToFile, result.join(''));
                result.length = 0;
            }
        }

        for (const outChunk of printer.finish()) {
            encodedSize += outChunk.length;
            result.push(outChunk);
        }

        result.push('\n<script>discoveryLoader.finish(' + encodedSize + ')</script>');

        if (turbofanData) {
            result.push('\n<script>window.__turbofanData = ' + JSON.stringify(turbofanData) + ';\n</script>');
        }

        if (result.length > 0) {
            await fs.promises.appendFile(writtenToFile, result.join(''));
            result.length = 0;
        }

        return writtenToFile;
    };

    return Object.freeze({
        writeToFileAsync: writeToFile,
        writeToFile,
        async open() {
            let filepath = writtenToFile;

            if (!filepath || !fs.existsSync(filepath)) {
                filepath = path.join(os.tmpdir(), defaultFilename('html'));
                await writeToFile(filepath);
            }

            open(filepath);

            return writtenToFile;
        }
    });
};
