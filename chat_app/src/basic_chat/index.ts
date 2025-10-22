import Chat from "../core/chat";
import OpenAI from "openai";

const CHAT_MODEL = 'gpt-4'
const CHAT_SYSTEM: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "system",
    content: "You a helpful assistant for a student in the cybersecurity field"
}
const MAX_TOKENS = 200;

process.stdin.addListener('data', async function(input) {
    const userInput = input.toString().trim();

    const startedChat = new Chat(CHAT_MODEL, MAX_TOKENS)
    startedChat.pushToContext(CHAT_SYSTEM)
    startedChat.pushToContext({
        role: 'user',
        content: userInput,
    })

    const response = await startedChat.provideChatCompletion()

    console.log(response.choices[0].message.content)
})