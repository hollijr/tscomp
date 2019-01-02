# tscomp
Tinkering with the TypeScript API

Many samples in this repo come from the project: https://github.com/nwolverson/blog-typescript-api

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

findStrings.ts is WIP to find all strings that originate from an imported resource
