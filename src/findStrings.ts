import { readFileSync } from "fs";
import * as ts from "typescript";

export function findStrings(sourceFile: ts.SourceFile) {
  let alias = [];
  let strings = [];
  searchNode(sourceFile);

  function searchNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
        let text = (<ts.ImportDeclaration>node).moduleSpecifier.getText();
        if (text.endsWith("GeneralResources")) {
          // import { GenRes } from "GeneralResources";
          // node.importClause.namedBindings.elements.ImportSpecifier.Identifier.text == "GenRes"

          // import GenRes from "GeneralResources";
          // node.importClause.name.text == "GenRes"

          // import * as Resources from "GeneralResources";
          // node.importClause.namedBindings.name.text == "Resources"

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
          
        }
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
        if ((<ts.IterationStatement>node).statement.kind !== ts.SyntaxKind.Block) {
          report(
            node,
            "A looping statement's contents should be wrapped in a block body."
          );
        }
        break;

      case ts.SyntaxKind.IfStatement:
        let ifStatement = <ts.IfStatement>node;
        if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
          report(
            ifStatement.thenStatement,
            "An if statement's contents should be wrapped in a block body."
          );
        }
        if (
          ifStatement.elseStatement &&
          ifStatement.elseStatement.kind !== ts.SyntaxKind.Block &&
          ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement
        ) {
          report(
            ifStatement.elseStatement,
            "An else statement's contents should be wrapped in a block body."
          );
        }
        break;

      case ts.SyntaxKind.BinaryExpression:
        let op = (<ts.BinaryExpression>node).operatorToken.kind;
        if (
          op === ts.SyntaxKind.EqualsEqualsToken ||
          op == ts.SyntaxKind.ExclamationEqualsToken
        ) {
          report(node, "Use '===' and '!=='.");
        }
        break;
    }

    ts.forEachChild(node, searchNode);
  }

  function report(node: ts.Node, message: string) {
    let { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    console.log(
      `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`
    );
  }
}

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
  // Parse a file
  let sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );

  // delint it
  delint(sourceFile);
});