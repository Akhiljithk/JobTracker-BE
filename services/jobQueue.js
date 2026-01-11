import { Queue } from 'bullmq';
import { redisConnection } from './redisConfig.js';

// Define the queue once
export const extractionQueue = new Queue('extractionQueue', { 
  connection: redisConnection 
});