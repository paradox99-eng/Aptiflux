import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '../../../../lib/supabase';
import { getWeekNumber } from '../../../../utils/quizGenerator';

// Set up Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const now = new Date();
    const { year, week } = getWeekNumber(now);
    const weekId = `${year}-W${week}`;

    const prompt = `
Generate exactly 10 multiple-choice aptitude questions covering a mix of topics such as: Number System, Geometry, Time and Work, Time Speed and Distance, Syllogism, Reading Comprehension.
Format the output STRICTLY as a JSON array of objects. Do not include markdown code blocks, do not include any other text.
Each question MUST follow this exact schema:
{
  "id": <random_unique_integer_above_2000>,
  "subtopic": "<topic_name>",
  "text": "<The actual question text>",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "<The exact string of the correct option>",
  "explanation": "<A ONE-SENTENCE mathematical or logical explanation. MUST BE CONCISE.>",
  "passage": null
}

IMPORTANT: Ensure the correctAnswer matches one of the options EXACTLY. Ensure the math is verified. Output ONLY valid JSON array.
`;

    // Wait, the user had an issue with the model earlier (openai/gpt-oss-20b).
    // Let's use the standard groq model to ensure it works, but since they want to use 
    // their own, we'll try llama-3.1-8b-instant which is usually available on free tier.
    // However, they specifically mentioned having a groq free API key.
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "";
    
    // Robust JSON extraction: Find first '[' and last ']'
    let cleanedContent = responseContent.trim();
    const firstBracket = cleanedContent.indexOf('[');
    const lastBracket = cleanedContent.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1);
    }

    let newQuestions = [];
    try {
      // Save raw output for debugging
      const fs = require('fs');
      fs.writeFileSync('last-llm-response.txt', responseContent);
      
      // Clean up common issues like unescaped newlines in JSON strings
      const sanitizedContent = cleanedContent.replace(/\\n/g, "\\n")
                                             .replace(/\n/g, " ")
                                             .replace(/\r/g, "");
      
      newQuestions = JSON.parse(sanitizedContent);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", cleanedContent);
      console.error("Parse Error Message:", parseError.message);
      return NextResponse.json({ 
        error: 'Failed to parse generated questions from LLM.',
        details: parseError.message,
        rawContent: cleanedContent 
      }, { status: 500 });
    }

    if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
      return NextResponse.json({ error: 'LLM returned empty or invalid array.' }, { status: 500 });
    }

    // Assign weeklyIndex to display nicely in frontend
    newQuestions = newQuestions.map((q, idx) => ({
      ...q,
      weeklyIndex: idx + 1,
      weeklyTopic: q.subtopic
    }));

    // Save to Supabase
    const { data, error } = await supabase
      .from('weekly_quizzes')
      .upsert(
        { week_id: weekId, questions: newQuestions },
        { onConflict: 'week_id' }
      );

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      weekId: weekId,
      count: newQuestions.length,
      questions: newQuestions
    });

  } catch (error) {
    console.error("Error generating weekly quiz:", error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
