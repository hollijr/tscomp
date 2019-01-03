# tscomp
Tinkering with the TypeScript API

Many samples in this repo come from the project: https://github.com/nwolverson/blog-typescript-api
and from this wiki: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

Prereq:
- install node
- install git

Local Setup
- in projects root:
    git clone https://github.com/hollijr/tscomp 
    
- cd tscomp
- npm install
    
Run a file:
- tsc <filename>.ts
    
    -> compiles .ts to .js and creates AST for source file
    
- node <filename>.js

---

__findStrings.ts__ is WIP that uses the TypeScript compiler API to find all strings that originate from an imported resource.
This approach uses the AST that is generated by the tsc command and searches the nodes for references to the imported resource and expressions that use these references.  A look at the compiler's parser.ts and types.ts (https://github.com/Microsoft/TypeScript/tree/master/src/compiler) helps identify the properties that are available on the nodes and how they are populated.

Use https://astexplorer.net/ set to "JavaScript" and "typescript" to see TypeScript's AST for a code sample.
Alternatively, select "typescript-eslint-parser" instead of "typescript" to see objects and properties of the AST.
- Refer to https://github.com/eslint/typescript-eslint-parser for details on alternative option.



