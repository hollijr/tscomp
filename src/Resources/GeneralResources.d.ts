declare namespace CN.CR.GenRes {
  
  const GenRes1: {
    readonly VirtualNetwork: {
      readonly Subnets: "111.111.111.111"
    }
    readonly words: string;
    readonly moreWords: string;
    readonly mostWords: string;
  }

  const words:{ delete: "a", update: "b" };
  const moreWords: { delete: "a", update: "b" };
  const mostWords: { delete: "a", update: "b" };

  const GenRes2: {
    readonly VirtualNetwork: {
      readonly Subnets: "111.111.111.111"
    }
    readonly words: string;
    readonly moreWords: string;
    readonly mostWords: string;
  }

}
declare module "ClassicNetwork/ClientResources/GeneralResources" {
  export = CN.CR.GenRes;
}