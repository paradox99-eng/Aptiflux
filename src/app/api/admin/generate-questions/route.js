import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

export async function POST(request) {
  try {
    const { subtopic, numQuestions } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not found in environment variables.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!subtopic || !numQuestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are an expert aptitude question generator.
Generate ${numQuestions} multiple-choice questions for the subtopic "${subtopic}".
Output ONLY a JSON array of objects. Do not include markdown code blocks, explanations, or any other text.
Each object must have exactly this structure:
{
  "text": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string from options that is correct",
  "explanation": "A step-by-step explanation of how to solve it",
  "passage": null
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      stream: false,
      stop: null
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from Groq API");
    }

    // Clean up potential markdown formatting if the model didn't follow instructions perfectly
    let cleanedContent = responseContent.trim();
    const firstBracket = cleanedContent.indexOf('[');
    const lastBracket = cleanedContent.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1);
    }
    
    let generatedQuestions;
    try {
      // Clean up common issues like unescaped newlines in JSON strings
      const sanitizedContent = cleanedContent.replace(/\\n/g, "\\n")
                                             .replace(/\n/g, " ")
                                             .replace(/\r/g, "");
      generatedQuestions = JSON.parse(sanitizedContent);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", cleanedContent);
      console.error("Parse Error Message:", parseError.message);
      return NextResponse.json({ error: 'Failed to parse generated questions from LLM.', details: parseError.message }, { status: 500 });
    }

    // Find the right main topic for this subtopic
    // For now, let's map them. 
    // Quantitative: Number System, Geometry, Time and Work, Time, Speed and Distance
    // Verbal: Reading Comprehension
    // Logical: Syllogism
    let mainTopic = "quantitative";
    if (["Reading Comprehension"].includes(subtopic)) mainTopic = "verbal";
    if (["Syllogism"].includes(subtopic)) mainTopic = "logical";

    // Update questionsData.js
    const filePath = path.join(process.cwd(), 'src', 'questionsData.js');
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace('export const questionsData = ', '');
    if (content.endsWith(';\n')) content = content.slice(0, -2);
    else if (content.endsWith(';')) content = content.slice(0, -1);
    else if (content.endsWith(';\r\n')) content = content.slice(0, -3);

    const data = JSON.parse(content);

    // Find highest ID to increment from
    let maxId = 0;
    Object.keys(data).forEach(key => {
      data[key].questions.forEach(q => {
        if (q.id > maxId) maxId = q.id;
      });
    });

    const newQuestions = generatedQuestions.map((q, index) => ({
      id: maxId + 1 + index,
      subtopic: subtopic,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      passage: q.passage || null
    }));

    if (!data[mainTopic]) {
      // Fallback if somehow it's a new topic
      data[mainTopic] = { title: mainTopic, questions: [] };
    }

    data[mainTopic].questions.push(...newQuestions);

    const newContent = 'export const questionsData = ' + JSON.stringify(data, null, 2) + ';\n';
    fs.writeFileSync(filePath, newContent, 'utf8');

    return NextResponse.json({
      success: true,
      count: newQuestions.length,
      questions: newQuestions
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
