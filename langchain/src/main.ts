import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.2,
    verbose: true,
})

async function fromTemplate() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Write a short description about the city: {city_name}'
    )

    const preparedPrompt = await prompt.format({
        city_name: 'Kyiv'
    })
    console.log('[fromTemplate:preparedPrompt]', preparedPrompt)

    const response = await prompt.invoke({
        city_name: 'Kyiv'
    })
    console.log('[fromTemplate:response]', response)
}

async function main() {
    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Write a short description about the city'],
        ['user', '{city_name}']
    ])

    const chain = prompt.pipe(llm)
    const result = await chain.invoke({
        city_name: 'Kyiv'
    })

    console.log('result', result)
}
