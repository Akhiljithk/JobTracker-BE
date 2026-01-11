const { NlpManager } = require('node-nlp');
const { rawText } = require('./data-sets');

// We don't need to specify languages if we are loading a model
const manager = new NlpManager();

async function parseJobPost(text) {
    // Load the pre-trained model
    manager.load('./model.nlp');

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = { title: null, description: [] };

    for (const line of lines) {
        const analysis = await manager.process('en', line);
        
        // Use a high threshold for titles to avoid false positives
        if (analysis.intent === 'job_title' && analysis.score > 0.8) {
            if (!result.title) result.title = line;
        } 
        else if (analysis.intent === 'job_description') {
            result.description.push(line);
        }
    }
    return result;
}

// Execution
(async () => {
    const data = await parseJobPost('Software Engineer Graduate 2025/2026');
    console.log("Extracted Result:", data);
})();