import { AIMessageChunk } from '@langchain/core/messages'

export const extractContent = (
  response: AIMessageChunk,
  type: 'json' | 'javascript' | 'typescript' | 'markdown'
): string | null => {
  const content =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  if (type === 'javascript') {
    const javascriptRegex = new RegExp(
      `\`\`\`javascript\\n([\\s\\S]*?)\\n\`\`\``
    )
    const match = content.match(javascriptRegex)
    return match?.[1] ?? null
  } else if (type === 'typescript') {
    const typescriptRegex = new RegExp(
      `\`\`\`typescript\\n([\\s\\S]*?)\\n\`\`\``
    )
    const match = content.match(typescriptRegex)
    return match?.[1] ?? null
  } else if (type === 'markdown') {
    const startIndex = content.indexOf('```markdown')
    const endIndex = content.lastIndexOf('```')
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      const markdownContent = content.slice(startIndex + 12, endIndex).trim()
      return markdownContent
    }
  } else if (type === 'json') {
    // Fallback for JSON: check if the response is a string containing JSON
    const jsonRegex = /\{[\s\S]*\}/
    const jsonMatch = content.match(jsonRegex)

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (error) {
        console.error('Error parsing JSON:', error)
        return null
      }
    }
  }
  console.error(`No ${type} found in the response`)
  return null
}

export const extractJSON = (response: AIMessageChunk) =>
  extractContent(response, 'json')
export const extractJavascript = (response: AIMessageChunk) =>
  extractContent(response, 'javascript')
export const extractMarkdown = (response: AIMessageChunk) =>
  extractContent(response, 'markdown')
