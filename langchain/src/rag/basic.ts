import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
    StringOutputParser,
} from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";

const llm = new ChatOpenAI({
    model: "gpt-4",
    temperature: 0.2,
    verbose: true,
})

const data = [
    'My name is Winston',
    'Also my mommy calls me Win',
    'I like walking outside every morning',
    'And I also like barking at other bigger dogs'
]

async function main() {
    // create memory vector store
    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

    // fill memory vector store with documents
    await vectorStore.addDocuments(data.map(content => (
        new Document({ pageContent: content })
    )))

    const question = 'What I like to do?'

    //get retriever to get relevant documents based on question
    const retriever = vectorStore.asRetriever({
        k: 2
    })
    const relevantQuestionDocuments = await retriever._getRelevantDocuments(question)

    const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'Answer on the question based on provided context {context}'],
        ['user', '{question}']
    ])

    const parser = new StringOutputParser()
    const chain = prompt
        .pipe(llm)
        .pipe(parser)

    const response = await chain.invoke({
        context: relevantQuestionDocuments.map(doc => doc.pageContent).join(','),
        question,
    })

    console.log('[main:response]', response)
}

main()
