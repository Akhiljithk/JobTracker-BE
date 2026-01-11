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

        const aiPrompt = `
            DETERMINE IF THIS IS A JOB DESCRIPTION.
            IF NOT, RESPOND ONLY WITH: INVALID_JOB
            IF YES, WRITE A COLD EMAIL TO THE RECRUITER.

            RESUME CONTEXT: ${resumeText.slice(0, 2500)}
            PAGE CONTENT: ${pageText}
        `;

        // CALL THE NEW SERVICE METHOD
        const aiResponse = await generateEmailWithAI(aiPrompt);

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