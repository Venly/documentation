///<reference path="node_modules/@types/node/index.d.ts"/>

import * as Asciidoctor from 'asciidoctor.js';
import * as readline    from 'readline';
import { Interface }    from 'readline';
import * as fs          from 'fs';

// letsGenerateSomeDocs('../rest/src/main/asciidoc/', '../rest/target/generated-snippets');
letsGenerateSomeDocs('./adoc/');


function letsGenerateSomeDocs(fileLocation: string, snippetsLocation: string = '') {
    //passsing directoryPath and callback function
    fs.readdir(fileLocation, {withFileTypes: true}, (err, fileList) => {
        const files = [];
        //handling error
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        }
        const regex = new RegExp(/(.*)\.adoc/i);
        //listing all files using forEach
        fileList.forEach(function (file: fs.Dirent) {
            if (file.isFile()) {
                const result = file.name.match(regex);
                if (result) {
                    files.push(result[1]);
                }
            } else if (file.isDirectory()) {
                letsGenerateSomeDocs(`${fileLocation}${file.name}/`)
            }
        });

        compile(files, fileLocation, snippetsLocation);
    });

}

function compile(fileList: string[], fileLocation, snippetsLocation) {
    fileList.forEach((fileName: string) => {
        let content = '';

        const lineReader: Interface = readline.createInterface({
            input: fs.createReadStream(`${fileLocation}${fileName}.adoc`)
        });

        let titlePrefix = '=';

        lineReader.on('line', function (line) {
            if (snippetsLocation) {
                titlePrefix = getTitlePrefix(line, titlePrefix);
                content = content + `${operate(line, titlePrefix)}\n`;
            } else {
                content = content + `${line}\n`;
            }
        });

        lineReader.on('close', function () {
            runAsciidoc(content, fileName, snippetsLocation)
        });
    });
}

function runAsciidoc(content: string, fileName: string, snippetsLocation: string) {
    const asciidoctor = Asciidoctor();
    let html = asciidoctor.convert(content, {
        'header_footer': false,
        'verbose': true,
        'backend': 'html',
        'source-highlighter': 'highlightjs',
        'mkdirs': true,
        'safe': 'unsafe',
        'to_dir': './src/partials/docs',
        'to_file': `${fileName}.hbs`,
        'attributes': {
            'icons': 'font',
            'snippets': snippetsLocation,
            'toc': 'left',
            'toclevels': 4,
        },
    });
}

function getTitlePrefix(line: string, currentPrefix) {
    const rePattern = new RegExp(/^(=*) /i);
    const arrMatches = line.match(rePattern);
    if (arrMatches) {
        let prefix = arrMatches[1];
        if (prefix.length >= 5) {
            return prefix;
        } else {
            return prefix + '='
        }
    } else {
        return currentPrefix;
    }
}

function capitalize(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function titlePrependExample(title, type) {
    switch (type) {
        case 'curl-request':
        case 'http-request':
        case 'http-response':
            return 'Example ' + title;
        default:
            return title;
    }
}

function operate(line: string, titlePrefix: string) {
    const rePattern = new RegExp(/operation::([0-9a-zA-Z_-]+)\[(snippets=)?['"]([0-9a-zA-Z-,_]+)['"]\]/i);
    const arrMatches = line.match(rePattern);
    if (arrMatches) {
        const name = arrMatches[1];
        const snippets = arrMatches[3].split(',');
        let result = '';
        snippets.forEach((type: string) => {
            const t = type.toLowerCase();
            const u = t.replace(/-/g, '_');
            const title = titlePrependExample(t.replace(/-/g, ' ').replace('http', 'HTTP'), t);

            result += `\n\n[[example_${u}_${name}]]\n${titlePrefix} ${capitalize(title)}\n\ninclude::{snippets}/${name}/${t}.adoc[]`;
        });
        return result.trimLeft();
    }

    return line;
}



