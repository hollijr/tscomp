import { readFileSync } from "fs";
import * as ts from "typescript";

/**
 * SAMPLE CODE:  type into https://astexplorer.net/ to see types/symbols of nodes
 * set format to JavaScript and typescript OR JavaScript and typescript-eslint-parser
 
import * as Resources from "GeneralResources";
import GenRes from "GeneralResources";
import { GenRes1 } from "GeneralResources";
import GenRes2 = require("ClassicNetwork/ClientResources/GeneralResources");

var SubnetResources = GenRes2.VirtualNetwork.Subnets;

export interface prompts {
  prompt1: string;
  prompt2: string;
}

export class Test {
    public name: string;

    constructor(name: string) {
        this.name = name;

    }

	public run() {
    	let stuff = Resources.words;
      	let moreStuff = GenRes.moreWords;
      	let mostStuff = GenRes1.mostWords;
        let stuff1 = stuff.delete;
      	console.log(moreStuff.update);
      	
    }

	private pass(prmpts: prompts) {
    	console.log(prmpts.prompt1);
      	console.log(prmpts.prompt2);
    }
}
 */

export function findStrings(sourceFile: ts.SourceFile) {
  let aliases: String[] = [];
  let strings: String[] = [];
  searchNode(sourceFile);

  // using typescript compiler api
  function searchNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
        // import GenRes from "GeneralResources";
        // <ImportDeclaration>node.importClause.name.text == "GenRes"

        // import { GenRes } from "GeneralResources";
        // <ImportDeclaration>node.importClause.<NamedImports>namedBindings.elements[].ImportSpecifier.name.text == "GenRes"

        // import * as Resources from "GeneralResources";
        // <ImportDeclaration>node.importClause.<NamespaceImport>namedBindings.name.text == "Resources"


        let importNode = <ts.ImportDeclaration>node,
            text = (<ts.ImportDeclaration>node).moduleSpecifier.getText();
        if (text.endsWith("GeneralResources")) {
          let importClause = importNode.importClause;
          if (importClause.name) {
            aliases.push(importClause.name.getText());
          } else if (importClause.namedBindings) {
            if ((<ts.NamespaceImport>importClause.namedBindings).name) {
              aliases.push((<ts.NamespaceImport>importClause.namedBindings).name.getText());
            } else {
              (<ts.NamedImports>importClause.namedBindings).elements.forEach((element: ts.ImportSpecifier) => aliases.push(element.name.getText()));
            }
          }
        }
        break;

      // import GenRes2 = require("GeneralResources");
      // <ImportEqualsDeclaration>node.name.text == "GenRes2"
      case ts.SyntaxKind.ImportEqualsDeclaration

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
      case ts.SyntaxKind.VariableDeclaration:
        let flag = node.flags;
      case ts.SyntaxKind.ExpressionStatement:
      case ts.SyntaxKind.PropertyAccessExpression:
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
  findStrings(sourceFile);
});