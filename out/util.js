"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
exports.printNode = (node) => {
    const sourceFile = ts.createSourceFile('test.ts', '', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    console.log(ts.createPrinter().printNode(ts.EmitHint.Expression, node, sourceFile));
};
exports.findNode = (n, f) => {
    let result;
    function findNode(nn) {
        if (result) {
            return;
        }
        if (f(nn)) {
            result = nn;
            return;
        }
        ts.forEachChild(nn, findNode);
    }
    findNode(n);
    return result;
};
//# sourceMappingURL=util.js.map