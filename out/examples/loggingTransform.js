"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const printer = ts.createPrinter();
const source = `let x = n + 42;`;
const loggingTransformer = (context) => (rootNode) => {
    function visit(node) {
        console.log("Visiting " + ts.SyntaxKind[node.kind]);
        return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
};
const sourceFile = ts.createSourceFile('test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
console.log(printer.printFile(sourceFile));
// Options may be passed to transform
const result = ts.transform(sourceFile, [loggingTransformer]);
const transformedSourceFile = result.transformed[0];
console.log(printer.printFile(transformedSourceFile));
//# sourceMappingURL=loggingTransform.js.map