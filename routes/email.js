import { Router } from "express";
import authenticate from "../authMiddleware.js";
import openRouterService from "../services/openRouterService.js";
import Resume from "../models/Resume.js"; 

const router = Router();
const { generateEmailWithAI } = openRouterService;

router.post("/generate-email", authenticate, async (req, res) => {
    console.log('[Email Service] Generating email')
    try {
        const { pageText, resumeId } = req.body;

        if (!pageText || pageText.length < 200) {
            return res.status(400).json({ 
                success: false, 
                error: "Not enough text found on the page to identify a job." 
            });
        }

        let resumeText = "No resume provided.";
        if (resumeId) {
            const resume = await Resume.findById(resumeId);
            resumeText = resume?.extractedText || "No resume text found.";
        }

    const prompt = `
    You are an expert career assistant. I will provide you with text scraped from a website.
    
    CRITICAL INSTRUCTION:
    The text may contain a list of multiple job search results. 
    1. IGNORE the list of search results at the beginning.
    2. LOCATE the section usually starting with "About the job" or a specific Job Title followed by a long description.
    3. If you find a detailed Job Description (like the one for "Graduate Product Engineer at Intercom"), proceed to write the email.
    4. ONLY respond with "INVALID_JOB" if there is absolutely no detailed job description text present.

    CANDIDATE CV:
    ${resumeText}
    
    WEBSITE TEXT:
    ${pageText.slice(0, 6000)}
    
    OUTPUT:
    - If valid: Write a professional, punchy networking email.
    - If invalid: "INVALID_JOB"
    `;

        // CALL THE NEW SERVICE METHOD
        const aiResponse = await generateEmailWithAI(prompt);

        if (aiResponse.includes("INVALID_JOB")) {
            return res.status(422).json({ 
                success: false, 
                error: "This doesn't look like a job listing page. Please try on a specific job post." 
            });
        }

        res.status(200).json({
            success: true,
            email: aiResponse.trim()
        });

    } catch (error) {
        console.error("Email Gen Error:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

export default router;