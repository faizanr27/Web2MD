//Prompt to ai to convert the Extracted data into markdown
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = [
   process.env.GEMINI_API_KEY_1,
   process.env.GEMINI_API_KEY_2,
   process.env.GEMINI_API_KEY_3,
   process.env.GEMINI_API_KEY_4
 ];

 let currentIndex = 0;

 function getNextApiKey() {
   const apiKey = apiKeys[currentIndex];
   currentIndex = (currentIndex + 1) % apiKeys.length;
   return apiKey;
 }

function getModel() {
   const apiKey = getNextApiKey();
   const genAI = new GoogleGenerativeAI(`${apiKey}`);
   const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
   return model1
 }

 async function generateResponse(prompt) {
   const model = getModel();
   const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
   });
   return result;
}

// Testing API Key Rotation
// (async () => {
//  for (let i = 1; i <= 10; i++) {
//    console.log(`serving with api key ${apiKeys[currentIndex]}`)
//    const res = await generateResponse("Hello Gemini");
//    console.log(res.text())
//  }
// })();


// const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);
// const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function generateMarkdown(data) {
//   console.log(data)
  const prompt = `You are an AI assistant that converts webpage content into clean, readable markdown while preserving all essential information and links.

1. **Preserve Relevant Content**:
   - Retain all critical data, including text, headings, paragraphs, lists, tables, and structural elements.
   - Do not omit any important information.

2. **No Hallucination**:
   - Do not generate, infer, or add any content. Only include what is explicitly provided in the input.

3. **Filter Out Noise**:
   - Remove unnecessary or irrelevant content such as ads, scripts, or repetitive navigation elements.

4. **Markdown Formatting**:
   - Use proper markdown syntax for headings, lists, code blocks, images, and other elements.
   - Ensure the output is well-structured and easy to read.

5. **HTML Filtering Rule**:
   - Only include HTML elements if they are enclosed within <pre> or <code> tags in the input.
   - Exclude all other standalone HTML elements like <img>, <form>, <iframe>, <div>, <span>, etc., unless they are inside <pre> or <code> tags.
   - Do not add or insert any HTML elements that are not present in the input.

6. **No Notes or Comments**:
   - Do not provide any "Note:" "(Form removed due to rule 5)" or comments when excluding content. Simply exclude it without explanation.

7. **Output Format**:
   - Return only the markdown content. Do not include any additional explanations, metadata, or placeholders.

**Important Reminders**:
- Follow all the rules above **strictly**.
- Do not add any HTML elements unless they are explicitly enclosed in <pre> or <code> tags in the input.
- If you are unsure about excluding something, err on the side of keeping it.

  Input: ${data}
  `;

  try {

   const result = await generateResponse(prompt)
   const content = result?.response?.candidates?.[0]?.content;
   const markdown = content?.parts?.[0]?.text || content?.text || "No summary found";
//   const result = await model1.generateContent(prompt);
//   const content = result?.response?.candidates?.[0]?.content;
//   console.log(content)
//   const markdown = content?.parts?.[0]?.text || content?.text || "No summary found";
  return markdown;
  } catch (error) {
    console.error("AI summarization failed:", error);
    return "Error generating markdown";
  }
}

export default generateMarkdown