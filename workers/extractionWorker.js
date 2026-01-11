// import { Worker } from 'bullmq';
// import Job from '../models/Job.js';
// import { performance } from 'perf_hooks';
// import safeJsonParse from "../utils/safeJsonParse.js";
// import validateJob from "../utils/validateJob.js";
// import llamacppService from "../services/llamacppService.js";
// import openRouterService from "../services/openRouterService.js";

// const { extractWithOpenRouter } = openRouterService;
// const { extractWithLlamacpp } = llamacppService;

// const worker = new Worker('extractionQueue', async (bullJob) => {
//   const { jobId, pageText } = bullJob.data;
//   const startTime = performance.now();
  
//   try {
//     let rawResponse;
//     let provider = "OpenRouter";

//     // Attempt AI Extraction
//     try {
//       rawResponse = await openRouterService.extract(pageText);
//     } catch (e) {
//       provider = "EC2-Llama";
//       rawResponse = await llamacppService.extract(pageText);
//     }

//     const data = JSON.parse(rawResponse);
//     const duration = ((performance.now() - startTime) / 1000).toFixed(2);

//     // Success Update
//     await Job.findByIdAndUpdate(jobId, {
//       ...data,
//       status: "Saved",
//       aiMetadata: { provider, extractionTime: parseFloat(duration) }
//     });

//   } catch (error) {
//     // Failure Update - Don't leave the user hanging!
//     await Job.findByIdAndUpdate(jobId, {
//       status: "Failed",
//       aiMetadata: { error: error.message }
//     });
//     console.error(`Job ${jobId} failed:`, error.message);
//   }
// }, { 
//   connection: redisConnection,
//   concurrency: 2 // Crucial for t3.small so it only does one AI task at a time
// });