import { readFileSync } from "fs";
import * as ts from "typescript";
import { test } from "./test";

/**
 * SAMPLE CODE:  type into https://astexplorer.net/ to see types/symbols of nodes
 * set format to JavaScript and typescript OR JavaScript and typescript-eslint-parser
 
import * as Resources from "GeneralResources";
import GenRes from "GeneralResources";
import { GenRes1 } from "GeneralResources";
import GenRes2 = require("ClassicNetwork/ClientResources/GeneralResources");
import Helper from "Helpers.ts";

module MyInternalModule.Helpers.MoreHelpers {
  export class MyClass {

  }
}

import MoreHelpers = MyInternalModule.Helpers.MoreHelpers;
import Helpers = MyInternalModule.Helpers;
import IntMod = MyInternalModule;
import HelpersClass = MyInternalModule.Helpers.MoreHelpers.MyClass;

var x = new Helpers.MyClass();

var SubnetResources = GenRes2.VirtualNetwork.Subnets;

export interface prompts {
  prompt1: string;
  prompt2: string;
}

export class Test {
  public name: string;
	private _prompts: prompts;

  constructor(name: string) {
    this.name = name;
    this._prompts = {
      prompt1: "hi",
      prompt2: "bye"
    };
  }

	public run() {
    let stuff = Resources.words;
    let moreStuff = GenRes.moreWords;
    let mostStuff = GenRes1.mostWords;
    let stuff1 = stuff.delete;
    console.log(moreStuff.update);
    this.pass(this._prompts);
    Helper.prompt(this._prompts);  // trace through separate ASTs?
  }

  private pass(prmpts: prompts) {
    console.log(prmpts.prompt1);
    console.log(prmpts.prompt2);
  }
}

 */
export interface IAlias {
  left: string;
  right: string;
  toString: () => string;
}

 // using typescript compiler api
export function findStrings(sourceFile: ts.SourceFile): IAlias[] {
  let stack = [ "GeneralResources" ];
  let pastStack: string[] = [];
  let aliases: IAlias[] = [];
  let strings: string[] = [];

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

    function toString(): string {
      return `
      left: ${this.left}
      right: ${this.right}`;
    }

    function searchNode(node: ts.Node) {
      let re = new RegExp("^(.*/)*" + needle + "(/.*)*$");
      let right: string = "";
      let alias: IAlias = null;
      switch (node.kind) {
        case ts.SyntaxKind.ImportDeclaration:
          // import GenRes from "GeneralResources";
          // <ImportDeclaration>node.importClause.name.text == "GenRes"

          // import { GenRes } from "GeneralResources";
          // <ImportDeclaration>node.importClause.<NamedImports>namedBindings.elements[].ImportSpecifier.name.text == "GenRes"

          // import * as Resources from "GeneralResources";
          // <ImportDeclaration>node.importClause.<NamespaceImport>namedBindings.name.text == "Resources"

          let importNode = <ts.ImportDeclaration>node;

          // ImportDeclaration.moduleSpecifier is type Expression but should be a StringLiteral (per types.ts).
          // If it is not, it is a grammar error.  So we'll cast it to a StringLiteral so we can 
          // get it's .text property.  If it's not a StringLiteral, this property will be undefined.

          // The import value can begin with, end with or contain the needle between / to 
          right = (<ts.StringLiteral>importNode.moduleSpecifier).text;  
          
          if (right && right.search(re) >= 0) {
            let importClause = importNode.importClause; // type: ImportClause

            // ImportClause optionally has .name or .namedBindings properties
            if (importClause.name) {  // type: Identifier
              alias = { left: importClause.name.text, right: right, toString: toString };
              saveAlias(alias);
            } else if (importClause.namedBindings) {  // type: NamedImportBindings

              // NamedImportBindings = NamedspaceImport | NamedImports
              if ((<ts.NamespaceImport>importClause.namedBindings).name) {
                alias = { left: (<ts.NamespaceImport>importClause.namedBindings).name.text, right: right, toString: toString };
                saveAlias(alias);
              } else if ((<ts.NamedImports>importClause.namedBindings).elements) {
                (<ts.NamedImports>importClause.namedBindings).elements.forEach((element: ts.ImportSpecifier) => {
                  alias = {left: element.name.text, right: right, toString: toString };
                  saveAlias(alias);
                });
              }
            }
          }
          break;

        case ts.SyntaxKind.ImportEqualsDeclaration:
          // import GenRes2 = require("GeneralResources");
          // <ImportEqualsDeclaration>node.name.text == "GenRes2"

          let importEqualsNode = <ts.ImportEqualsDeclaration>node,
              modRef = importEqualsNode.moduleReference; // type: ModuleReference

          // ModuleReference = EntityName (for internal module ref) | ExternalModuleReference (for external)
          if (ts.isExternalModuleReference(modRef) && (<ts.ExternalModuleReference>modRef).expression.kind === ts.SyntaxKind.StringLiteral) {
            let extModRef = <ts.ExternalModuleReference>modRef;
            right = (<ts.StringLiteral>extModRef.expression).text;
          } else if (ts.isEntityName(modRef)) {
            // EntityName = Identifier | QualifiedName 
            // Identifier has .text
            // QualifiedName has .right and .left. 
            //  .left is either QualifiedName (recursive definition of qualifiers) or Identifier
            //  .right is Identifier (the last part of the qualified name for the current QualifiedName object)
            // While QualifiedName is a recursive definition, top-level instance returns complete right-side expression using .getText()
            // Identifier also returns right-side expression using .getText()
            right = (<ts.EntityName>modRef).getText();
            re = new RegExp("^(.*\\\.)*" + needle + "(\\\..*)*$");
          }
          
          /* saving in case we later need individual pieces of qualified name
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

  function saveAlias(alias: IAlias) {
    aliases.push(alias);
    if (pastStack.indexOf(alias.left) === -1) {
      stack.push(alias.left);
    }
  }

  function report(node: ts.Node, message: string) {
    let { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    console.log(
      `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`
    );
  }

  return aliases;
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

  // find strings
  let aliases = findStrings(sourceFile);
  aliases.forEach((alias) => console.log(alias.toString()));
});