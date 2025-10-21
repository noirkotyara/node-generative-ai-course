import OpenAI from "openai";
import { encoding_for_model, Tiktoken, TiktokenModel } from "tiktoken";

const openAI = new OpenAI();

type ChatModel = Extract<OpenAI.Chat.ChatModel, TiktokenModel>;

class Chat {
    context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
    encoder!: Tiktoken

    constructor(
        public model: ChatModel,
        public maxTokens: number
    ) {
        this.model = model
        this.maxTokens = maxTokens

        this.initEncoder(this.model)
    }

    initEncoder(model: typeof this.model) {
        this.encoder = encoding_for_model(model)
    }

    public pushToContext(context: OpenAI.Chat.Completions.ChatCompletionMessageParam) {
        this.context.push(context)
    }

    public async provideChatCompletion() {
        const response = await openAI.chat.completions.create({
            model: this.model,
            messages: this.context
        })

        this.context.push(response.choices[0].message)

        if (response.usage && response.usage.total_tokens > this.maxTokens) {
            this.reduceChatContext()
        }

        return response
    }

    private reduceChatContext() {
        const initialContextLength = this.getContextLength()
        let contextLength = initialContextLength

        while (contextLength > this.maxTokens) {
            const oldestContextMessage = this.context.findIndex(message => message.role !== 'system')
            if (oldestContextMessage) {
                this.context.splice(oldestContextMessage, 1)
                contextLength = this.getContextLength()
                console.log('[context-length]', { initialContextLength, contextLength })
            }

            if (contextLength < this.maxTokens) {
                break;
            }
        }
    }

    private getContextLength() {
        let length = 0;

        for (const message of this.context) {
            if (Array.isArray(message.content)) {
                message.content.forEach((content) => {
                    if (content.type == 'text') {
                        length += this.encoder.encode(content.type).length
                    }
                })
            } else if (typeof message.content == 'string') {
                length += this.encoder.encode(message.content).length
            }
        }

        return length
    }
}

export default Chat;



