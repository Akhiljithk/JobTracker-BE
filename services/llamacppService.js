async function extractWithLlamacpp(pageTextSnippet) {

  const prompt = `<|im_start|>system
  You are a Recruitment Data Specialist. 
  Your goal is to extract EXACT details.
  - Find job title.
  - Company name.
  - jobLocation: Scan the WHOLE text. Look for "City, Country" (e.g., Dublin, Ireland). Ignore "Full-time" or "Hybrid work".
  4. jobDescription: You must provide a VERBATIM transcription. 
     - DO NOT summarize. 
     - DO NOT omit any bullet points. 
     - DO NOT skip the "Your Profile" or "Responsibilities" sections.
     - Include the full text starting from "The Role" until the end of the text.
  Return valid JSON.<|im_end|>
  <|im_start|>user
  TEXT:
  ${pageTextSnippet}<|im_end|>
  <|im_start|>assistant
  {
    "jobTitle": "`;
  
const response = await fetch(process.env.EC2_LLAMACPP_ADDRESS, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: prompt,
    temperature: 0.1,
    n_predict: 2500, 
    repeat_penalty: 1.1,
    grammar: `root ::= "{\\n  \\"jobTitle\\": \\"" [^"\\n]* "\\",\\n  \\"companyName\\": \\"" [^"\\n]* "\\",\\n  \\"jobLocation\\": \\"" [^"\\n]* "\\",\\n  \\"jobDescription\\": \\"" [^"]* "\\"\\n}"`,
    stop: ["<|im_end|>"]
  })
});

  const data = await response.json();
  
  let rawText = data.content;
  
  if (!rawText.trim().endsWith("}")) {
        rawText += "}";
  }
  if (!rawText.trim().startsWith("{")) {
        rawText += "{";
  }

  return rawText
}

export default { extractWithLlamacpp };