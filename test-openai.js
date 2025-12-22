require("dotenv").config(); 
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: "Say hello in one sentence"
  });

  console.log(response.output_text);
}

test();
