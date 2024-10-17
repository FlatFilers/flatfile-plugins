import { ChatAnthropic } from '@langchain/anthropic'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import {
  BaseMessage,
  BaseMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatOpenAI } from '@langchain/openai'

export class LLMHandler {
  private llm: BaseChatModel
  private messageHistory: BaseMessage[] = []
  private useHistory: boolean

  constructor(model: string, apiKey: string, useHistory: boolean = true) {
    this.llm = this.getLLM(model, apiKey)
    this.useHistory = useHistory
  }

  async handleMessage(
    system: string,
    prompt: string,
    messages?: BaseMessage[]
  ): Promise<BaseMessageChunk> {
    const systemMessage = new SystemMessage({
      content: system,
    })

    const humanMessage = new HumanMessage({
      content: prompt,
    })

    const allMessages = [
      systemMessage,
      ...(this.useHistory ? this.messageHistory : []),
      ...(messages || []),
      humanMessage,
    ]

    const result = await this.llm.invoke(allMessages)

    if (this.useHistory) {
      this.messageHistory.push(humanMessage)
      this.messageHistory.push(result)
    }

    return result
  }

  clearMessageHistory() {
    this.messageHistory = []
  }

  setUseHistory(useHistory: boolean) {
    this.useHistory = useHistory
  }

  private getLLM(model: string, apiKey: string): BaseChatModel {
    switch (model) {
      case 'gpt-4o':
      case 'gpt-4-turbo':
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        return new ChatOpenAI({
          apiKey,
          model,
          temperature: 0,
        })
      case 'claude-3-opus-20240229':
      case 'claude-3-sonnet-20240229':
      case 'claude-3-haiku-20240307':
        return new ChatAnthropic({
          apiKey,
          model,
          temperature: 0,
        })
      case 'mistral-large-latest':
      case 'mistral-small-latest':
        return new ChatMistralAI({
          apiKey,
          model,
          temperature: 0,
        })
      default:
        throw new Error(`Unsupported model: ${model}`)
    }
  }
}
