"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts = require("typescript");
// using typescript compiler api
function findStrings(sourceFile) {
    // aliases for identifiers that (for now) reference "GeneralResources" objects
    let aliases = [];
    let strings = [];
    let needle = "GeneralResources";
    searchNode(sourceFile);
    report(sourceFile, aliases.toString());
    function searchNode(node) {
        let re = new RegExp("^(.*/)*" + needle + "(/.*)*$");
        let right = "";
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
                        aliases.push({ left: importClause.name.text, right: right });
                    }
                    else if (importClause.namedBindings) { // type: NamedImportBindings
                        // NamedImportBindings = NamedspaceImport | NamedImports
                        if (importClause.namedBindings.name) {
                            aliases.push({ left: importClause.namedBindings.name.text, right: right });
                        }
                        else if (importClause.namedBindings.elements) {
                            importClause.namedBindings.elements.forEach((element) => {
                                aliases.push({ left: element.name.text, right: right });
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
                /* saving in case need individual pieces of qualified name
                else if (ts.isEntityName(modRef) && (<ts.EntityName>modRef).getText) {
                  // EntityName = Identifier | QualifiedName
                  // Identifier.getText() returns the alias
                  // QualifiedName has .right and .left.
                  // .left is either QualifiedName (recursive definition of qualifiers) or Identifier
                  // .right is Identifier (the last part of the qualified name for the current QualifiedName object)
                  //
                  // example:  MyInternalModule.Helpers.MoreHelpers
                  // ModuleReference: QualifiedName = {
                  //  left: QualifiedName = {
                  //    left: Identifier => "MyInternalModule"
                  //    right: Identifier => "Helpers"
                  //  right: Identifier => "MoreHelpers"
                  // }
                  let entName = <ts.EntityName>modRef;
                  if (ts.isQualifiedName(entName)) {
                    
                    text = "";
                    do {
                      text = `${text}.${(<ts.QualifiedName>entName).right.getText()}`;
                      if (text && text.search(/\s/) < 0 && text.endsWith("GeneralResources") && aliases.indexOf(text) < 0) {
                        aliases.push(text);
                      }
                      entName = (<ts.QualifiedName>entName).left;
                    } while (ts.isQualifiedName(entName));
        
                  }
                  if (ts.isIdentifier(entName)) {
                    text = (<ts.Identifier>entName).text;
                  }
        
                  if (text && text.search(/\s/) < 0 && text.endsWith("GeneralResources") && aliases.indexOf(text) < 0) {
                  aliases.push(text);
                }
                */
                if (right && right.search(re) >= 0) {
                    aliases.push({ left: importEqualsNode.name.text, right: right });
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
    function report(node, message) {
        let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
    }
}
exports.findStrings = findStrings;
const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
    // Parse a file
    let sourceFile = ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts.ScriptTarget.ES2015, 
    /*setParentNodes */ true);
    // delint it
    findStrings(sourceFile);
});
//# sourceMappingURL=findStrings.js.map