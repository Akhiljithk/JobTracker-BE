async function testAI() {
  console.log("Connecting to local AI server...");
  
  try {
  

    const formattedPrompt = `<|im_start|>user
what model are you?<|im_end|>
<|im_start|>assistant`;

    const response = await fetch("http://54.196.148.252:8080/completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: formattedPrompt,
        n_predict: 100,
        temperature: 0.1, // Low temperature is better for extraction/testing
        stop: ["<|im_end|>", "<|im_start|>"] // Tell the AI when to stop talking
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(data)
    // llama.cpp returns the text in the 'content' field
    console.log("--- AI Response ---");
    console.log(data.content.trim());
    console.log("-------------------");

  } catch (error) {
    console.error("Test failed!");
    console.error("Error details:", error.message);
    console.log("\nTip: Make sure your llama-server is running on port 8080.");
  }
}

testAI();