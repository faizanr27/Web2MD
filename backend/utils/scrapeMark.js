import { chunkText } from "./chunk.js";
import generateMarkdown from "./markd.js";

export async function Mark(data){
  let markdown = ''
  try {
    const res = chunkText(data)

    for(const chunk of res ) {
      console.log("serving chunk of size ",new TextEncoder().encode(chunk).length)
      console.log(typeof chunk)
       markdown += await generateMarkdown(chunk);
    }
    return markdown
  } catch (error) {
    console.log(error)
  }
}


