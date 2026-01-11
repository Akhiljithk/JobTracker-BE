import { Worker } from 'bullmq';
import Job from '../models/Job.js';
import { performance } from 'perf_hooks';
import safeJsonParse from "../utils/safeJsonParse.js";
import validateJob from "../utils/validateJob.js";
import llamacppService from "../services/llamacppService.js";
import openRouterService from "../services/openRouterService.js";
import { redisConnection } from '../services/redisConfig.js';

const { extractWithOpenRouter } = openRouterService;
const { extractWithLlamacpp } = llamacppService;

const worker = new Worker('extractionQueue', async (bullJob) => {
  const { jobId, pageText } = bullJob.data;
  const startTime = performance.now();
  
  try {
      let responseFromAi;
      let provider = "OpenRouter";

    try {
      console.log('[AI Worker] Attempting open router...')
      responseFromAi = await extractWithOpenRouter(pageText);
    } catch (e) {
      try {
        provider = "EC2-Llama";
        console.error("[AI Worker] OpenRouter failed, switching to EC2 Fallback: ", e.message);
        responseFromAi = await extractWithLlamacpp(pageText);
      } catch (e) {
        console.error("[AI Worker] EC2 Fallback also failed:", e.message);
      }
    }

    const parsed = safeJsonParse(responseFromAi);
    const jobData = validateJob(parsed || {});
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Provider: ${provider} | Time: ${duration}s`);
    
    // Success Update
    console.log('[AI Worker] Job Extraction Completed');
    await Job.findByIdAndUpdate(jobId, {
      ...jobData,
      aiProcessingStatus: "Saved",
      aiMetadata: { 
        provider, 
        extractionTime: parseFloat(duration) }
    });

  } catch (error) {
    // Failure Update - Don't leave the user hanging!
    await Job.findByIdAndUpdate(jobId, {
      aiProcessingStatus: "Failed",
      aiMetadata: { error: error.message }
    });
    console.error(`Job ${jobId} failed:`, error.message);
  }
}, { 
  connection: redisConnection,
  concurrency: 1 // Crucial for t3.small so it only does one AI task at a time
});