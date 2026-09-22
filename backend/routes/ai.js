const express = require('express');
const Groq    = require('groq-sdk');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/analyze', async (req, res) => {
  const { resume, jd } = req.body;

  if (!resume?.trim()) return res.status(400).json({ error: 'Resume content is required' });
  if (!jd?.trim())     return res.status(400).json({ error: 'Job description is required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY is not set in .env');
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
  }

  console.log('🤖 AI analyze called');
  console.log('   Resume:', resume.trim().length, 'chars');
  console.log('   JD:', jd.trim().length, 'chars');

  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the resume against the job description and return ONLY a raw JSON object.
No markdown. No backticks. No explanation. Just the JSON.

Required JSON structure:
{
  "atsScore": <integer 0-100>,
  "breakdown": {
    "keywordMatch": <integer 0-35>,
    "skillsAlignment": <integer 0-25>,
    "experienceRelevance": <integer 0-20>,
    "formattingClarity": <integer 0-10>,
    "educationCertifications": <integer 0-10>
  },
  "matched": ["skill1", "skill2"],
  "missing": ["skill3", "skill4"],
  "partial": ["skill5"],
  "topJdKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8","kw9","kw10"],
  "skillGaps": [
    { "skill": "Docker", "importance": "high", "suggestion": "Add containerization projects" }
  ],
  "suggestions": [
    { "area": "Keywords", "action": "Add missing skills to your skills section", "impact": "high" }
  ],
  "summary": "2-3 sentence overall assessment here."
}

RESUME:
${resume.trim()}

JOB DESCRIPTION:
${jd.trim()}`;

  try {
    const groq = new Groq({ apiKey });

    console.log('📤 Calling Groq API...');

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS analyzer. Always respond with valid raw JSON only. No markdown, no backticks, no explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2048,
      
    });

    console.log('📥 Groq responded');

    const raw = completion.choices?.[0]?.message?.content || '';
    console.log('📝 Raw (first 300 chars):', raw.substring(0, 300));

    if (!raw) {
      console.error('❌ Empty response from Groq');
      return res.status(500).json({ error: 'Groq returned empty response. Try again.' });
    }

    // Clean any accidental markdown fences
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('❌ JSON parse failed. Raw:', raw);
      return res.status(500).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    if (typeof parsed.atsScore !== 'number') {
      return res.status(500).json({ error: 'AI response missing atsScore. Please try again.' });
    }

    console.log('✅ Analysis complete. ATS Score:', parsed.atsScore);
    return res.json(parsed);

  } catch (err) {
    console.error('❌ Groq error:', err.message);

    if (err.status === 401) return res.status(500).json({ error: 'Invalid Groq API key. Check GROQ_API_KEY in .env' });
    if (err.status === 429) return res.status(500).json({ error: 'Groq rate limit hit. Wait a moment and retry.' });
    if (err.status === 400) return res.status(500).json({ error: 'Bad request to Groq: ' + err.message });

    return res.status(500).json({ error: 'AI error: ' + err.message });
  }
});

module.exports = router;