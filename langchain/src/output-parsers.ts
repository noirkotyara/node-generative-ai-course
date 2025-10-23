import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import {
    CommaSeparatedListOutputParser,
    StringOutputParser,
    StructuredOutputParser
} from "@langchain/core/output_parsers";

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.2,
    verbose: true,
})

async function stringParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Write a short description about the city: {city_name}'
    )

    const parser = new StringOutputParser()
    const chain = prompt
        .pipe(llm)
        .pipe(parser)
    const response = await chain.invoke({
        city_name: 'Kyiv'
    })

    console.log('[stringParser:response]', response)
}

// stringParser()

async function commaSeparatedParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        'Write 3 name of names for a dog start from letter {letter} divided by comma'
    )

    const parser = new CommaSeparatedListOutputParser()
    const chain = prompt
        .pipe(llm)
        .pipe(parser)
    const response = await chain.invoke({
        letter: 'W'
    })
    console.log('[commaSeparatedParser:response]', response)
}

// commaSeparatedParser()

async function structuredOutputParser() {
    const templatePrompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase.
        Formatting instructions: {format_instructions} 
        Phrase: {phrase}
    `)

    const parser = StructuredOutputParser.fromNamesAndDescriptions({
        name: 'name of the person',
        likes: 'what person likes'
    })

    const chain = templatePrompt
        .pipe(llm)
        .pipe(parser)

    const response = await chain.invoke({
        format_instructions: parser.getFormatInstructions(),
        phrase: 'Winston likes walking in the morning and puppychino'
    })
    console.log('[structuredOutputParser:response]', response)
}

// structuredOutputParser()
