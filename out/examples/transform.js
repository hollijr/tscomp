"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const printer = ts.createPrinter();
const source = `var x = 1 + 2 + 3;`;
const transformer = (context) => (rootNode) => {
    function visit(node) {
        console.log("Visiting " + ts.SyntaxKind[node.kind]);
        node = ts.visitEachChild(node, visit, context);
        if (node.kind === ts.SyntaxKind.BinaryExpression) {
            const binary = node;
            if (binary.left.kind === ts.SyntaxKind.NumericLiteral && binary.right.kind === ts.SyntaxKind.NumericLiteral) {
                const left = binary.left;
                const leftVal = parseFloat(left.text);
                const right = binary.right;
                const rightVal = parseFloat(right.text);
                switch (binary.operatorToken.kind) {
                    case ts.SyntaxKind.PlusToken:
                        return ts.createLiteral(leftVal + rightVal);
                    case ts.SyntaxKind.AsteriskToken:
                        return ts.createLiteral(leftVal * rightVal);
                    case ts.SyntaxKind.MinusToken:
                        return ts.createLiteral(leftVal - rightVal);
                }
            }
        }
        return node;
    }
    return ts.visitNode(rootNode, visit);
};
const sourceFile = ts.createSourceFile('test.ts', source, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
console.log(printer.printFile(sourceFile));
// Options may be passed to transform
const result = ts.transform(sourceFile, [transformer]);
const transformedSourceFile = result.transformed[0];
console.log(printer.printFile(transformedSourceFile));
result.dispose();
//# sourceMappingURL=transform.js.map