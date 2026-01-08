import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const ContentScreenSchema = z.object({
  screens: z.array(z.object({
    type: z.enum(['content', 'instruction', 'example']),
    title: z.string(),
    content: z.string(),
    image: z.string().optional(),
    audio_enabled: z.boolean().optional()
  }))
})

const QuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    instruction: z.string(),
    // For pronunciation questions
    phrase: z.string().optional(),
    language: z.string().optional(),
    phonetic: z.string().optional(),
    // For multiple choice questions
    question: z.string().optional(),
    options: z.array(z.string()).optional(),
    correct_answer: z.number().optional()
  }))
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, tutorialInfo, generateType } = await req.json()

    if (!prompt || !tutorialInfo || !generateType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { title, description, category, difficulty_level } = tutorialInfo

    if (generateType === 'content') {
      // Generate content screens
      const systemPrompt = `You are an expert educational content creator for children aged 5-16. 
Create engaging, age-appropriate content screens for a tutorial.

Tutorial Details:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Difficulty Level: ${difficulty_level}/10

Guidelines:
- Use simple, clear language appropriate for the difficulty level
- Include emojis to make content engaging
- Break complex concepts into digestible chunks
- Use the 'content' type for introductions and explanations
- Use the 'instruction' type for step-by-step guidance
- Use the 'example' type for demonstrations
- Keep content concise (2-3 sentences per screen)
- Enable audio for instruction screens`

      const result = await generateObject({
        model: google('gemini-3-pro-preview'),
        schema: ContentScreenSchema,
        prompt: `${systemPrompt}\n\nUser Request: ${prompt}`
      })

      return NextResponse.json(result.object)
    } else {
      // Generate questions
      const isSpeaking = category === 'speaking'
      
      const systemPrompt = `You are an expert educational content creator for children aged 5-16.
Create ${isSpeaking ? 'pronunciation practice questions' : 'multiple choice questions'} for a tutorial.

Tutorial Details:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- Difficulty Level: ${difficulty_level}/10

STRICT JSON RULES:
- Generate VALID JSON only
- NO emojis in questions/options
- NO duplicate content
- Questions: max 30 characters
- Options: max 30 characters each
- Use simple English words only
- NO special characters

${isSpeaking ? `For pronunciation questions:
- type: "pronunciation"
- phrase: under 30 chars
- phonetic: IPA format
- language: "en"
- instruction: under 30 chars` : `For multiple choice questions:
- type: "multiple_choice"
- question: under 30 chars
- 4 options: each under 30 chars
- correct_answer: number (0-3)`}

MUST FOLLOW THIS EXACT FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "instruction": "Choose answer",
      "question": "What splits light?",
      "options": ["Mirror", "Prism", "Glass", "Water"],
      "correct_answer": 1
    }
  ]
}`

      const result = await generateObject({
        model: google('gemini-3-pro-preview'),
        schema: QuestionsSchema,
        prompt: `${systemPrompt}\n\nUser Request: ${prompt}`,
        maxRetries: 3
      })

      // Validate and clean the result
      if (!result.object || !result.object.questions || !Array.isArray(result.object.questions)) {
        throw new Error('Invalid response structure from AI')
      }

      const cleanedQuestions = result.object.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        type: q.type || 'multiple_choice',
        instruction: (q.instruction || 'Choose answer').substring(0, 30),
        ...(q.question && { question: q.question.substring(0, 30) }),
        ...(q.options && { options: q.options.map((opt: string) => opt.substring(0, 30)) }),
        ...(q.correct_answer !== undefined && { correct_answer: q.correct_answer }),
        ...(q.phrase && { phrase: q.phrase.substring(0, 30) }),
        ...(q.language && { language: q.language }),
        ...(q.phonetic && { phonetic: q.phonetic })
      }))

      return NextResponse.json({ questions: cleanedQuestions })
    }
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
