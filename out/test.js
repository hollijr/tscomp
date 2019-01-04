"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resources = require("./res/GeneralResources");
const GeneralResources_1 = require("./GeneralResources");
const GeneralResources_2 = require("./res/res/GeneralResources");
const GenRes2 = require("./res/GeneralResources");
const Helpers_1 = require("./Helpers");
var MyInternalModule;
(function (MyInternalModule) {
    var Helpers;
    (function (Helpers) {
        var MoreHelpers;
        (function (MoreHelpers) {
            class MyClass {
            }
            MoreHelpers.MyClass = MyClass;
        })(MoreHelpers = Helpers.MoreHelpers || (Helpers.MoreHelpers = {}));
    })(Helpers = MyInternalModule.Helpers || (MyInternalModule.Helpers = {}));
})(MyInternalModule || (MyInternalModule = {}));
var Helpers = MyInternalModule.Helpers;
var x = new Helpers.MoreHelpers.MyClass();
var SubnetResources = GenRes2.default.moreWords.delete;
class Test {
    constructor(name) {
        this.name = name;
        this._prompts = {
            prompt1: "hi",
            prompt2: "bye"
        };
    }
    run() {
        let stuff = Resources.default.words;
        let moreStuff = GeneralResources_1.default;
        let mostStuff = GeneralResources_2.GenRes1.mostWords;
        let stuff1 = stuff.delete;
        console.log(moreStuff.moreWords.update);
        this.pass(this._prompts);
        Helpers_1.default.MyHelp.prompt(this._prompts); // trace through separate ASTs?
    }
    pass(prmpts) {
        console.log(prmpts.prompt1);
        console.log(prmpts.prompt2);
    }
}
exports.Test = Test;
function test() {
    let x = [1, 2, 3, 4, 5];
    for (let i = 0; i < x.length; i++)
        console.log("counting " + x[i]);
    if (x[0] === 1)
        console.log(true);
}
exports.test = test;
//# sourceMappingURL=test.js.map