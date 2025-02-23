import express from 'express';
import { model } from '../config/ai.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post('/', async (req, res) => {
    try {
        console.log('Received analyze request:', req.body);
        const { patientInfo, symptoms } = req.body;

        // Validate request body
        if (!patientInfo || typeof patientInfo !== 'object') {
            console.log('Invalid patient info object:', patientInfo);
            return res.status(400).json({
                message: 'Invalid input. Please provide patient information.',
                received: { patientInfo, symptoms }
            });
        }

        // Validate required fields
        const { name, age, gender } = patientInfo;
        if (!name || !age || !gender) {
            console.log('Missing required fields:', { name, age, gender });
            return res.status(400).json({
                message: 'Invalid input. Please provide name, age, gender, and at least one symptom.',
                received: { name, age, gender, symptoms }
            });
        }

        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
            console.log('Invalid age:', age);
            return res.status(400).json({
                message: 'Invalid age. Please provide a valid age between 0 and 150.',
                received: { age }
            });
        }

        // Validate gender
        if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
            console.log('Invalid gender:', gender);
            return res.status(400).json({
                message: 'Invalid gender. Please select male, female, or other.',
                received: { gender }
            });
        }

        // Validate symptoms
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            console.log('Invalid symptoms:', symptoms);
            return res.status(400).json({
                message: 'Please provide at least one symptom.',
                received: { symptoms }
            });
        }

        // Format symptoms for better readability
        const formattedSymptoms = symptoms.map((symptom, index) => `${index + 1}. ${symptom}`).join('\n');

        // Create the prompt for the AI
        const prompt = `Analyze the following symptoms and provide a detailed medical analysis:

Patient Information:
Name: ${name}
Age: ${ageNum}
Gender: ${gender}

Symptoms:
${formattedSymptoms}

Please provide a structured analysis with the following sections:

**1. Possible Conditions**
List potential medical conditions that match these symptoms, ordered by likelihood.

**2. Recommended Actions**
Provide specific recommendations, including:
* When to seek medical attention
* Home care suggestions
* Lifestyle modifications

**3. Urgency Level**
Rate the urgency level (Low/Medium/High) and explain why.

IMPORTANT: Keep the exact section headers with ** and numbers as shown above. Each item must start with an asterisk (*). For conditions, provide detailed explanations after the hyphen (-) that relate to the patient's specific symptoms.`;

        console.log('Sending prompt to AI:', prompt);

        // Get response from Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Received AI response:', text);

        // Parse the response into sections
        const sections = {
            conditions: parseSection(text, "**1. Possible Conditions**", "**2. Recommended Actions**"),
            recommendations: parseSection(text, "**2. Recommended Actions**", "**3. Urgency Level**"),
            urgency: parseSection(text, "**3. Urgency Level**", null)
        };

        console.log('Parsed sections:', sections);

        res.json({
            analysis: sections,
            rawResponse: text
        });
    } catch (error) {
        console.error('Error in analyze route:', error);
        res.status(500).json({
            message: 'Failed to analyze symptoms',
            error: error.message
        });
    }
});

// Helper function to parse sections from the AI response
function parseSection(text, startMarker, endMarker) {
    let start = text.indexOf(startMarker);
    if (start === -1) return '';
    
    start += startMarker.length;
    let end = endMarker ? text.indexOf(endMarker, start) : text.length;
    if (end === -1) end = text.length;
    
    return text.substring(start, end).trim();
}

export default router;
