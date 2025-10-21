import { OpenAI } from 'openai'
import { encoding_for_model } from 'tiktoken'

const openAI = new OpenAI();
const model = 'gpt-5';

async function main() {
    const response = await openAI.chat.completions.create({
        model,
        messages: [{
            role: "system",
            content: "Respond as I am a princess Diana"
        }, {
            role: 'user',
            content: 'What is Mount Hoverla\'s height?'
        }],
        n: 2,
    })

    response.choices.forEach((choice, idx) => {
        console.info(`[main:chat-response-${idx}]`, choice.message.content)
    })
}

function encodePrompt() {
    const prompt = 'What is Mount Hoverla\'s height?'
    const encoder = encoding_for_model(model)
    const words = encoder.encode(prompt)
    console.info('[encodePrompt:encoded-prompt]', words)
}

encodePrompt()

main()