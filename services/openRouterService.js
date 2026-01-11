import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY, // Use env for security
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5000", // Required by OpenRouter for ranking
        "X-Title": "JobTracker AI",
    }
});

async function extractWithOpenRouter(pageTextSnippet) {
    const OpenRouterPrompt = [
        {
            role: "system",
            content: `You are a High-Fidelity Data Transcriber. Extract job details into JSON.
    RULES:
    1. jobTitle: Exact official title.
    2. companyName: Full legal name.
    3. jobLocation: "City, Country" format. If "Nationwide" with a base, use the base.
    4. jobDescription: VERBATIM transcription. DO NOT summarize. Include responsibilities and requirements. Filter out word or semtence that is not a Job Description.`
        },
        {
            role: "user",
            content: `TEXT TO TRANSCRIBE:\n${pageTextSnippet}`
        },
        {
            role: "assistant",
            content: "{" // Prefilling the JSON start helps force the format
        }
    ];

    try {
        const response = await openrouter.chat.send({
            model: "xiaomi/mimo-v2-flash:free",
            messages: OpenRouterPrompt,
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 6000,
        });

        
        let rawContent = response.choices[0].message.content;
        
        const jsonString = rawContent.replace(/```json|```/g, "").trim();

        
        if (!jsonString.startsWith("{")) {
            jsonString = "{" + jsonString;
        }
        
        if (!jsonString.trim().endsWith("}")) {
            jsonString += "}";
        }
        
        return jsonString;
    } catch (err) {
        console.error("OpenRouter API Error:", apiError.message);
        throw new Error(`Extraction failed: ${apiError.message}`);
    }
    
}

async function generateEmailWithAI(prompt) {
    try {
        const response = await openrouter.chat.send({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert career coach. Your task is to write high-converting networking emails. If the input is not a job description, you must respond with INVALID_JOB."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7, // Higher temperature for more natural writing
            max_tokens: 1000,
        });

        return response.choices[0].message.content;
    } catch (err) {
        console.error("OpenRouter Email Error:", err.message);
        throw new Error(`Email generation failed: ${err.message}`);
    }
}

export default { extractWithOpenRouter, generateEmailWithAI };