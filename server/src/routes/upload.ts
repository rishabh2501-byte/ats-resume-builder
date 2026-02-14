// Resume Upload and Parsing Routes

import { Router, Request, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { ATSAnalyzer } from '../services/atsAnalyzer';
import { aiService } from '../services/aiService';

// pdf-parse for PDF files
const pdfParse = require('pdf-parse');

const router = Router();
const atsAnalyzer = new ATSAnalyzer();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT are allowed.'));
    }
  },
});

// Parse uploaded resume file
async function parseResumeFile(file: Express.Multer.File): Promise<string> {
  const { mimetype, buffer, originalname } = file;

  console.log('Parsing file:', originalname, 'mimetype:', mimetype);

  // Handle PDF files
  if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
    try {
      const data = await pdfParse(buffer);
      console.log('PDF parsed successfully, text length:', data.text.length);
      return data.text;
    } catch (e: any) {
      console.error('PDF parse error:', e.message);
      // Return a helpful message if PDF parsing fails
      throw new Error('Failed to parse PDF. Try uploading as DOCX or TXT instead.');
    }
  }

  // Handle DOCX files
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      originalname.toLowerCase().endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      console.log('DOCX parsed successfully, text length:', result.value.length);
      return result.value;
    } catch (e: any) {
      console.error('DOCX parse error:', e.message);
      throw new Error('Failed to parse DOCX file.');
    }
  }

  // Handle TXT files
  if (mimetype === 'text/plain' || originalname.toLowerCase().endsWith('.txt')) {
    const text = buffer.toString('utf-8');
    console.log('TXT parsed successfully, text length:', text.length);
    return text;
  }

  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
}

// Upload and analyze resume
router.post('/analyze', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: { message: 'Job description is required' },
      });
    }

    // Parse the resume file
    const resumeText = await parseResumeFile(req.file);

    // Analyze with ATS
    const analysis = atsAnalyzer.analyze(resumeText, jobDescription);

    res.json({
      success: true,
      data: {
        originalText: resumeText,
        analysis,
      },
    });
  } catch (error) {
    console.error('Upload analyze error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to analyze resume' },
    });
  }
});

// Upload, analyze, and auto-fix resume to score 100
router.post('/auto-fix', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: { message: 'Job description is required' },
      });
    }

    // Parse the resume file
    const resumeText = await parseResumeFile(req.file);

    // Initial analysis
    const initialAnalysis = atsAnalyzer.analyze(resumeText, jobDescription);

    // Use AI to rewrite and optimize the resume text
    const optimizedText = await optimizeResumeText(resumeText, jobDescription, initialAnalysis.missingKeywords);

    // Re-analyze the optimized resume
    const finalAnalysis = atsAnalyzer.analyze(optimizedText, jobDescription);

    // Generate structured resume data
    const structuredResume = await generateStructuredResume(optimizedText, jobDescription);

    res.json({
      success: true,
      data: {
        originalText: resumeText,
        optimizedText: optimizedText,
        structuredResume,
        initialScore: initialAnalysis.score,
        finalScore: finalAnalysis.score,
        initialAnalysis,
        finalAnalysis,
        improvements: {
          scoreIncrease: finalAnalysis.score - initialAnalysis.score,
          keywordsAdded: initialAnalysis.missingKeywords.filter(
            (k) => !finalAnalysis.missingKeywords.includes(k)
          ),
        },
      },
    });
  } catch (error) {
    console.error('Auto-fix error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to optimize resume' },
    });
  }
});

// Parse resume and extract structured info (for Builder upload feature)
router.post('/parse', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    // Parse the resume file
    const resumeText = await parseResumeFile(req.file);

    // Use AI to extract structured data
    const structuredResume = await extractResumeInfo(resumeText);

    res.json({
      success: true,
      data: {
        text: resumeText,
        resume: structuredResume,
      },
    });
  } catch (error) {
    console.error('Parse resume error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to parse resume' },
    });
  }
});

// Helper to extract resume info without JD
async function extractResumeInfo(resumeText: string): Promise<any> {
  const prompt = `Parse this resume text and extract all information into a structured JSON format.

Resume Text:
${resumeText}

Return a JSON object with this exact structure (fill in what you can find, leave empty strings for missing info):
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedIn": "",
    "github": "",
    "portfolio": "",
    "summary": ""
  },
  "experience": [
    {
      "position": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": ""
    }
  ],
  "skills": [
    { "name": "", "category": "technical", "level": "intermediate" }
  ],
  "projects": [
    {
      "name": "",
      "technologies": [],
      "url": "",
      "github": "",
      "bullets": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueDate": "YYYY-MM",
      "expiryDate": "",
      "credentialId": "",
      "url": ""
    }
  ]
}

Extract ALL information from the resume. For dates, convert to YYYY-MM format.
Return ONLY the JSON, no other text.`;

  try {
    const response = await aiService.callAIPublic(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to extract resume info:', error);
    return null;
  }
}

// Helper to optimize resume text with AI
async function optimizeResumeText(resumeText: string, jobDescription: string, missingKeywords: string[]): Promise<string> {
  const prompt = `You are an expert ATS resume optimizer. Rewrite and improve this resume to score 100% on ATS systems for the given job description.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

MISSING KEYWORDS TO ADD:
${missingKeywords.join(', ')}

INSTRUCTIONS:
1. Keep the same structure and format as the original resume
2. Naturally incorporate ALL the missing keywords
3. Improve bullet points with quantifiable achievements
4. Use strong action verbs
5. Make it ATS-friendly (no tables, graphics, special characters)
6. Keep it professional and truthful

Return ONLY the optimized resume text, nothing else.`;

  try {
    const response = await aiService.callAIPublic(prompt);
    return response || resumeText;
  } catch (error) {
    console.error('Failed to optimize resume text:', error);
    return resumeText;
  }
}

// Generate full resume from basic info and JD
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { basicInfo, jobDescription } = req.body;

    if (!basicInfo || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: { message: 'Basic info and job description are required' },
      });
    }

    // Extract keywords from JD
    const jdKeywords = atsAnalyzer.extractKeywords(jobDescription);

    // Generate full resume using AI
    const generatedResume = await generateFullResume(basicInfo, jobDescription, jdKeywords);

    // Analyze the generated resume
    const analysis = atsAnalyzer.analyze(
      JSON.stringify(generatedResume),
      jobDescription
    );

    res.json({
      success: true,
      data: {
        resume: generatedResume,
        analysis,
        keywords: jdKeywords,
      },
    });
  } catch (error) {
    console.error('Generate resume error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate resume' },
    });
  }
});

// Helper function to generate structured resume from text
async function generateStructuredResume(resumeText: string, jobDescription: string): Promise<any> {
  const prompt = `Parse this resume text and convert it to a structured JSON format. Also optimize it for this job description.

Resume Text:
${resumeText}

Job Description:
${jobDescription}

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedIn": "",
    "github": "",
    "portfolio": "",
    "summary": ""
  },
  "experience": [
    {
      "position": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "bullets": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": ""
    }
  ],
  "skills": [
    { "name": "", "category": "technical", "level": "advanced" }
  ],
  "projects": [
    {
      "name": "",
      "technologies": [],
      "url": "",
      "github": "",
      "bullets": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "issueDate": "YYYY-MM",
      "expiryDate": "",
      "credentialId": "",
      "url": ""
    }
  ]
}

Make sure to:
1. Include ALL keywords from the job description naturally in the content
2. Use strong action verbs in bullet points
3. Quantify achievements where possible
4. Optimize the summary for ATS

Return ONLY the JSON, no other text.`;

  try {
    const response = await aiService.callAIPublic(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse structured resume:', error);
    return null;
  }
}

// Helper function to generate full resume from basic info
async function generateFullResume(
  basicInfo: any,
  jobDescription: string,
  keywords: string[]
): Promise<any> {
  const prompt = `Create a complete, ATS-optimized resume based on this basic information and job description.

Basic Information:
${JSON.stringify(basicInfo, null, 2)}

Job Description:
${jobDescription}

Important Keywords to Include:
${keywords.join(', ')}

Generate a complete professional resume that:
1. Scores 100% on ATS systems
2. Includes ALL the important keywords naturally
3. Has compelling, quantified bullet points
4. Has a strong professional summary targeting this specific role
5. Expands on the basic info to create detailed experience descriptions

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "firstName": "${basicInfo.firstName || ''}",
    "lastName": "${basicInfo.lastName || ''}",
    "email": "${basicInfo.email || ''}",
    "phone": "${basicInfo.phone || ''}",
    "location": "${basicInfo.location || ''}",
    "linkedIn": "${basicInfo.linkedIn || ''}",
    "github": "${basicInfo.github || ''}",
    "portfolio": "${basicInfo.portfolio || ''}",
    "summary": "Generate a compelling 3-4 sentence summary"
  },
  "experience": [
    {
      "position": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "bullets": ["5-6 strong bullet points with metrics"]
    }
  ],
  "education": [...],
  "skills": [
    { "name": "skill from keywords", "category": "technical/soft/tool", "level": "beginner/intermediate/advanced/expert" }
  ],
  "projects": [...],
  "certifications": [...]
}

Make the resume highly targeted for the job. Use the exact terminology from the job description.
Return ONLY the JSON, no other text.`;

  try {
    const response = await aiService.callAIPublic(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Failed to generate resume:', error);
    throw error;
  }
}

export default router;
