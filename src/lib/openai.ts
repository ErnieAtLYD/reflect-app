/**
 * OpenAI service utilities for journal reflection processing
 *
 * Handles integration with OpenAI's API to generate meaningful reflections
 * on journal entries, including summaries, patterns, and suggestions.
 */

import OpenAI from 'openai'

import type {
  OpenAIConfig,
  ReflectionResponse,
  PromptTemplate,
  ReflectionRequest,
} from '@/types/ai'

/**
 * Get OpenAI configuration from environment variables
 */
export function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
    fallbackModel: process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo-1106',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000', 10),
  }
}

/**
 * Create OpenAI client instance
 */
export function createOpenAIClient(config: OpenAIConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    timeout: config.timeout,
  })
}

/**
 * Generate a prompt template for journal reflection
 */
export function createPromptTemplate(): PromptTemplate {
  return {
    systemMessage: `You are a compassionate and insightful journal reflection assistant. Your role is to help users gain deeper understanding of their thoughts and experiences through gentle analysis and supportive guidance.

Your responses should be:
- Supportive and non-judgmental
- Insightful but not overly clinical
- Encouraging and forward-looking
- Respectful of the user's privacy and vulnerability

You will analyze journal entries and provide exactly three components:
1. A brief summary (1-2 sentences) capturing the essence of the entry
2. A detected pattern or theme that emerges from the content
3. A gentle, actionable suggestion or reflection prompt

Keep your language warm, accessible, and encouraging. Avoid psychological jargon or making definitive diagnoses. Focus on helping the user reflect and grow.`,

    userMessageTemplate: `Please reflect on this journal entry and provide your insights:

"{content}"

Please respond with exactly three components:
1. **Summary**: A brief 1-2 sentence summary of the key content
2. **Pattern**: An observed pattern, theme, or insight from the entry
3. **Suggestion**: A gentle, actionable suggestion or reflection prompt

Keep your response supportive, non-judgmental, and encouraging.`,
  }
}

/**
 * Process a journal entry with OpenAI
 */
export async function processJournalEntry(
  client: OpenAI,
  config: OpenAIConfig,
  request: ReflectionRequest
): Promise<ReflectionResponse> {
  const startTime = Date.now()
  const template = createPromptTemplate()

  // Prepare the prompt
  const userMessage = template.userMessageTemplate.replace(
    '{content}',
    request.content
  )

  try {
    // Try primary model first
    const response = await callOpenAI(
      client,
      config.model,
      template.systemMessage,
      userMessage,
      config
    )

    return {
      ...response,
      metadata: {
        model: config.model,
        processedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
      },
    }
  } catch (error) {
    console.warn(
      `Primary model (${config.model}) failed, trying fallback:`,
      error
    )

    try {
      // Try fallback model
      const response = await callOpenAI(
        client,
        config.fallbackModel,
        template.systemMessage,
        userMessage,
        config
      )

      return {
        ...response,
        metadata: {
          model: config.fallbackModel,
          processedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
        },
      }
    } catch (fallbackError) {
      console.error('Both models failed:', {
        primary: error,
        fallback: fallbackError,
      })
      throw fallbackError
    }
  }
}

/**
 * Make API call to OpenAI
 */
async function callOpenAI(
  client: OpenAI,
  model: string,
  systemMessage: string,
  userMessage: string,
  config: OpenAIConfig
): Promise<Pick<ReflectionResponse, 'summary' | 'pattern' | 'suggestion'>> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response content from OpenAI')
  }

  // Parse the structured response
  const parsed = parseOpenAIResponse(content)
  return parsed
}

/**
 * Parse OpenAI response into structured format
 */
function parseOpenAIResponse(
  content: string
): Pick<ReflectionResponse, 'summary' | 'pattern' | 'suggestion'> {
  // Try to extract the three components using markdown formatting
  const summaryMatch = content.match(
    /\*\*Summary\*\*:?\s*(.*?)(?=\*\*|\n\n|$)/i
  )
  const patternMatch = content.match(
    /\*\*Pattern\*\*:?\s*(.*?)(?=\*\*|\n\n|$)/i
  )
  const suggestionMatch = content.match(
    /\*\*Suggestion\*\*:?\s*(.*?)(?=\*\*|\n\n|$)/i
  )

  // Fallback: split by numbered lists or line breaks
  if (!summaryMatch || !patternMatch || !suggestionMatch) {
    const lines = content.split('\n').filter((line) => line.trim())

    // Look for numbered format (1., 2., 3.)
    const numbered = lines.filter((line) => /^\d+\./.test(line.trim()))
    if (numbered.length >= 3) {
      return {
        summary: cleanText(numbered[0].replace(/^\d+\.\s*/, '')),
        pattern: cleanText(numbered[1].replace(/^\d+\.\s*/, '')),
        suggestion: cleanText(numbered[2].replace(/^\d+\.\s*/, '')),
      }
    }

    // Fallback: split content into three roughly equal parts
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim())
    const third = Math.ceil(sentences.length / 3)

    return {
      summary: cleanText(sentences.slice(0, third).join('. ') + '.'),
      pattern: cleanText(sentences.slice(third, third * 2).join('. ') + '.'),
      suggestion: cleanText(sentences.slice(third * 2).join('. ') + '.'),
    }
  }

  return {
    summary: cleanText(summaryMatch[1]),
    pattern: cleanText(patternMatch[1]),
    suggestion: cleanText(suggestionMatch[1]),
  }
}

/**
 * Clean and normalize text content
 */
function cleanText(text: string): string {
  return text
    .trim()
    .replace(/^\*\*.*?\*\*:?\s*/, '') // Remove markdown headers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim()
}

/**
 * Generate a content hash for caching
 */
export function generateContentHash(content: string): string {
  // Simple hash function for caching similar content
  let hash = 0
  if (content.length === 0) return hash.toString()

  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36)
}

/**
 * Validate journal entry content
 */
export function validateJournalContent(content: string): {
  isValid: boolean
  error?: string
} {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content is required and must be a string' }
  }

  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Content cannot be empty' }
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'Content must be at least 10 characters long',
    }
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: 'Content must be less than 5000 characters',
    }
  }

  // Check for potentially harmful content patterns
  const suspiciousPatterns = [
    /^(.)\1{20,}/, // Repeated character spam
    /[^\w\s.,!?'"()-]{10,}/, // Too many special characters
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Content appears to contain invalid or spam-like patterns',
      }
    }
  }

  return { isValid: true }
}
