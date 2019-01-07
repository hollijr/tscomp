"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts = require("typescript");
class Alias {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    toString() {
        return `
      left: ${this.left}
      right: ${this.right}`;
    }
    equals(alias) {
        return this.left === alias.left && this.right === alias.right;
    }
}
// using typescript compiler api
function findStrings(sourceFile) {
    let importTargets = ["GeneralResources", "StringResources"];
    let pastTargets = [];
    let aliases = [];
    let strings = [];
    // find aliases for the imported target
    searchNode(sourceFile);
    function searchNode(node) {
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
                if (right) {
                    importTargets.forEach((target) => {
                        let re = new RegExp("^(.*/)*" + target + "$");
                        let alias = null;
                        if (right.search(re) >= 0) {
                            let importClause = importNode.importClause; // type: ImportClause
                            // ImportClause optionally has .name or .namedBindings properties
                            if (importClause.name) { // type: Identifier
                                saveAlias(importClause.name.text, right);
                            }
                            else if (importClause.namedBindings) { // type: NamedImportBindings
                                // NamedImportBindings = NamedspaceImport | NamedImports
                                if (importClause.namedBindings.name) {
                                    saveAlias(importClause.namedBindings.name.text, right);
                                }
                                else if (importClause.namedBindings.elements) {
                                    importClause.namedBindings.elements.forEach((element) => {
                                        saveAlias(element.name.text, right);
                                    });
                                }
                            }
                        }
                    });
                }
                break;
            case ts.SyntaxKind.ImportEqualsDeclaration:
                // import GenRes2 = require("GeneralResources");
                // <ImportEqualsDeclaration>node.name.text == "GenRes2"
                //
                // import Decimals = MyNS.Numbers.Decimal;
                // <ImportEqualsDeclaration>node.moduleReference.getText() === "MyNS.Numbers.Decimal"
                // <ImportEqualsDeclaration>node.name.text === <left hand side>
                let importEqualsNode = node, modRef = importEqualsNode.moduleReference, // type: ModuleReference
                isQualified = false;
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
                    isQualified = true;
                }
                if (right) {
                    importTargets.forEach((target) => {
                        let re = isQualified ? new RegExp("^ " + target + "(\\\..*)*$") : new RegExp("^(.*/)*" + target + "$");
                        let alias = null;
                        if (right && right.search(re) >= 0) {
                            saveAlias(importEqualsNode.name.text, right);
                        }
                    });
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
        function saveAlias(left, right) {
            alias = new Alias(left, right);
            let found = aliases.some((item) => item.equals(alias));
            if (!found) {
                aliases.push(alias);
            }
        }
    }
    function report(node, message) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
    return aliases;
}
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