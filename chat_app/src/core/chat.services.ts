import OpenAI from "openai";

export function isFunctionCallTool(
    tool: OpenAI.ChatCompletionMessageToolCall,
    expectedFunctionName: string
): tool is OpenAI.ChatCompletionMessageFunctionToolCall {
    return tool.type === "function" && tool.function.name === expectedFunctionName
}
