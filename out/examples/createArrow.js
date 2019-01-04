"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const util_1 = require("../util");
const lit = ts.createArrowFunction([], [], [
    ts.createParameter([], [], null, 'x', null, ts.createTypeReferenceNode('number', []))
], null, null, ts.createLiteral(42));
util_1.printNode(lit);
//# sourceMappingURL=createArrow.js.map