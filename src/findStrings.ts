import { readFileSync } from "fs";
import * as ts from "typescript";
import { test } from "./test";

/**
 * SAMPLE CODE:  test.ts -- paste into https://astexplorer.net/ to see types/symbols of nodes
 * set format to JavaScript and typescript OR JavaScript and typescript-eslint-parser
 
  This program assumes the resource file will be imported using one of the following formats:
    
    import GeneralResources = require("GeneralResources");
    import * as GeneralResources from "GeneralResources";
    import GeneralResources = require("ClassicNetwork/ClientResources/GeneralResources");  // from V1

    Tests:
    import { GeneralResources } from "../../../StringResources";
    import GeneralResources = StringResources.Microsoft_Portal_Extensions_Network_Client_GeneralResources;

    Note:  PDL files also include references
    Description="{Resource TrafficManager.Browse.description, Module=GeneralResources}">
    Text="{Resource Command.add, Module=ClassicNetwork/ClientResources/GeneralResources}"
    <Lens Name="Connections" Title="{Resource VirtualNetwork.Vpn.Lens.connections, Module=ClassicNetwork/ClientResources/GeneralResources}" >

    Step 1:  find all the imports and store the alias for the import
    Step 2:  find all the variable declarations where the right expression begins with the alias and store the left expression (alias)
      - Note:  multiple equals:   let x = y = GeneralResources.Keywords; is possible but not sure it's used
    Step 3:  find all function/constructor calls that include an alias as a parameter.  

    Report aliases and parameters of type string
*/

interface IAlias {
  left: string;
  right: string;
  toString: () => string;
  equals: (alias: IAlias) => boolean;
}
class Alias implements IAlias {
  public left: string;
  public right: string;
  constructor(left: string, right: string) {
    this.left = left;
    this.right = right;
  }

  public toString() { 
    return `
      left: ${this.left}
      right: ${this.right}`;
  }

  public equals(alias: IAlias) {
    return this.left === alias.left && this.right === alias.right;
  }
}

 // using typescript compiler api
function findStrings(sourceFile: ts.SourceFile): IAlias[] {
  let importTargets = [ "GeneralResources", "StringResources" ];
  let pastTargets: string[] = [];
  let aliases: IAlias[] = [];
  let strings: string[] = [];

  // find aliases for the imported target
  searchNode(sourceFile); 

  function searchNode(node: ts.Node) {
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
        
        if (right) {
          importTargets.forEach((target: string) => {
            let re = new RegExp("^(.*/)*" + target + "$");

            let alias: IAlias = null;

            if (right.search(re) >= 0) {
              let importClause = importNode.importClause; // type: ImportClause
    
              // ImportClause optionally has .name or .namedBindings properties
              if (importClause.name) {  // type: Identifier
                saveAlias(importClause.name.text, right);
              } else if (importClause.namedBindings) {  // type: NamedImportBindings
    
                // NamedImportBindings = NamedspaceImport | NamedImports
                if ((<ts.NamespaceImport>importClause.namedBindings).name) {
                  saveAlias((<ts.NamespaceImport>importClause.namedBindings).name.text, right);
                } else if ((<ts.NamedImports>importClause.namedBindings).elements) {
                  (<ts.NamedImports>importClause.namedBindings).elements.forEach((element: ts.ImportSpecifier) => {
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

        let importEqualsNode = <ts.ImportEqualsDeclaration>node,
            modRef = importEqualsNode.moduleReference, // type: ModuleReference
            isQualified = false;

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
          isQualified = true;
        }

        if (right) {
          importTargets.forEach((target: string) => {
            let re = isQualified ? new RegExp("^ " + target + "(\\\..*)*$"): new RegExp("^(.*/)*" + target + "$");

            let alias: IAlias = null;

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

    function saveAlias(left: string, right: string) {
      alias = new Alias(left, right);
      let found = aliases.some((item: IAlias) => item.equals(alias));
      if (!found) {
        aliases.push(alias);
      }
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