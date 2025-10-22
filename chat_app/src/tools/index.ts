import Chat from "../core/chat";
import OpenAI from "openai";
import { isFunctionCallTool } from "../core/chat.services";
import { getWeather, validWeatherFunctionArguments } from "./weather-tool";

const CHAT_MODEL = 'gpt-4'
const CHAT_SYSTEM: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "system",
    content: "You are a weather forecaster",
}
const MAX_TOKENS = 200;


async function callWeatherTool(
    weatherCallTool: OpenAI.ChatCompletionMessageFunctionToolCall,
    startedChat: Chat
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const functionArguments = JSON.parse(weatherCallTool.function.arguments)
    validWeatherFunctionArguments<{ location: string }>(functionArguments)
    console.log('[weather-chat:functionArguments]', functionArguments);

    const toolResponse = getWeather(functionArguments.location)
    startedChat.pushToContext({
        role: 'tool',
        content: JSON.stringify(toolResponse),
        tool_call_id: weatherCallTool.id
    })

    return startedChat.provideChatCompletion()
}

async function startWeatherChat() {
    const startedChat = new Chat(CHAT_MODEL, MAX_TOKENS)
    startedChat.pushToContext(CHAT_SYSTEM)

    startedChat.addTool({
        type: 'function',
        function: {
            name: "getWeather",
            description: "Get current temperature for a given location.",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "City and country e.g. Bogotá, Colombia",
                    },
                },
                required: ["location"],
                additionalProperties: false,
            }
        }
    })

    startedChat.pushToContext({
        role: 'user',
        content: 'What is the weather like in Kyiv today?',
    })

    const response = await startedChat.provideChatCompletion()

    const responseChoice = response.choices[0];
    const shouldCallTool = responseChoice.finish_reason === "tool_calls";
    console.log('[weather-chat:shouldCallTool]', shouldCallTool);
    if (!shouldCallTool) {
        return;
    }

    const weatherCallTool = responseChoice.message.tool_calls?.find((tool) => {
        return isFunctionCallTool(tool, "getWeather")
    });
    console.log('[weather-chat:weatherCallTool]', JSON.stringify(weatherCallTool));
    if (weatherCallTool) {
        const finalResponse = await callWeatherTool(weatherCallTool, startedChat)
        console.log('[weather-chat:finalResponse]', finalResponse.choices[0].message.content)
    }
}

startWeatherChat();