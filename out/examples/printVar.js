"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const printer = ts.createPrinter();
const sourceFile = ts.createSourceFile('test.ts', 'const x  :  number = 42', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
console.log(printer.printFile(sourceFile));
//# sourceMappingURL=printVar.js.map