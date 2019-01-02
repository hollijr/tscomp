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
- git init
- npm install
    
Run a file:
- tsc <filename>.ts
    
    -> compiles .ts to .js and creates AST for source file
    
- node <filename>.js

findStrings.ts is WIP that uses the TypeScript compiler API to find all strings that originate from an imported resource.

Use https://astexplorer.net/ set to "JavaScript" and "typescript" to see TypeScript's AST for a code sample.
Alternatively, select "typescript-eslint-parser" instead of "typescript" to see objects and properties of the AST.
- Refer to https://github.com/eslint/typescript-eslint-parser

