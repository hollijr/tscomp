"use strict";
exports.__esModule = true;
var GenRes;
(function (GenRes) {
    GenRes.words = { "delete": "a", update: "b" };
    GenRes.moreWords = { "delete": "a", update: "b" };
    GenRes.mostWords = { "delete": "a", update: "b" };
    var GenRes2 = (function () {
        function GenRes2() {
            this.VirtualNetwork = {
                Subnets: "111.111.111.111"
            };
            this.words = "a";
            this.moreWords = "ab";
            this.mostWords = "abc";
        }
        return GenRes2;
    }());
    GenRes.GenRes2 = GenRes2;
})(GenRes || (GenRes = {}));
exports["default"] = GenRes;
var GenRes1;
(function (GenRes1) {
    GenRes1.mostWords = "abc";
})(GenRes1 = exports.GenRes1 || (exports.GenRes1 = {}));
