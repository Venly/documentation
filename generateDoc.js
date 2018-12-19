"use strict";
///<reference path="node_modules/@types/node/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
var Asciidoctor = require("asciidoctor.js");
var readline = require("readline");
var fs = require("fs");
letsGenerateSomeDocs('../rest/src/main/asciidoc/', '../rest/target/generated-snippets');
letsGenerateSomeDocs('./adoc/');
function letsGenerateSomeDocs(fileLocation, snippetsLocation) {
    if (snippetsLocation === void 0) { snippetsLocation = ''; }
    //passsing directoryPath and callback function
    fs.readdir(fileLocation, function (err, fileList) {
        var files = [];
        //handling error
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        }
        var regex = new RegExp(/(.*)\.adoc/i);
        //listing all files using forEach
        fileList.forEach(function (file) {
            var result = file.match(regex);
            if (result) {
                files.push(result[1]);
            }
        });
        compile(files, fileLocation, snippetsLocation);
    });
}
function compile(fileList, fileLocation, snippetsLocation) {
    fileList.forEach(function (fileName) {
        var content = '';
        var lineReader = readline.createInterface({
            input: fs.createReadStream("" + fileLocation + fileName + ".adoc")
        });
        var titlePrefix = '=';
        lineReader.on('line', function (line) {
            if (snippetsLocation) {
                titlePrefix = getTitlePrefix(line, titlePrefix);
                content = content + (operate(line, titlePrefix) + "\n");
            }
            else {
                content = content + (line + "\n");
            }
        });
        lineReader.on('close', function () {
            runAsciidoc(content, fileName, snippetsLocation);
        });
    });
}
function runAsciidoc(content, fileName, snippetsLocation) {
    var asciidoctor = Asciidoctor();
    var html = asciidoctor.convert(content, {
        'header_footer': false,
        'verbose': true,
        'backend': 'html',
        'source-highlighter': 'highlightjs',
        'mkdirs': true,
        'safe': 'unsafe',
        'to_dir': './src/partials/docs',
        'to_file': fileName + ".hbs",
        'attributes': {
            'snippets': snippetsLocation,
            'toc': 'left',
            'toclevels': 4,
        },
    });
}
function getTitlePrefix(line, currentPrefix) {
    var rePattern = new RegExp(/^(=*) /i);
    var arrMatches = line.match(rePattern);
    if (arrMatches) {
        var prefix = arrMatches[1];
        if (prefix.length >= 5) {
            return prefix;
        }
        else {
            return prefix + '=';
        }
    }
    else {
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
function operate(line, titlePrefix) {
    var rePattern = new RegExp(/operation::([0-9a-zA-Z_-]+)\[(snippets=)?['"]([0-9a-zA-Z-,_]+)['"]\]/i);
    var arrMatches = line.match(rePattern);
    if (arrMatches) {
        var name_1 = arrMatches[1];
        var snippets = arrMatches[3].split(',');
        var result_1 = '';
        snippets.forEach(function (type) {
            var t = type.toLowerCase();
            var u = t.replace(/-/g, '_');
            var title = titlePrependExample(t.replace(/-/g, ' ').replace('http', 'HTTP'), t);
            result_1 += "\n\n[[example_" + u + "_" + name_1 + "]]\n" + titlePrefix + " " + capitalize(title) + "\n\ninclude::{snippets}/" + name_1 + "/" + t + ".adoc[]";
        });
        return result_1.trimLeft();
    }
    return line;
}
