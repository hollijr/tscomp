module GenRes {
  
  

  export const words = { delete: "a", update: "b" };
  export const moreWords = { delete: "a", update: "b" };
  export const mostWords = { delete: "a", update: "b" };

  export class GenRes2 {
    public VirtualNetwork = {
      Subnets: "111.111.111.111"
    }
    public words: string = "a";
    public moreWords: string = "ab";
    public mostWords: string = "abc";
  }

}
export default GenRes;

export module GenRes1 {
  export const mostWords: string = "abc";
 
}