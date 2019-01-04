"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GenRes;
(function (GenRes) {
    class GenRes1 {
        constructor() {
            this.VirtualNetwork = {
                Subnets: "111.111.111.111"
            };
            this.words = "a";
            this.moreWords = "ab";
            this.mostWords = "abc";
        }
    }
    GenRes.GenRes1 = GenRes1;
    GenRes.words = { delete: "a", update: "b" };
    GenRes.moreWords = { delete: "a", update: "b" };
    GenRes.mostWords = { delete: "a", update: "b" };
    class GenRes2 {
        constructor() {
            this.VirtualNetwork = {
                Subnets: "111.111.111.111"
            };
            this.words = "a";
            this.moreWords = "ab";
            this.mostWords = "abc";
        }
    }
    GenRes.GenRes2 = GenRes2;
})(GenRes || (GenRes = {}));
exports.default = GenRes;
//# sourceMappingURL=GeneralResources.js.map