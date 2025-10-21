import { OpenAI } from 'openai'

const openAI = new OpenAI();

async function main() {
    const response = await openAI.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'user',
            content: 'What is Mount Hoverla\'s height?'
        }]
    })

    console.info('[chat:response]', response.choices[0].message.content)
}

main()