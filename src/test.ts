import * as Resources from "./Resources/res/GeneralResources";
import * as Resources1 from "./Resources/GeneralResources";
import GenRes from "./Resources/GeneralResources";
import { GenRes1 } from "./Resources/res/res/GeneralResources";
import GenRes2 = require("./Resources/res/GeneralResources");
import GenRes3 = require("./Resources/GeneralResources");
import MyHelper from "./Resources/Helpers";

module MyInternalModule.Helpers.MoreHelpers {
  export class MyClass {

  }
}

import MoreHelpers = MyInternalModule.Helpers.MoreHelpers;
import Helpers = MyInternalModule.Helpers;
import IntMod = MyInternalModule;
import HelpersClass = MyInternalModule.Helpers.MoreHelpers.MyClass;

var x = new Helpers.MoreHelpers.MyClass();

var SubnetResources = GenRes2.default.moreWords.delete;

export interface prompts {
  prompt1: string;
  prompt2: string;
}

export class Test {
  public name: string;
	private _prompts: prompts;

  constructor(name: string) {
    this.name = name;
    this._prompts = {
      prompt1: "hi",
      prompt2: "bye"
    };
  }

  public run() {
    let stuff = Resources.default.words;
    let moreStuff = GenRes;
    let mostStuff = GenRes1.mostWords;
    let stuff1 = stuff.delete;
    console.log(moreStuff.moreWords.update);
    this.pass(this._prompts);
    MyHelper.MyHelp.prompt(this._prompts);  // trace through separate ASTs?
  }

  private pass(prmpts: prompts) {
    console.log(prmpts.prompt1);
    console.log(prmpts.prompt2);
  }
}

export function test() {
  let x = [1,2,3,4,5];

  for (let i = 0; i < x.length; i++) 
    console.log("counting " + x[i]);

  if (x[0] === 1) console.log(true);
}