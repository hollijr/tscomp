module MyHelper {
  export interface Contract {
    prompt: (msg: prompts) => void;
  }
  export const MyHelp : Contract = {
    prompt: (msg: prompts) => {
      console.log(msg.prompt1);
      console.log(msg.prompt2);
    }
  }
  export interface prompts {
    prompt1: string;
    prompt2: string;
  }
}
export default MyHelper;