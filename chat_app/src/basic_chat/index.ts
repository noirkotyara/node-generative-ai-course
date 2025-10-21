import OpenAI from 'openai';

const openAI = new OpenAI();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
    role: "system",
    content: "You a helpful assistant for a student in the cybersecurity field"
}]

async function createChatCompletion() {
    const response = await openAI.chat.completions.create({
        model: 'gpt-4',
        messages: context
    })

    context.push(response.choices[0].message)
    return response
}

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();
    context.push({
        role: 'user',
        content: userInput,
    })

    const response = await createChatCompletion()

    console.log(response.choices[0].message.content)
})