import fs from 'fs/promises'
import generateMarkdown from './markd.js';


export function chunkText(text, maxBytes = 9000) {
    console.log("called chunk")
  // Input validation
  if (!text || typeof text !== 'string') {
      throw new Error('Input must be a non-empty string');
  }

  const chunks = [];
  let currentChunk = "";
  let currentSize = 0;

  // Split text into words and filter out empty strings
  const words = text.split(" ").filter(Boolean);

  for (const word of words) {
      const wordSize = Buffer.byteLength(word, "utf8");
      const spaceSize = currentChunk ? 1 : 0; // Account for space before the word

      if (currentSize + wordSize + spaceSize > maxBytes) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
          currentSize = wordSize;
      } else {
          currentChunk += (currentChunk ? " " : "") + word;
          currentSize += wordSize + spaceSize;
      }
  }

  if (currentChunk) {
      chunks.push(currentChunk.trim());
  }

  // Validate output
  if (chunks.length === 0) {
      throw new Error('No chunks were generated');
  }
  console.log("chunked complete")

  return chunks;
}


// let r = await fs.readFile('mark.txt',{ encoding: 'utf8' })



// const result = chunkText(r)
// console.log(result.length)
// let text = ''
// for (const chunk of result) {
//   const sizeInBytes = new TextEncoder().encode(chunk).length;
//   setTimeout(()=> console.log(sizeInBytes), 2000)

//   // console.log(chunk)
//   const res = await generateMarkdown(chunk)
//   console.log(res)
//   text += res
// }
// await fs.writeFile('test.txt', text)
// console.log(new TextEncoder().encode(text).length)
