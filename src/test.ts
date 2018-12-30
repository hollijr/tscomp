export function test() {
  let x = [1,2,3,4,5];

  for (let i = 0; i < x.length; i++) 
    console.log("counting " + x[i]);

  if (x[0] === 1) console.log(true);
}