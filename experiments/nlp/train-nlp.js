const { NlpManager } = require('node-nlp');
const manager = new NlpManager({
    languages: ['en'],
    nlu: { useNoneFeature: true }
});
const { myDataset } = require('./data-sets');

(async () => {
    console.log('--- Starting Training ---');

    myDataset.forEach(entry => {
        // Label the title
        manager.addDocument('en', entry['Job Title'], 'job_title');
        
        // Label the description lines
        const descriptionLines = entry['Job Description'].split('\n')
            .filter(line => line.trim().length > 10);
            
        descriptionLines.forEach(line => {
            manager.addDocument('en', line, 'job_description');
        });
    });

    await manager.train();
    
    // This saves the "brain" of your model to a file
    manager.save('./model.nlp');
    
    console.log('--- Training Complete! Model saved to model.nlp ---');
})();