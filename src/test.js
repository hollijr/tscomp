"use strict";
exports.__esModule = true;
var Resources = require("./res/GeneralResources");
var GeneralResources_1 = require("./GeneralResources");
var GeneralResources_2 = require("./res/res/GeneralResources");
var GenRes2 = require("./res/GeneralResources");
var Helpers_1 = require("./Helpers");
var MyInternalModule;
(function (MyInternalModule) {
    var Helpers;
    (function (Helpers) {
        var MoreHelpers;
        (function (MoreHelpers) {
            var MyClass = (function () {
                function MyClass() {
                }
                return MyClass;
            }());
            MoreHelpers.MyClass = MyClass;
        })(MoreHelpers = Helpers.MoreHelpers || (Helpers.MoreHelpers = {}));
    })(Helpers = MyInternalModule.Helpers || (MyInternalModule.Helpers = {}));
})(MyInternalModule || (MyInternalModule = {}));
var Helpers = MyInternalModule.Helpers;
var x = new Helpers.MoreHelpers.MyClass();
var SubnetResources = GenRes2["default"].moreWords["delete"];
var Test = (function () {
    function Test(name) {
        this.name = name;
        this._prompts = {
            prompt1: "hi",
            prompt2: "bye"
        };
    }
    Test.prototype.run = function () {
        var stuff = Resources["default"].words;
        var moreStuff = GeneralResources_1["default"];
        var mostStuff = GeneralResources_2.GenRes1.mostWords;
        var stuff1 = stuff["delete"];
        console.log(moreStuff.moreWords.update);
        this.pass(this._prompts);
        Helpers_1["default"].MyHelp.prompt(this._prompts); // trace through separate ASTs?
    };
    Test.prototype.pass = function (prmpts) {
        console.log(prmpts.prompt1);
        console.log(prmpts.prompt2);
    };
    return Test;
}());
exports.Test = Test;
function test() {
    var x = [1, 2, 3, 4, 5];
    for (var i = 0; i < x.length; i++)
        console.log("counting " + x[i]);
    if (x[0] === 1)
        console.log(true);
}
exports.test = test;
