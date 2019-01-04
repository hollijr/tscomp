"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class MemoryCompilerHost {
    constructor() {
        this.files = {};
        this.getDefaultLibFileName = (options) => 'lib.d.ts';
        this.getDirectories = (path) => [];
        this.writeFile = (filename, data, writeByteOrderMark, onError) => { };
        this.getCurrentDirectory = () => "";
        this.getCanonicalFileName = (fileName) => fileName;
        this.useCaseSensitiveFileNames = () => true;
        this.getNewLine = () => "\n";
        this.fileExists = (fileName) => !!this.files[fileName];
        this.readFile = (fileName) => this.files[fileName];
    }
    getSourceFile(filename, languageVersion, onError) {
        var text = this.files[filename];
        if (!text)
            return null;
        return ts.createSourceFile(filename, text, languageVersion);
    }
    addFile(fileName, body) {
        this.files[fileName] = body;
    }
}
exports.default = MemoryCompilerHost;
//# sourceMappingURL=MemoryCompilerHost.js.map