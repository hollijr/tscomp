"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts = require("typescript");
// using typescript compiler api
function findStrings(sourceFile) {
    let stack = ["GeneralResources"];
    let pastStack = [];
    let aliases = [];
    let strings = [];
    while (stack.length > 0) {
        /*
          TODO: fix duplications:
          For each alias, look to see if it is in the expression on the right of an import.
          Current problem: need to exclude nodes that have already been processed:  e.g.,
    
              import GeneralResources from "GeneralResources"
    
          will put GeneralResources in the aliases list twice since it will be used as a
          needle after the alias (left) is added to the stack.
    
        */
        let needle = stack.pop();
        pastStack.push(needle);
        searchNode(sourceFile);
        function toString() {
            return `
      left: ${this.left}
      right: ${this.right}`;
        }
        function searchNode(node) {
            let re = new RegExp("^(.*/)*" + needle + "(/.*)*$");
            let right = "";
            let alias = null;
            switch (node.kind) {
                case ts.SyntaxKind.ImportDeclaration:
                    // import GenRes from "GeneralResources";
                    // <ImportDeclaration>node.importClause.name.text == "GenRes"
                    // import { GenRes } from "GeneralResources";
                    // <ImportDeclaration>node.importClause.<NamedImports>namedBindings.elements[].ImportSpecifier.name.text == "GenRes"
                    // import * as Resources from "GeneralResources";
                    // <ImportDeclaration>node.importClause.<NamespaceImport>namedBindings.name.text == "Resources"
                    let importNode = node;
                    // ImportDeclaration.moduleSpecifier is type Expression but should be a StringLiteral (per types.ts).
                    // If it is not, it is a grammar error.  So we'll cast it to a StringLiteral so we can 
                    // get it's .text property.  If it's not a StringLiteral, this property will be undefined.
                    // The import value can begin with, end with or contain the needle between / to 
                    right = importNode.moduleSpecifier.text;
                    if (right && right.search(re) >= 0) {
                        let importClause = importNode.importClause; // type: ImportClause
                        // ImportClause optionally has .name or .namedBindings properties
                        if (importClause.name) { // type: Identifier
                            alias = { left: importClause.name.text, right: right, toString: toString };
                            saveAlias(alias);
                        }
                        else if (importClause.namedBindings) { // type: NamedImportBindings
                            // NamedImportBindings = NamedspaceImport | NamedImports
                            if (importClause.namedBindings.name) {
                                alias = { left: importClause.namedBindings.name.text, right: right, toString: toString };
                                saveAlias(alias);
                            }
                            else if (importClause.namedBindings.elements) {
                                importClause.namedBindings.elements.forEach((element) => {
                                    alias = { left: element.name.text, right: right, toString: toString };
                                    saveAlias(alias);
                                });
                            }
                        }
                    }
                    break;
                case ts.SyntaxKind.ImportEqualsDeclaration:
                    // import GenRes2 = require("GeneralResources");
                    // <ImportEqualsDeclaration>node.name.text == "GenRes2"
                    let importEqualsNode = node, modRef = importEqualsNode.moduleReference; // type: ModuleReference
                    // ModuleReference = EntityName (for internal module ref) | ExternalModuleReference (for external)
                    if (ts.isExternalModuleReference(modRef) && modRef.expression.kind === ts.SyntaxKind.StringLiteral) {
                        let extModRef = modRef;
                        right = extModRef.expression.text;
                    }
                    else if (ts.isEntityName(modRef)) {
                        // EntityName = Identifier | QualifiedName 
                        // Identifier has .text
                        // QualifiedName has .right and .left. 
                        //  .left is either QualifiedName (recursive definition of qualifiers) or Identifier
                        //  .right is Identifier (the last part of the qualified name for the current QualifiedName object)
                        // While QualifiedName is a recursive definition, top-level instance returns complete right-side expression using .getText()
                        // Identifier also returns right-side expression using .getText()
                        right = modRef.getText();
                        re = new RegExp("^(.*\\\.)*" + needle + "(\\\..*)*$");
                    }
                    if (right && right.search(re) >= 0) {
                        alias = { left: importEqualsNode.name.text, right: right, toString: toString };
                        saveAlias(alias);
                    }
                    break;
                // let stuff = Resources.words;
                // let moreStuff = GenRes.moreWords;
                // let mostStuff = GenRes1.mostWords;
                // let stuff1 = stuff.delete;
                // VariableDeclaration.declarationList.declaractions.VariableDeclaration.name == "moreStuff"
                // node.VariableDeclaration.declarationList.declaractions.VariableDeclaration.initializer.expression.text == "Resources|GenRes|GenRes1|stuff"
                // node.VariableDeclaration.declarationList.declaractions.VariableDeclaration.initializer.Identifier.text == "words|moreWords" could be ".escapedText"
                // console.log(moreStuff.update);
                // ExpressionStatement.expression.arguments.PropertyAccessExpression...
                // PropertyAccessExpression.expression.text == "moreStuff"  --> Identifier
                // PropertyAccessExpression.name.text == "update"  --> Identifier
                // TODO
                case ts.SyntaxKind.VariableDeclaration:
                    let flag = node.flags;
                case ts.SyntaxKind.ExpressionStatement:
                case ts.SyntaxKind.PropertyAccessExpression:
                    break;
                default:
                    break;
            }
            ts.forEachChild(node, searchNode);
        }
    }
    function saveAlias(alias) {
        aliases.push(alias);
        if (pastStack.indexOf(alias.left) === -1) {
            stack.push(alias.left);
        }
    }
    function report(node, message) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    return aliases;
}
exports.findStrings = findStrings;
const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
    // Parse a file
    let sourceFile = ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts.ScriptTarget.ES2015, 
    /*setParentNodes */ true);
    // find strings
    let aliases = findStrings(sourceFile);
    aliases.forEach((alias) => console.log(alias.toString()));
});
//# sourceMappingURL=findStrings.js.map