import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('📦 Connected to MongoDB');
    console.log('Database connection string:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password in logs
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // In development, allow all origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Import routes
import authRoutes from './routes/auth.js';
import analyzeRoutes from './routes/analyze.js';
import searchHistoryRoutes from './routes/searchHistory.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/search-history', searchHistoryRoutes);

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('✅ GEMINI_API_KEY found');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test endpoint to verify AI connection
app.get('/api/test-ai', async (req, res) => {
  try {
    console.log('🔍 Testing AI connection...');
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = await response.text();
    res.json({ status: 'ok', message: 'AI connection successful', response: text });
  } catch (error) {
    console.error('❌ AI connection test failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'AI connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test the API connection on startup
(async () => {
  try {
    console.log('🔍 Testing API connection...');
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = await response.text();
    if (text) {
      console.log('✅ API connection successful');
    }
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    process.exit(1);
  }
})();

// API Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { name, age, gender, symptoms } = req.body;

    // Validate input
    if (!name || !age || !gender || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      console.log('❌ Invalid input:', { name, age, gender, symptoms });
      return res.status(400).json({
        error: 'Invalid input. Please provide name, age, gender, and at least one symptom.'
      });
    }

    console.log('📝 Starting analysis for:', { name, age, gender, symptoms });
    
    const prompt = `You are a medical professional analyzing symptoms. For each possible condition, provide a detailed explanation of what it is, its common symptoms, and why it might match the patient's symptoms. Follow this EXACT format:

Patient Information:
Name: ${name}
Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms.join(', ')}

**1. Possible Conditions**
* Viral Pharyngitis - An infection of the throat caused by viruses. Common symptoms include sore throat, difficulty swallowing, and mild fever. Given the patient's symptoms of ${symptoms.join(' and ')}, this could be a likely cause.
* Strep Throat - A bacterial throat infection caused by Streptococcus bacteria. Characterized by severe throat pain, high fever, and swollen tonsils. The presence of ${symptoms.join(' and ')} suggests this possibility.
* Common Cold - A viral upper respiratory infection affecting the nose and throat. Typical symptoms include runny nose, sneezing, and mild sore throat. The combination of ${symptoms.join(' and ')} is consistent with this condition.
(List 3-5 conditions with detailed explanations, each on a new line starting with *)

**2. Recommended Actions**
* Gargle with warm salt water
* Get plenty of rest
* Stay hydrated
(List specific actions, each on a new line starting with *)

**3. Urgency Level**
* Non-urgent - Can be managed at home with self-care

**4. General Advice**
* Avoid cold drinks
* Use throat lozenges
* Monitor temperature
(List practical advice, each on a new line starting with *)

IMPORTANT: Keep the exact section headers with ** and numbers as shown above. Each item must start with an asterisk (*). For conditions, provide detailed explanations after the hyphen (-) that relate to the patient's specific symptoms.`;

    console.log('🤖 Sending prompt to AI...');
    console.log('📋 Prompt:', prompt);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    });

    console.log('✅ Received result from AI:', result);

    if (!result.response) {
      console.error('❌ No response from AI');
      throw new Error('No response from AI. Please try again.');
    }

    const response = result.response;
    console.log('📦 Response object:', response);

    const text = response.text();
    console.log('📝 Raw AI Response:', text);
    console.log('📊 Response length:', text?.length);

    if (!text || text.trim().length === 0) {
      console.error('❌ Empty response from AI');
      throw new Error('No analysis generated. Please try again.');
    }

    // Log the presence of section markers
    console.log('🔍 Checking for section markers:');
    console.log('Raw text:', text);
    console.log('Conditions section present:', text.includes('**1. Possible Conditions**'));
    console.log('Actions section present:', text.includes('**2. Recommended Actions**'));
    console.log('Urgency section present:', text.includes('**3. Urgency Level**'));
    console.log('Advice section present:', text.includes('**4. General Advice**'));

    // Parse the response into structured data
    const parseSection = (sectionTitle, nextSectionTitle) => {
      console.log(`\n🔍 Parsing section: ${sectionTitle}`);
      
      // Find the section start
      const startIndex = text.indexOf(sectionTitle);
      if (startIndex === -1) {
        console.log(`❌ Section "${sectionTitle}" not found in text`);
        return [];
      }
      
      // Get content after the title
      const contentStart = startIndex + sectionTitle.length;
      
      // Find the end of this section
      let endIndex;
      if (nextSectionTitle) {
        endIndex = text.indexOf(nextSectionTitle, contentStart);
        if (endIndex === -1) {
          console.log(`⚠️ Next section "${nextSectionTitle}" not found, using end of text`);
          endIndex = text.length;
        }
      } else {
        endIndex = text.length;
      }
      
      // Extract the section content
      const sectionText = text.substring(contentStart, endIndex).trim();
      console.log('📄 Section text:', sectionText);
      
      // Split into lines and process each line
      const items = sectionText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('*'))
        .map(line => {
          // Remove the asterisk and trim
          const content = line.substring(1).trim();
          
          // For conditions section, keep everything after the hyphen
          if (sectionTitle === '**1. Possible Conditions**') {
            return content;
          }
          
          return content;
        })
        .filter(line => line.length > 0);
      
      console.log('✅ Parsed items:', items);
      return items;
    };

    // Parse each section
    const sections = {
      conditions: parseSection('**1. Possible Conditions**', '**2. Recommended Actions**'),
      recommendations: parseSection('**2. Recommended Actions**', '**3. Urgency Level**'),
      urgency: parseSection('**3. Urgency Level**', '**4. General Advice**'),
      advice: parseSection('**4. General Advice**', null)
    };

    // Validate parsed sections
    console.log('📊 Parsed sections:', sections);

    // Ensure we have content in required sections
    const requiredSections = ['conditions', 'recommendations', 'urgency', 'advice'];
    const missingSections = requiredSections.filter(section => !sections[section] || sections[section].length === 0);

    if (missingSections.length > 0) {
      console.error('❌ Missing content in sections:', missingSections);
      throw new Error(`Missing content in sections: ${missingSections.join(', ')}. Please try again.`);
    }

    const structuredData = {
      conditions: sections.conditions,
      recommendations: sections.recommendations,
      urgency: sections.urgency[0] || 'Not specified',
      advice: sections.advice
    };

    console.log('📊 Final structured data:', structuredData);
    res.json(structuredData);
  } catch (error) {
    console.error('❌ Error in /api/analyze:', error);
    
    // Handle specific error types
    if (error.message.includes('timeout')) {
      res.status(504).json({
        error: 'The analysis is taking too long. Please try again.',
        details: error.message
      });
    } else if (error.message.includes('API key')) {
      res.status(500).json({
        error: 'API configuration error. Please check your API key.',
        details: 'Invalid or missing API key'
      });
    } else if (error.message.includes('PERMISSION_DENIED')) {
      res.status(403).json({
        error: 'API access denied. Please check your API key permissions.',
        details: error.message
      });
    } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({
        error: 'API quota exceeded. Please try again later.',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'An error occurred while analyzing symptoms. Please try again.',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log(`🔑 JWT Secret is ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
});
