import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1024

export const UPDATE_PROFILE_TOOL = {
  name: 'update_user_profile',
  description: 'Extract and save personal information the user has shared about themselves. Call this whenever the user reveals facts about themselves: name, age, goals, preferences, work details, habits, etc. Only include fields where the user clearly stated something.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: "User's first name or full name if mentioned" },
      age: { type: 'number', description: "User's age if stated" },
      fitnessGoals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Fitness or workout goals the user mentioned (e.g. "lose 10 lbs", "run 5k")',
      },
      dietPreferences: {
        type: 'array',
        items: { type: 'string' },
        description: 'Diet preferences, restrictions, or goals (e.g. "no dairy", "high protein", "intermittent fasting")',
      },
      financialGoals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Financial goals or plans (e.g. "save $5000", "pay off credit card")',
      },
      workDetails: {
        type: 'object',
        description: 'Details about their job or internship',
        properties: {
          role: { type: 'string' },
          company: { type: 'string' },
          notes: { type: 'array', items: { type: 'string' } },
        },
      },
      habitGoals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Habits they want to build or track',
      },
      miscFacts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Any other personal facts worth remembering (school, city, hobbies, etc.)',
      },
    },
  },
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function sendChatMessage({ messages, systemPrompt, onProfileUpdate }) {
  const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    tools: [UPDATE_PROFILE_TOOL],
    messages,
  })

  if (response.stop_reason === 'tool_use') {
    const toolUseBlock = response.content.find(b => b.type === 'tool_use')
    if (toolUseBlock && toolUseBlock.name === 'update_user_profile') {
      onProfileUpdate(toolUseBlock.input)
    }

    const messagesWithResult = [
      ...messages,
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: 'Profile updated successfully.',
          },
        ],
      },
    ]

    const finalResponse = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [UPDATE_PROFILE_TOOL],
      messages: messagesWithResult,
    })

    const textBlock = finalResponse.content.find(b => b.type === 'text')
    return textBlock?.text || ''
  }

  const textBlock = response.content.find(b => b.type === 'text')
  return textBlock?.text || ''
}
