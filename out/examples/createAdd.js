"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const util_1 = require("../util");
const lit = ts.createAdd(ts.createLiteral(42), ts.createLiteral("foo"));
util_1.printNode(lit);
//# sourceMappingURL=createAdd.js.map